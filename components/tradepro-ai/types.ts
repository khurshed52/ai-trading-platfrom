import type { AiAnswerSource, AiChatRole } from "@/services/ai-chat.service";

export type TradeProAiMessage = {
  id: string;
  role: AiChatRole;
  content: string;
  createdAt: string;
  source?: AiAnswerSource;
  failedPrompt?: string;
};

export type TradeProAiConversation = {
  id: string;
  title: string;
  updatedAt: string;
  messages: TradeProAiMessage[];
};
