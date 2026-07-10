/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Bot, Send, X, Sparkles, CornerDownLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AIChatbotProps {
  theme: "dark" | "light";
}

export default function AIChatbot({ theme }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [history, setHistory] = useState<Message[]>([
    {
      role: "model",
      text: "Hello! I am **VerseAI**, your Task Verse intelligence companion. How can I help you manage your projects, optimize deadlines, or prioritize tasks today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isOpen, history, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input;
    if (!messageText.trim() || isLoading) return;

    // Clear input if we used the input box
    if (!textToSend) {
      setInput("");
    }

    const newHistory: Message[] = [...history, { role: "user", text: messageText }];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
          }))
        })
      });

      if (!res.ok) throw new Error("Failed to contact chatbot API");
      
      const data = await res.json();
      setHistory([...newHistory, { role: "model", text: data.reply || "I am processing your workspace details..." }]);
    } catch (err) {
      console.error(err);
      setHistory([...newHistory, { role: "model", text: "I experienced a minor latency spike. Please make sure the Gemini API key is configured correctly in the Secrets panel!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestions = [
    "Predict completion risk",
    "List priority categories",
    "How to organize high priority tasks?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans" id="ai-chatbot-wrapper">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`w-[360px] sm:w-[400px] h-[500px] rounded-3xl border flex flex-col overflow-hidden shadow-2xl mb-4 ${
              theme === "dark"
                ? "bg-[#111319]/95 border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl"
                : "bg-white border-slate-200/80 shadow-[0_15px_35px_rgba(148,163,184,0.25)]"
            }`}
            id="chatbot-panel"
          >
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              theme === "dark" ? "bg-[#16191E] border-white/10" : "bg-slate-50 border-slate-100"
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white relative shadow-md shadow-indigo-600/20">
                  <Bot className="h-5 w-5" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white/90 animate-pulse"></span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold font-display ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    VerseAI Copilot
                  </h4>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold tracking-wider uppercase">ACTIVE</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors ${
                  theme === "dark" ? "hover:bg-white/5 text-slate-500 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-800"
                }`}
                id="close-chatbot-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conversation window */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {history.map((msg, index) => {
                const isModel = msg.role === "model";
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2.5 max-w-[85%] ${isModel ? "self-start" : "ml-auto flex-row-reverse"}`}
                  >
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                      isModel
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/15"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                    }`}>
                      {isModel ? "AI" : "ME"}
                    </div>
                    <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isModel
                        ? theme === "dark" ? "bg-[#1C2026] text-slate-200" : "bg-slate-100 text-slate-800"
                        : "bg-indigo-600 text-white shadow-sm"
                    }`}>
                      {msg.text.split("\n").map((line, lIdx) => (
                        <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Loader */}
              {isLoading && (
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="h-7 w-7 rounded-lg bg-indigo-600/10 border border-indigo-500/15 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                    AI
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-xs flex gap-1 items-center ${
                    theme === "dark" ? "bg-[#1C2026] text-slate-400" : "bg-slate-100 text-slate-500"
                  }`}>
                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions / Prompt starters */}
            {history.length === 1 && !isLoading && (
              <div className="p-3 border-t border-white/5 space-y-1.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block px-1">SUGGESTED DISCUSSIONS:</span>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => handleSendMessage(sug)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border text-left transition-all ${
                        theme === "dark"
                          ? "bg-[#16191E] border-white/5 text-slate-400 hover:text-white hover:bg-[#1C2026]"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <div className={`p-3 border-t flex items-center gap-2 ${
              theme === "dark" ? "bg-[#16191E] border-white/10" : "bg-slate-50 border-slate-200"
            }`}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask VerseAI anything..."
                rows={1}
                className={`flex-1 resize-none py-2 px-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all ${
                  theme === "dark" ? "bg-[#090A0F] border-white/5 text-slate-100" : "bg-white border-slate-200 text-slate-900"
                }`}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-50"
                id="send-chatbot-msg-btn"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Circle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 cursor-pointer relative"
        id="chatbot-launcher-btn"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
          </>
        )}
      </motion.button>
    </div>
  );
}
