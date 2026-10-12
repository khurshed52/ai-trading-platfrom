"use client";

import { useState } from "react";
import { Drawer } from "antd";

import { AiContextPanel } from "./ai-context-panel";
import { AiHero } from "./ai-hero";
import { ChatWorkspace } from "./chat-workspace";
import { ConversationPanel } from "./conversation-panel";
import { useTradeProAiChat } from "./use-tradepro-ai-chat";

export function TradeProAiPage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const chat = useTradeProAiChat();

  function selectConversation(conversationId: string) {
    chat.selectConversation(conversationId);
    setHistoryOpen(false);
  }

  const conversations = (
    <ConversationPanel
      conversations={chat.conversations}
      activeConversationId={chat.activeConversationId}
      onNewChat={() => {
        chat.newConversation();
        setHistoryOpen(false);
      }}
      onSelect={selectConversation}
    />
  );

  return (
    <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
      <div className="min-w-0 space-y-4">
        <AiHero />

        <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(270px,36fr)_minmax(0,64fr)]">
          <div className="hidden min-w-0 md:block">
            {conversations}
          </div>
          <div className="min-w-0">
            <ChatWorkspace
              conversation={chat.activeConversation}
              isStreaming={chat.isStreaming}
              onOpenHistory={() => setHistoryOpen(true)}
              onSend={chat.sendMessage}
            />
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <AiContextPanel onAsk={(prompt) => void chat.sendMessage(prompt)} />
      </div>

      <Drawer
        title="Conversations"
        placement="left"
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        width={320}
        className="md:!hidden"
        styles={{ body: { padding: 12, background: "#f4f7fb" } }}
      >
        {conversations}
      </Drawer>
    </div>
  );
}
