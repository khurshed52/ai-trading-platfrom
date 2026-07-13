"use client";

import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Button,
  Input,
  Modal,
  Spin,
  Typography,
} from "antd";
import {
  Bot,
  MessageCircle,
  Send,
  UserRound,
  X,
} from "lucide-react";

const { TextArea } = Input;
const { Text } = Typography;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function createMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
  };
}

export default function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "assistant",
      "Hello! How can I help you with TradePro?",
    ),
  ]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(
    null,
  );

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isStreaming]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function handleSend() {
    const message = prompt.trim();

    if (!message || isStreaming) {
      return;
    }

    const userMessage = createMessage("user", message);
    const assistantMessage = createMessage("assistant", "");

    setPrompt("");
    setIsStreaming(true);

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | {
              message?: string;
            }
          | null;

        throw new Error(
          errorData?.message || "Unable to send message.",
        );
      }

      if (!response.body) {
        throw new Error("Streaming response is unavailable.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedResponse = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        accumulatedResponse += decoder.decode(value, {
          stream: true,
        });

        setMessages((currentMessages) =>
          currentMessages.map((chatMessage) =>
            chatMessage.id === assistantMessage.id
              ? {
                  ...chatMessage,
                  content: accumulatedResponse,
                }
              : chatMessage,
          ),
        );
      }

      if (!accumulatedResponse.trim()) {
        throw new Error("Gemini returned an empty response.");
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessages((currentMessages) =>
        currentMessages.map((chatMessage) =>
          chatMessage.id === assistantMessage.id
            ? {
                ...chatMessage,
                content: `Sorry, I could not respond: ${errorMessage}`,
              }
            : chatMessage,
        ),
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void handleSend();
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleStop() {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open TradePro assistant"
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-6 right-6 z-[999]
          flex size-14 items-center justify-center
          rounded-full bg-blue-600 text-white
          shadow-[0_14px_35px_rgba(37,99,235,0.38)]
          transition duration-200
          hover:-translate-y-1 hover:bg-blue-700
          focus:outline-none focus:ring-4 focus:ring-blue-600/20
        "
      >
        <MessageCircle size={25} />
      </button>

      <Modal
        open={isOpen}
        onCancel={handleClose}
        footer={null}
        centered
        width={560}
        destroyOnHidden={false}
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Bot size={20} />
            </div>

            <div>
              <p className="m-0 text-base font-semibold text-slate-950">
                TradePro Assistant
              </p>

              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" />

                <Text className="!text-xs !text-slate-500">
                  Powered by Gemini
                </Text>
              </div>
            </div>
          </div>
        }
        closeIcon={<X size={19} />}
        styles={{
          content: {
            borderRadius: 24,
            padding: 0,
            overflow: "hidden",
          },
          header: {
            margin: 0,
            padding: "20px 22px",
            borderBottom: "1px solid #e2e8f0",
          },
          body: {
            padding: 0,
          },
        }}
      >
        <div className="flex h-[600px] max-h-[75vh] flex-col bg-slate-50">
          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                    }`}
                  >
                    {message.content}

                    {!message.content &&
                      message.role === "assistant" &&
                      isStreaming && (
                        <div className="flex items-center gap-2">
                          <Spin size="small" />
                          <span className="text-slate-400">
                            Thinking…
                          </span>
                        </div>
                      )}
                  </div>

                  {isUser && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <UserRound size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-2 transition focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]">
              <TextArea
                value={prompt}
                onChange={(event) =>
                  setPrompt(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask something about TradePro..."
                autoSize={{
                  minRows: 2,
                  maxRows: 5,
                }}
                variant="borderless"
                disabled={isStreaming}
                className="!resize-none !text-sm"
              />

              <div className="mt-2 flex items-center justify-between px-1 pb-1">
                <Text className="!text-[11px] !text-slate-400">
                  Enter to send · Shift + Enter for new line
                </Text>

                {isStreaming ? (
                  <Button
                    danger
                    type="text"
                    onClick={handleStop}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<Send size={16} />}
                    disabled={!prompt.trim()}
                    onClick={() => void handleSend()}
                    aria-label="Send message"
                  />
                )}
              </div>
            </div>

            <p className="mb-0 mt-3 text-center text-[11px] text-slate-400">
              AI responses may be inaccurate and are not financial
              advice.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}