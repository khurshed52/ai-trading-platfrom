"use client";

import { useMemo, useState } from "react";
import { Button, Empty, Input } from "antd";
import { MessageSquare, Plus, Search } from "lucide-react";

import type { TradeProAiConversation } from "./types";

type ConversationPanelProps = {
  conversations: TradeProAiConversation[];
  activeConversationId?: string;
  onNewChat: () => void;
  onSelect: (conversationId: string) => void;
};

export function ConversationPanel({
  conversations,
  activeConversationId,
  onNewChat,
  onSelect,
}: ConversationPanelProps) {
  const [search, setSearch] = useState("");
  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? conversations.filter(({ title, messages }) =>
          [title, ...messages.map(({ content }) => content)]
            .join(" ")
            .toLowerCase()
            .includes(query),
        )
      : conversations;
  }, [conversations, search]);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2 text-base font-semibold text-slate-950">
          <MessageSquare size={18} className="text-blue-600" />
          Conversations
        </div>
        <Button type="primary" icon={<Plus size={15} />} onClick={onNewChat}>
          New Chat
        </Button>
      </div>

      <div className="p-3 pb-2">
        <Input
          allowClear
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          prefix={<Search size={15} className="text-slate-400" />}
          placeholder="Search conversations..."
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filteredConversations.length ? (
          <div className="space-y-1.5">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Today
            </p>
            {filteredConversations.map((conversation) => {
              const preview = conversation.messages
                .findLast(({ role, content }) => role === "assistant" && content)
                ?.content;
              const selected = conversation.id === activeConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-blue-200 bg-blue-50"
                      : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <MessageSquare size={16} className="mt-0.5 shrink-0 text-blue-600" />
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold text-slate-900">
                        {conversation.title}
                      </p>
                      <p className="mb-0 mt-1 truncate text-xs text-slate-500">
                        {preview || "Waiting for TradePro AI..."}
                      </p>
                    </div>
                    <time className="shrink-0 text-[10px] text-slate-400">
                      {new Intl.DateTimeFormat(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(conversation.updatedAt))}
                    </time>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={search ? "No matching conversations" : "No conversations yet"}
            className="!mt-16"
          />
        )}
      </div>
      <p className="m-0 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400">
        Conversations are saved in this browser for your account.
      </p>
    </section>
  );
}
