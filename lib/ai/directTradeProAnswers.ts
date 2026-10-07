import tradeproKnowledge from "@/content/tradepro-knowledge.json";

function normalizeQuestion(message: string): string {
  return message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function formatList(items: readonly string[]): string {
  return items.map((item) => `- **${item}**`).join("\n");
}

function getDepositMethodsAnswer(): string | null {
  const fact = tradeproKnowledge.deposits.facts.find(
    ({ topic }) => topic === "supportedMethods",
  );

  return fact && Array.isArray(fact.value)
    ? `TradePro supports these deposit methods:\n\n${formatList(fact.value)}`
    : null;
}

function getAccountTypesAnswer(): string {
  const accountNames = tradeproKnowledge.accountTypes.offered.map(
    ({ name }) => name,
  );

  return `TradePro offers these account types:\n\n${formatList(accountNames)}`;
}

function getPlatformsAnswer(message: string): string | null {
  if (/\bctrader\b/.test(message)) {
    const cTrader = tradeproKnowledge.tradingPlatforms.notOffered.find(
      ({ name }) => name.toLowerCase() === "ctrader",
    );

    return cTrader?.note ?? null;
  }

  const platforms = tradeproKnowledge.tradingPlatforms.offered.map(
    ({ name, shortName, devices }) =>
      `- **${name} (${shortName})** — ${devices.join(", ")}`,
  );

  return `TradePro provides:\n\n${platforms.join("\n")}`;
}

function getRegistrationAnswer(): string | null {
  const registration = tradeproKnowledge.registration.facts.find(
    ({ topic }) => topic === "registrationFlow",
  );

  if (!registration) {
    return null;
  }

  const steps = registration.steps.map(
    ({ number, title, description }) =>
      `${number}. **${title}** — ${description}`,
  );

  return `${registration.summary}\n\n${steps.join("\n")}`;
}

function getWithdrawalAnswer(topic: string): string | null {
  const fact = tradeproKnowledge.withdrawals.facts.find(
    (withdrawalFact) => withdrawalFact.topic === topic,
  );

  if (!fact || typeof fact.value !== "string") {
    return null;
  }

  const note = "note" in fact && fact.note ? ` ${fact.note}` : "";

  return `${fact.value}${note}`;
}

function getSwapFreeAnswer(): string | null {
  const account = tradeproKnowledge.accountTypes.offered.find(({ name }) =>
    name.toLowerCase().includes("swap-free"),
  );

  return account
    ? `Yes. TradePro offers an **${account.name}**.`
    : null;
}

function getSupportAnswer(): string | null {
  const support = tradeproKnowledge.support.facts.find(
    ({ topic }) => topic === "availability",
  );

  return support
    ? `TradePro provides **${support.value}**. Specific contact channels are not included in the currently approved information.`
    : null;
}

export function getDirectTradeProAnswer(message: string): string | null {
  const question = normalizeQuestion(message);

  if (
    /\bctrader\b/.test(question) &&
    /\b(?:tradepro|provide|support|available|offer|have)\b/.test(question)
  ) {
    return getPlatformsAnswer(question);
  }

  if (
    /\b(?:trading )?platforms?\b/.test(question) &&
    /\b(?:tradepro|provide|support|available|offer|have|use)\b/.test(question)
  ) {
    return getPlatformsAnswer(question);
  }

  if (
    /\b(?:deposit|payment) methods?\b/.test(question) ||
    /\b(?:how|where) (?:can|do) i deposit\b/.test(question)
  ) {
    return getDepositMethodsAnswer();
  }

  if (
    /\baccount types?\b/.test(question) ||
    /\b(?:which|what) accounts? (?:do you|does tradepro) (?:offer|provide|have)\b/.test(
      question,
    )
  ) {
    return getAccountTypesAnswer();
  }

  if (
    /\bregistration (?:flow|process|steps)\b/.test(question) ||
    /\bhow (?:can|do) i (?:register|create|open) (?:an? )?account\b/.test(
      question,
    )
  ) {
    return getRegistrationAnswer();
  }

  if (
    /\b(?:cancel|cancellation)\b/.test(question) &&
    /\bwithdrawal\b/.test(question)
  ) {
    return getWithdrawalAnswer("pendingCancellation");
  }

  if (
    /\b(?:how long|processing time|how many days)\b/.test(question) &&
    /\bwithdrawal\b/.test(question)
  ) {
    return getWithdrawalAnswer("processingTime");
  }

  if (/\b(?:swap free|islamic) account\b/.test(question)) {
    return getSwapFreeAnswer();
  }

  if (
    /\b(?:customer service|contact support|support availability|24 [57] support)\b/.test(
      question,
    )
  ) {
    return getSupportAnswer();
  }

  return null;
}
