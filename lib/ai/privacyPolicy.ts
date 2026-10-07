import path from "node:path";
import { pathToFileURL } from "node:url";

import { PDFParse } from "pdf-parse";

const pdfWorkerPath = path.join(
  process.cwd(),
  "node_modules",
  "pdf-parse",
  "dist",
  "pdf-parse",
  "esm",
  "pdf.worker.mjs",
);

PDFParse.setWorker(pathToFileURL(pdfWorkerPath).href);

const PRIVACY_POLICY = {
  title: "Dragonfly Markets Privacy Policy (test source)",
  url: "https://dragonflyfx.com/docs/PrivacyPolicy.pdf",
  hostname: "dragonflyfx.com",
} as const;

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_EXCERPT_LENGTH = 1_600;

type PolicySection = {
  heading: string;
  content: string;
};

type PolicyCache = {
  expiresAt: number;
  sections: PolicySection[];
};

let policyCache: PolicyCache | null = null;

const POLICY_TOPICS: Array<{
  pattern: RegExp;
  sectionHeading: string;
}> = [
  {
    pattern:
      /\baccount security\b|\b(?:keep|protect|secure|share|disclose|responsible|confidential).*\b(?:password|username|credentials?|authentication codes?)\b|\b(?:password|username|credentials?|authentication codes?).*\b(?:protect|secure|share|disclose|responsible|confidential)\b/i,
    sectionHeading: "14. CLIENT ACCOUNT SECURITY",
  },
  {
    pattern: /\b(?:security|secure|protect|protection|encryption|firewall)\b/i,
    sectionHeading: "13. DATA SECURITY",
  },
  {
    pattern: /\b(?:what|which) (?:personal )?(?:data|information).*collect\b|\bcollect(?:ed|ion)?\b/i,
    sectionHeading: "3. PERSONAL INFORMATION WE COLLECT",
  },
  {
    pattern: /\bhow.*collect|\bsource of (?:my )?(?:data|information)\b/i,
    sectionHeading: "4. HOW WE COLLECT PERSONAL INFORMATION",
  },
  {
    pattern: /\b(?:use|purpose|process).*personal (?:data|information)\b/i,
    sectionHeading: "6. HOW WE USE PERSONAL INFORMATION",
  },
  {
    pattern: /\b(?:share|sharing|disclose|disclosure).*personal (?:data|information)\b/i,
    sectionHeading: "10. DISCLOSURE OF PERSONAL INFORMATION",
  },
  {
    pattern: /\b(?:international transfer|transfer.*(?:country|overseas|abroad))\b/i,
    sectionHeading: "12. INTERNATIONAL TRANSFERS",
  },
  {
    pattern: /\b(?:retain|retention|keep).*personal (?:data|information)|\bhow long.*(?:data|information)\b/i,
    sectionHeading: "16. DATA RETENTION",
  },
  {
    pattern: /\b(?:close|closed|delete|deletion).*account.*(?:data|information|retain|retention)\b/i,
    sectionHeading: "17. RETENTION FOLLOWING ACCOUNT CLOSURE OR DELETION REQUEST",
  },
  {
    pattern: /\bcookies?\b/i,
    sectionHeading: "18. COOKIES AND SIMILAR TECHNOLOGIES",
  },
  {
    pattern: /\b(?:privacy rights?|access my data|correct my data|delete my data)\b/i,
    sectionHeading: "21. YOUR PRIVACY RIGHTS",
  },
  {
    pattern: /\b(?:marketing|opt out|unsubscribe)\b/i,
    sectionHeading: "22. MARKETING PREFERENCES",
  },
  {
    pattern: /\b(?:children|child|minor|minors)\b/i,
    sectionHeading: "23. CHILDREN AND MINORS",
  },
  {
    pattern: /\b(?:privacy complaint|complain.*privacy)\b/i,
    sectionHeading: "27. COMPLAINTS",
  },
  {
    pattern: /\b(?:privacy contact|contact.*privacy|data protection contact)\b/i,
    sectionHeading: "28. CONTACT DETAILS",
  },
  {
    pattern: /\bprivacy policy\b/i,
    sectionHeading: "1. INTRODUCTION",
  },
];

export function isPrivacyPolicyQuestion(message: string): boolean {
  return POLICY_TOPICS.some(({ pattern }) => pattern.test(message));
}

function validatePolicyUrl(): URL {
  const url = new URL(PRIVACY_POLICY.url);

  if (url.protocol !== "https:" || url.hostname !== PRIVACY_POLICY.hostname) {
    throw new Error("The privacy-policy source is not approved.");
  }

  return url;
}

function extractSections(text: string): PolicySection[] {
  const cleanText = text
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/\r/g, "")
    .trim();
  const headingPattern = /^\d+(?:\.\d+)*\.?\s+[A-Z][A-Z &–—,/'()-]+$/gm;
  const matches = [...cleanText.matchAll(headingPattern)];

  return matches.map((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? cleanText.length;

    return {
      heading: match[0].trim(),
      content: cleanText
        .slice(start, end)
        .replace(/\s+/g, " ")
        .trim(),
    };
  });
}

async function downloadAndParsePolicy(): Promise<PolicySection[]> {
  const url = validatePolicyUrl();
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
    headers: {
      Accept: "application/pdf",
    },
  });

  if (!response.ok) {
    throw new Error("The privacy-policy document could not be downloaded.");
  }

  const declaredSize = Number(response.headers.get("content-length") || 0);

  if (declaredSize > MAX_PDF_BYTES) {
    throw new Error("The privacy-policy document is too large.");
  }

  const data = new Uint8Array(await response.arrayBuffer());

  if (data.byteLength > MAX_PDF_BYTES) {
    throw new Error("The privacy-policy document is too large.");
  }

  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    const sections = extractSections(result.text);

    if (!sections.length) {
      throw new Error("No searchable privacy-policy text was found.");
    }

    return sections;
  } finally {
    await parser.destroy();
  }
}

async function getPolicySections(): Promise<PolicySection[]> {
  if (policyCache && policyCache.expiresAt > Date.now()) {
    return policyCache.sections;
  }

  try {
    const sections = await downloadAndParsePolicy();
    policyCache = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      sections,
    };

    return sections;
  } catch (error) {
    if (policyCache) {
      return policyCache.sections;
    }

    throw error;
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_[\]<>])/g, "\\$1");
}

export async function getPrivacyPolicyAnswer(
  message: string,
): Promise<string | null> {
  const topic = POLICY_TOPICS.find(({ pattern }) => pattern.test(message));

  if (!topic) {
    return null;
  }

  try {
    const sections = await getPolicySections();
    const section = sections.find(
      ({ heading }) => heading === topic.sectionHeading,
    );

    if (!section) {
      throw new Error("The requested privacy-policy section was not found.");
    }

    const excerpt = section.content.slice(0, MAX_EXCERPT_LENGTH).trim();

    return [
      `**${PRIVACY_POLICY.title} — ${section.heading}**`,
      "",
      escapeMarkdown(excerpt),
      "",
      `[Read the full Privacy Policy](${PRIVACY_POLICY.url})`,
    ].join("\n");
  } catch (error) {
    console.error("Privacy policy lookup error:", error);

    return `The test privacy-policy source is temporarily unavailable. [Open the full Privacy Policy](${PRIVACY_POLICY.url})`;
  }
}
