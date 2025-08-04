import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Minimize2, X, AlertTriangle, Loader2 } from "lucide-react";
import { getChatSuggestionsWithCache, sendChatMessage } from "@/app/api/ChatBot/chatbot";

interface Message {
  id: number;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface AIChatWindowProps {
  urlBot: string;
}

const AIChatWindow: React.FC<AIChatWindowProps> = ({ urlBot }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "ai",
      content:
        "Hello! I'm a coursemaster assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] =
    useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestionEmojis = ["📄", "🤔", "💡", "⚙️", "🖥️", "❓"];

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  // Fetch suggestions immediately when component mounts or urlBot changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!urlBot) return;
      
      // Reset state when urlBot changes
      setIsLoadingSuggestions(true);
      setSuggestionError(null);
      setSuggestions([]);
      
      try {
        const fetchedSuggestions = await getChatSuggestionsWithCache(urlBot);
        setSuggestions(fetchedSuggestions);
      } catch {
        setSuggestionError("Could not load suggestions. Please try again.");
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    // Gọi suggestions khi urlBot thay đổi
    fetchSuggestions();
  }, [urlBot]); // Chỉ phụ thuộc vào urlBot

  // Reset chat state when urlBot changes
  useEffect(() => {
    if (urlBot) {
      setIsResetting(true);
      
      // Reset chat messages to initial state
      setMessages([
        {
          id: 1,
          type: "ai",
          content: "Hello! I'm a coursemaster assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      
      // Reset other states
      setInputMessage("");
      setIsTyping(false);
      setShowSuggestions(true);
      
      console.log("🔄 Chat reset for new content:", urlBot);
      
      // Small delay to show reset state
      setTimeout(() => {
        setIsResetting(false);
      }, 500);
    }
  }, [urlBot]);

  // Don't render chatbot if no valid URL is provided (e.g., for quiz/exam content)
  if (!urlBot || urlBot.trim() === "") {
    return null;
  }
  
  const handleSendMessage = async (
    message: string = inputMessage
  ): Promise<void> => {
    if (!message.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    setInputMessage("");
    setShowSuggestions(false);
    setIsTyping(true);

    try {
      const aiResponseContent = await sendChatMessage(urlBot, message);
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: aiResponseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to get AI response:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content:
          "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string): void => {
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void => {
    setInputMessage(e.target.value);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMinimize = (): void => {
    setIsMinimized(true);
  };

  const handleMaximize = (): void => {
    setIsMinimized(false);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleMaximize}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <Bot className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <div>
            <h3 className="font-semibold text-sm">Gemini Assistant</h3>
            <p className="text-xs opacity-90">Ready to help</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMinimize}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleMinimize}
            className="hover:bg-white/20 p-1 rounded transition-colors"
            aria-label="Reset chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
        {isResetting && (
          <div className="flex items-center justify-center p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading new content...</span>
            </div>
          </div>
        )}
        
        {!isResetting && showSuggestions && messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 font-medium">
              💫 Suggestions for you:
            </p>
            {isLoadingSuggestions && (
              <div className="space-y-1.5 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-full bg-gray-200 rounded-md"
                  ></div>
                ))}
              </div>
            )}
            {suggestionError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{suggestionError}</span>
              </div>
            )}
            {!isLoadingSuggestions && !suggestionError && (
              <div className="grid grid-cols-1 gap-1.5">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-left p-2 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-md transition-all duration-200 text-xs group"
                  >
                    <span className="group-hover:text-blue-600 transition-colors">
                      {suggestionEmojis[index % suggestionEmojis.length]}{" "}
                      {suggestion}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="border-t border-gray-200 my-3"></div>
          </div>
        )}

        {!isResetting && messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-2.5 ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm shadow-sm border"
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === "ai" && (
                  <Bot className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.type === "user" && (
                  <User className="w-4 h-4 mt-0.5 text-blue-100 flex-shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}

        {!isResetting && isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm p-2.5 shadow-sm border max-w-[85%]">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={isResetting ? "Loading new content..." : "Type a message..."}
              rows={1}
              disabled={isResetting}
              className="w-full p-2.5 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm max-h-20 overflow-y-auto disabled:bg-gray-100 disabled:cursor-not-allowed"
              style={{ minHeight: "42px" }}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping || isResetting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-colors duration-200 flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1.5 text-center">
          Enter to send, Shift + Enter for a new line.
        </p>
      </div>
    </div>
  );
};

export default AIChatWindow;
