import { Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {role === "assistant" && (
          <Sparkles className="inline-block w-4 h-4 mr-2 mb-1 text-primary" />
        )}
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
    </div>
  );
}
