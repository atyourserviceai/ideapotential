import { createContext, useContext, useState, type ReactNode } from "react";

interface ChatContextType {
  activeTab: "chat" | "presentation";
  setActiveTab: (tab: "chat" | "presentation") => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<"chat" | "presentation">(
    "presentation"
  );

  return (
    <ChatContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
