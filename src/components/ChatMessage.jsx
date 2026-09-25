// Reusable message bubble for the AI Academic Assistant panel.
// role: "user" | "assistant" | "notice".
// "notice" is a centered system note (e.g. "assistant not connected yet") -
// visually distinct from both bubble styles so it's never mistaken for a
// real AI reply. `thinking` swaps an assistant bubble's text for an
// animated dots indicator, so Part 2 can drop in a real streamed reply
// without changing how the bubble itself renders.
function ChatMessage({ role, text, thinking }) {
  if (role === "notice") {
    return (
      <div className="chat-message chat-message--notice" role="status">
        <span className="chat-message__notice-icon" aria-hidden="true">
          i
        </span>

        <p>{text}</p>
      </div>
    );
  }

  const isUser = role === "user";

  return (
    <div
      className={`chat-message chat-message--${isUser ? "user" : "assistant"}`}
    >
      <div className="chat-message__bubble">
        {thinking ? (
          <span
            className="chat-message__thinking"
            role="status"
            aria-label="Assistant is thinking"
          >
            <span></span>
            <span></span>
            <span></span>
          </span>
        ) : (
          <p className="chat-message__text">{text}</p>
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
