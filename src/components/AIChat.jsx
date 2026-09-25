import { useEffect, useRef, useState } from "react";

import "../css/components/AIChat.css";

import { generateId } from "../utils/generateId";
import { createRipple } from "../utils/ripple";

import ChatMessage from "./ChatMessage";

const SUGGESTIONS = [
  "What's my CGPA?",
  "How is my GP calculated?",
  "Explain my academic record",
];

// Part 1 has no backend yet, so every send resolves to this honest notice
// instead of a fake AI reply. Part 2 replaces this timeout with a real
// request and streams the assistant's actual response into its place.
const NOT_CONNECTED_NOTICE =
  "The AI Academic Assistant isn't connected yet - this is a preview of the chat interface. Real answers are coming soon.";
const THINKING_DELAY_MS = 700;

function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const conversationRef = useRef(null);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const thinkingTimeoutRef = useRef(null);
  const hasOpenedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (thinkingTimeoutRef.current) {
        clearTimeout(thinkingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!conversationRef.current) return;

    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages, isThinking]);

  useEffect(() => {
    if (isOpen) {
      hasOpenedRef.current = true;
      inputRef.current?.focus();
    } else if (hasOpenedRef.current) {
      // Return focus to the toggle after the panel closes (but not on the
      // initial mount, when it was never open to begin with).
      toggleRef.current?.focus();
    }
  }, [isOpen]);

  // Let Escape close the panel from anywhere inside it, in addition to the
  // header close button and the floating toggle.
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function sendMessage(rawText) {
    const trimmed = rawText.trim();

    if (!trimmed || isThinking) return;

    setMessages((current) => [
      ...current,
      { id: generateId(), role: "user", text: trimmed },
    ]);
    setInputValue("");
    setIsThinking(true);

    thinkingTimeoutRef.current = setTimeout(() => {
      setIsThinking(false);
      setMessages((current) => [
        ...current,
        { id: generateId(), role: "notice", text: NOT_CONNECTED_NOTICE },
      ]);
    }, THINKING_DELAY_MS);
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(inputValue);
  }

  function handleInputKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(inputValue);
    }
  }

  function handleToggleClick(event) {
    createRipple(event);
    setIsOpen((current) => !current);
  }

  return (
    <div className="ai-chat">
      {isOpen && (
        <div
          className="ai-chat__panel"
          role="dialog"
          aria-label="AI Academic Assistant"
        >
          <div className="ai-chat__header">
            <div className="ai-chat__identity">
              <div className="ai-chat__avatar" aria-hidden="true">
                <SparkleIcon />
              </div>

              <div className="ai-chat__identity-text">
                <div className="ai-chat__title">AI Academic Assistant</div>
                <div className="ai-chat__subtitle">
                  Your academic companion
                </div>
              </div>
            </div>

            <button
              type="button"
              className="ai-chat__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI Academic Assistant"
            >
              ×
            </button>
          </div>

          <div
            className="ai-chat__conversation"
            ref={conversationRef}
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="ai-chat__welcome">
                <div className="ai-chat__welcome-icon" aria-hidden="true">
                  <SparkleIcon />
                </div>

                <p className="ai-chat__welcome-title">
                  Hi! I'm your AI Academic Assistant.
                </p>

                <p className="ai-chat__welcome-text">
                  Ask me about your CGPA, GP, courses, semesters, or academic
                  record.
                </p>

                <div className="ai-chat__suggestions">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="ai-chat__suggestion ripple-button ripple-button--dark"
                      onClick={(event) => {
                        createRipple(event);
                        sendMessage(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    text={message.text}
                  />
                ))}

                {isThinking && <ChatMessage role="assistant" thinking />}
              </>
            )}
          </div>

          <form className="ai-chat__input-area" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="ai-chat__input"
              placeholder="Ask about your CGPA, GP, or courses..."
              rows={1}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleInputKeyDown}
              aria-label="Message the AI Academic Assistant"
            />

            <button
              type="submit"
              className="ai-chat__send ripple-button"
              disabled={!inputValue.trim() || isThinking}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}

      <button
        ref={toggleRef}
        type="button"
        className="ai-chat__toggle ripple-button"
        onClick={handleToggleClick}
        aria-label={
          isOpen ? "Close AI Academic Assistant" : "Open AI Academic Assistant"
        }
        aria-expanded={isOpen}
      >
        {isOpen ? <CloseGlyphIcon /> : <ChatBubbleIcon />}
      </button>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function CloseGlyphIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  );
}

export default AIChat;
