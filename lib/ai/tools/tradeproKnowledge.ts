import tradeproKnowledge from "@/content/tradepro-knowledge.json";
import { depositMethods } from "@/constants/deposit-methods";

export function getTradeProKnowledge(
  topic: string,
) {
  const depositFacts = tradeproKnowledge.deposits.facts.map((fact) =>
    fact.topic === "supportedMethods"
      ? {
          ...fact,
          value: depositMethods.map(
            ({ title, processingTime, feeLabel }) => ({
              title,
              processingTime,
              feeLabel,
            }),
          ),
        }
      : fact,
  );

  return {
    topic: topic.trim(),
    knowledge: {
      ...tradeproKnowledge,
      deposits: {
        ...tradeproKnowledge.deposits,
        facts: depositFacts,
      },
    },
  };
}

export type TradeProKnowledgeResult = ReturnType<typeof getTradeProKnowledge>;
