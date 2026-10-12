"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { AUTH_LOGOUT_EVENT } from "@/lib/auth-events";
import { streamAiChat } from "@/services/ai-chat.service";
import { useUserDetail } from "@/hooks/useUser";

import type {
  TradeProAiConversation,
  TradeProAiMessage,
} from "./types";

const LEGACY_CHAT_SESSION_STORAGE_KEY = "tradepro-ai-chat-session-v1";
const CHAT_STORAGE_KEY_PREFIX = "tradepro-ai-chat-history-v2";
const MAX_STORED_MESSAGES = 100;

type StoredChatSession = {
  activeConversationId?: string;
  conversations: TradeProAiConversation[];
};

function isStoredMessage(value: unknown): value is TradeProAiMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Partial<TradeProAiMessage>;

  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    typeof message.createdAt === "string"
  );
}

function getChatStorageKey(userId: string): string {
  return `${CHAT_STORAGE_KEY_PREFIX}:${userId}`;
}

function readStoredChatSession(
  storage: Storage,
  storageKey: string,
): StoredChatSession | null {
  try {
    const storedValue = storage.getItem(storageKey);
    if (!storedValue) return null;

    const parsed = JSON.parse(storedValue) as Partial<StoredChatSession>;
    if (!Array.isArray(parsed.conversations)) return null;

    const conversations = parsed.conversations
      .filter((conversation): conversation is TradeProAiConversation => {
        if (!conversation || typeof conversation !== "object") return false;
        const candidate = conversation as Partial<TradeProAiConversation>;
        return (
          typeof candidate.id === "string" &&
          typeof candidate.title === "string" &&
          typeof candidate.updatedAt === "string" &&
          Array.isArray(candidate.messages)
        );
      })
      .map((conversation) => ({
        ...conversation,
        messages: conversation.messages
          .filter(isStoredMessage)
          .filter(({ role, content }) => role === "user" || content.trim())
          .slice(-MAX_STORED_MESSAGES),
      }));

    const activeConversationId = conversations.some(
      ({ id }) => id === parsed.activeConversationId,
    )
      ? parsed.activeConversationId
      : conversations[0]?.id;

    return { conversations, activeConversationId };
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
}

function restoreChatSession(userId: string): StoredChatSession | null {
  const storageKey = getChatStorageKey(userId);
  const savedSession = readStoredChatSession(window.localStorage, storageKey);

  if (savedSession) {
    return savedSession;
  }

  const legacySession = readStoredChatSession(
    window.sessionStorage,
    LEGACY_CHAT_SESSION_STORAGE_KEY,
  );

  if (legacySession) {
    window.localStorage.setItem(storageKey, JSON.stringify(legacySession));
    window.sessionStorage.removeItem(LEGACY_CHAT_SESSION_STORAGE_KEY);
  }

  return legacySession;
}

function createMessage(
  role: TradeProAiMessage["role"],
  content: string,
): TradeProAiMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function useTradeProAiChat() {
  const userQuery = useUserDetail();
  const userId = userQuery.data?.data.id;
  const [conversations, setConversations] = useState<TradeProAiConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = useMemo(
    () => conversations.find(({ id }) => id === activeConversationId),
    [activeConversationId, conversations],
  );

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    setConversations([]);
    setActiveConversationId(undefined);
    setHasRestoredSession(false);

    queueMicrotask(() => {
      if (cancelled) return;
      const storedSession = restoreChatSession(userId);
      if (storedSession) {
        setConversations(storedSession.conversations);
        setActiveConversationId(storedSession.activeConversationId);
      }
      setHasRestoredSession(true);
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!hasRestoredSession || !userId) return;

    try {
      window.localStorage.setItem(
        getChatStorageKey(userId),
        JSON.stringify({
          conversations,
          activeConversationId,
        } satisfies StoredChatSession),
      );
    } catch {
      // The current conversation remains usable if browser storage is full.
    }
  }, [activeConversationId, conversations, hasRestoredSession, userId]);

  useEffect(() => {
    const stopStreaming = () => {
      abortControllerRef.current?.abort();
      setIsStreaming(false);
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, stopStreaming);
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, stopStreaming);
      abortControllerRef.current?.abort();
    };
  }, []);

  function newConversation() {
    abortControllerRef.current?.abort();
    setActiveConversationId(undefined);
    setIsStreaming(false);
  }

  async function sendMessage(rawPrompt: string) {
    const prompt = rawPrompt.trim();

    if (!prompt || isStreaming) {
      return;
    }

    const currentConversation = activeConversation;
    const conversationId = currentConversation?.id ?? crypto.randomUUID();
    const userMessage = createMessage("user", prompt);
    const assistantMessage = createMessage("assistant", "");
    const updatedAt = new Date().toISOString();

    if (!currentConversation) {
      setActiveConversationId(conversationId);
      setConversations((current) => [
        {
          id: conversationId,
          title: prompt.slice(0, 58),
          updatedAt,
          messages: [userMessage, assistantMessage],
        },
        ...current,
      ]);
    } else {
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        updatedAt,
        messages: [...conversation.messages, userMessage, assistantMessage],
      }));
    }

    setIsStreaming(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      await streamAiChat({
        message: prompt,
        history: (currentConversation?.messages ?? [])
          .filter(({ content }) => content.trim())
          .slice(-12)
          .map(({ role, content }) => ({ role, content })),
        signal: abortController.signal,
        onChunk: (content, source) => {
          updateConversation(conversationId, (conversation) => ({
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content, source }
                : message,
            ),
          }));
        },
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const errorMessage = error instanceof Error
        ? error.message
        : "Unable to contact the assistant.";

      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.id === assistantMessage.id
            ? {
                ...message,
                content: `Sorry, I could not respond: ${errorMessage}`,
                failedPrompt: prompt,
              }
            : message,
        ),
      }));
    } finally {
      if (abortControllerRef.current === abortController) {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    }
  }

  function updateConversation(
    conversationId: string,
    updater: (conversation: TradeProAiConversation) => TradeProAiConversation,
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId ? updater(conversation) : conversation,
      ),
    );
  }

  return {
    activeConversation,
    activeConversationId,
    conversations,
    isStreaming,
    newConversation,
    selectConversation: setActiveConversationId,
    sendMessage,
  };
}
