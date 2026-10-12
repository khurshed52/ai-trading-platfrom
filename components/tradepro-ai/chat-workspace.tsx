"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import { Button, Input, Spin } from "antd";
import { History, RefreshCw, Send, Sparkles, UserRound } from "lucide-react";

import { useUserDetail } from "@/hooks/useUser";
import type { TradeProAiConversation } from "./types";

const { TextArea } = Input;

const verifiedWelcomePrompts = [
  "Show my recent transactions",
  "Explain withdrawal status",
  "Show my trading accounts",
  "Teach me about leverage",
];

const unverifiedWelcomePrompts = [
  "Check my KYC progress",
  ...verifiedWelcomePrompts.slice(1),
];

const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 mt-0 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium text-blue-600 underline underline-offset-2"
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  ),
};

const inlineMarkdownComponents: Components = {
  p: ({ children }) => <>{children}</>,
};

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
}

function TableCellContent({ cell }: { cell: string }) {
  const plainValue = cell.replaceAll("**", "").trim().toUpperCase();
  const statusStyles: Record<string, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    COMPLETED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    PROCESSING: "bg-blue-50 text-blue-700",
    FAILED: "bg-red-50 text-red-700",
    REJECTED: "bg-red-50 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-600",
  };
  const statusStyle = statusStyles[plainValue];

  if (statusStyle) {
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyle}`}>
        {plainValue}
      </span>
    );
  }

  return (
    <ReactMarkdown components={inlineMarkdownComponents}>{cell}</ReactMarkdown>
  );
}

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const tableStart = lines.findIndex(
    (line, index) =>
      line.trim().startsWith("|") &&
      /^\s*\|(?:\s*:?-{3,}:?\s*\|)+\s*$/.test(lines[index + 1] || ""),
  );

  if (tableStart < 0) {
    return (
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    );
  }

  let tableEnd = tableStart + 2;
  while (tableEnd < lines.length && lines[tableEnd].trim().startsWith("|")) {
    tableEnd += 1;
  }

  const headings = splitTableRow(lines[tableStart]);
  const rows = lines
    .slice(tableStart + 2, tableEnd)
    .map((line) => splitTableRow(line));
  const beforeTable = lines.slice(0, tableStart).join("\n").trim();
  const afterTable = lines.slice(tableEnd).join("\n").trim();

  return (
    <>
      {beforeTable ? (
        <ReactMarkdown components={markdownComponents}>
          {beforeTable}
        </ReactMarkdown>
      ) : null}
      <div className="my-3 max-w-full overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr>
              {headings.map((heading) => (
                <th
                  key={heading}
                  className="border-b border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("|")}>
                {row.map((cell, index) => (
                  <td
                    key={`${index}-${cell}`}
                    className="border-b border-slate-100 px-3 py-2 last:text-slate-900"
                  >
                    <TableCellContent cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {afterTable ? (
        <ReactMarkdown components={markdownComponents}>
          {afterTable}
        </ReactMarkdown>
      ) : null}
    </>
  );
}

type ChatWorkspaceProps = {
  conversation?: TradeProAiConversation;
  isStreaming: boolean;
  onOpenHistory: () => void;
  onSend: (prompt: string) => Promise<void>;
};

export function ChatWorkspace({
  conversation,
  isStreaming,
  onOpenHistory,
  onSend,
}: ChatWorkspaceProps) {
  const userQuery = useUserDetail();
  const [prompt, setPrompt] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isKnownUnverified =
    Boolean(userQuery.data?.data.status) &&
    userQuery.data?.data.status !== "APPROVED";
  const welcomePrompts = isKnownUnverified
    ? unverifiedWelcomePrompts
    : verifiedWelcomePrompts;

  useEffect(() => {
    const element = scrollRef.current;
    element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }, [conversation?.messages, isStreaming]);

  async function submit(nextPrompt = prompt) {
    const message = nextPrompt.trim();
    if (!message || isStreaming) return;
    setPrompt("");
    await onSend(message);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <section className="flex h-[680px] min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex h-[70px] items-center justify-between gap-3 border-b border-slate-100 px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Sparkles size={19} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 truncate text-base font-semibold text-slate-950">
              {conversation?.title || "New Conversation"}
            </h2>
            <p className="m-0 text-xs text-slate-500">
              {conversation
                ? formatConversationTime(conversation.updatedAt)
                : "Secure AI guidance using your existing TradePro session"}
            </p>
          </div>
        </div>
        <Button
          type="text"
          icon={<History size={17} />}
          aria-label="Open conversations"
          onClick={onOpenHistory}
          className="md:!hidden"
        />
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label="TradePro AI messages"
        className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4 sm:p-5"
      >
        {!conversation?.messages.length ? (
          <div className="flex min-h-full items-center justify-center">
            <div className="max-w-xl text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Sparkles size={29} />
              </span>
              <h2 className="mb-1 mt-5 text-2xl font-bold text-slate-950">
                Welcome to TradePro AI
              </h2>
              <p className="mt-0 text-slate-500">How can I help you today?</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {welcomePrompts.map((item) => (
                  <Button key={item} onClick={() => void submit(item)}>
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {conversation.messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Sparkles size={15} />
                    </span>
                  ) : null}
                  <div className={`max-w-[86%] ${isUser ? "order-first" : ""}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      {!message.content && isStreaming ? (
                        <span className="flex items-center gap-2 text-slate-400">
                          <Spin size="small" /> Thinking…
                        </span>
                      ) : (
                        <MessageContent content={message.content} />
                      )}
                    </div>
                    {message.failedPrompt ? (
                      <Button
                        type="link"
                        size="small"
                        icon={<RefreshCw size={13} />}
                        onClick={() => void submit(message.failedPrompt)}
                        disabled={isStreaming}
                        className="!mt-1 !px-1"
                      >
                        Retry
                      </Button>
                    ) : null}
                    {message.source ? (
                      <p className="mb-0 mt-1 text-[10px] text-slate-400">
                        Source: {message.source.label}
                      </p>
                    ) : null}
                  </div>
                  {isUser ? (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <UserRound size={15} />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
        <div className="flex items-end gap-2">
          <TextArea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={handleKeyDown}
            autoSize={{ minRows: 1, maxRows: 4 }}
            placeholder="Ask anything about your trading journey..."
            disabled={isStreaming}
          />
          <Button
            type="primary"
            aria-label="Send message"
            icon={<Send size={17} />}
            loading={isStreaming}
            disabled={!prompt.trim() || isStreaming}
            onClick={() => void submit()}
            className="!size-11 !shrink-0"
          />
        </div>
        <p className="mb-0 mt-2 text-center text-[10px] text-slate-400">
          AI responses may be inaccurate. Financial actions always require manual navigation.
        </p>
      </div>
    </section>
  );
}

function formatConversationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Current conversation";

  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);

  return isToday ? `Today, ${time}` : `${date.toLocaleDateString()}, ${time}`;
}
