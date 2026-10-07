import tradeproKnowledge from "@/content/tradepro-knowledge.json";

export type TradeProKnowledgeResult = {
  topic: string;
  knowledge: typeof tradeproKnowledge;
};

export function getTradeProKnowledge(
  topic: string,
): TradeProKnowledgeResult {
  return {
    topic: topic.trim(),
    knowledge: tradeproKnowledge,
  };
}
