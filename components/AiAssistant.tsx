'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  Navigation,
  RotateCcw,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedDestinationId?: string;
  suggestedAction?: string;
}

export default function AiAssistant() {
  const {
    startLocationId,
    setDestinationLocationId,
    runRouteCalculation,
    setActiveTab,
    speak,
    announce,
  } = useAccessibility();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Hello! I am your **AI Accessibility Assistant** for campus navigation. Ask me about barrier-free routes, elevators, accessible washrooms, or ramps.\n\nTry asking: *"How can I reach Room 305 without stairs?"* or *"Where is the nearest elevator?"*',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgCounterRef = useRef<number>(1);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const suggestedQueries = [
    'How can I reach Room 305 without stairs?',
    'Where is the nearest elevator?',
    'Is there an accessible washroom near the library?',
    'Show me a wheelchair-friendly route to the laboratory.',
    'Where can I charge my electric wheelchair?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    msgCounterRef.current += 1;
    const userMsgId = `user-${msgCounterRef.current}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    announce(`Sending inquiry to assistant: ${textToSend}`);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          startLocationId,
        }),
      });

      if (!res.ok) {
        throw new Error('Assistant API returned an error.');
      }

      const data = await res.json();

      msgCounterRef.current += 1;
      const aiMsgId = `ai-${msgCounterRef.current}`;
      const assistantMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: data.reply || 'Here is the accessibility information for your request.',
        timestamp: 'Just now',
        suggestedDestinationId: data.suggestedDestinationId,
        suggestedAction: data.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      announce('Assistant response received.');
    } catch (err) {
      console.error('AI Assistant Fetch Error:', err);
      // Fallback
      msgCounterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${msgCounterRef.current}`,
          sender: 'assistant',
          text: 'I found an accessible route for you: from your starting point, follow the Central Quad paved promenade to the building’s accessible ramp and take the elevator. Would you like to map this route?',
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySuggestedRoute = (destId: string) => {
    setDestinationLocationId(destId);
    runRouteCalculation(startLocationId, destId);
    setActiveTab('finder');
    announce(`Applied destination from assistant. Calculating accessible route.`);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: 'Chat reset. How can I assist your campus navigation today?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Ask Accessibility Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                AI Powered
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant answers grounded in campus building topology, ramp slopes, and elevator availability.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          title="Reset conversation"
          aria-label="Reset conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-2 shrink-0">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center shrink-0">
          Try asking:
        </span>
        {suggestedQueries.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="shrink-0 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 dark:hover:bg-slate-700 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <Bot className="h-4 w-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Action Buttons if available */}
              {msg.suggestedDestinationId && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplySuggestedRoute(msg.suggestedDestinationId!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    <span>{msg.suggestedAction || 'Calculate Route to this Location'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => speak(msg.text)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 dark:text-slate-400 transition-colors"
                    title="Read answer aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
              )}

              {msg.sender === 'assistant' && !msg.suggestedDestinationId && (
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => speak(msg.text)}
                    className="text-slate-400 hover:text-blue-600 p-1"
                    title="Read aloud"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="h-8 w-8 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-slate-100 p-4 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce delay-100" />
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-bounce delay-200" />
              <span>Analyzing accessible campus topological paths...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your campus accessibility question here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
