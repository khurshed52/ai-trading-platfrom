import tradeproKnowledge from "@/content/tradepro-knowledge.json";
import { ROUTES } from "@/constants/routes";
import { depositMethods } from "@/constants/deposit-methods";

function normalizeQuestion(message: string): string {
  return message.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function formatList(items: readonly string[]): string {
  return items.map((item) => `- **${item}**`).join("\n");
}

function getDepositMethodsAnswer(): string {
  const methods = depositMethods.map(
    ({ title, processingTime, feeLabel }) =>
      `${title} — ${processingTime}; ${feeLabel}`,
  );

  return [
    "TradePro currently provides these deposit methods:",
    "",
    formatList(methods),
    "",
    `[Open Deposit Funds](${ROUTES.FUNDS.DEPOSIT}).`,
  ].join("\n");
}

function getWithdrawalInstructions(): string {
  const availableBalance = tradeproKnowledge.withdrawals.facts.find(
    ({ topic }) => topic === "availableBalance",
  );
  const balanceNote =
    availableBalance && typeof availableBalance.value === "string"
      ? availableBalance.value
      : "Only your available withdrawable balance can be requested.";

  return [
    "To request withdrawal of all available funds:",
    "",
    `1. [Open the Withdraw Funds page](${ROUTES.FUNDS.WITHDRAW}).`,
    "2. Select the trading account you want to withdraw from.",
    "3. Enter that account’s available withdrawable amount and choose the payout currency.",
    "4. Review the converted amount, then submit the withdrawal request.",
    "5. If you have funds in multiple trading accounts, repeat these steps for each account.",
    "",
    `**Important:** ${balanceNote}`,
    "",
    "The displayed account balance may therefore be higher than the amount currently available to withdraw.",
  ].join("\n");
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
      `${number}. **${title}** — ${description}${
        title === "Open a Trading Account"
          ? ` [Open the Accounts page](${ROUTES.ACCOUNTS.ROOT}).`
          : ""
      }`,
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
    /\bwithdraw(?:al|als|ing|n)?\b/.test(question) &&
    /\b(?:want|need|would like|how|can i|help|guide|request|make|all|money|funds?)\b/.test(
      question,
    ) &&
    !/\b(?:status|history|pending|waiting|delay|delayed|why)\b/.test(question)
  ) {
    return getWithdrawalInstructions();
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
    /\bhow (?:can|do) i (?:register|create|open) (?:an? )?(?:trading )?account\b/.test(
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
