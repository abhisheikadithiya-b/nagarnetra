'use client';

import React, { useState } from 'react';
import { postAssistantChat } from '@/lib/api';
import {
  Bot, Send, Sparkles, ExternalLink, Database, Clock, FileCode, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tool_data?: {
    tool_called: string;
    arguments: any;
    time_window: string;
    row_count: number;
    records: any[];
    evidence_links: any[];
  };
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello Officer. I am the NagarNetra Telemetry Assistant. I query live PostGIS records, road defect ledgers, and corridor headway logs. How can I assist your watch today?'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQueries = [
    "Explain priority formula for INC-2025-0849",
    "Which corridors are delayed by more than 10 minutes?",
    "Show all open P1 critical road defects",
    "Are there any transit service headway gaps?"
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await postAssistantChat(textToSend);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.narrative,
          tool_data: {
            tool_called: res.tool_called,
            arguments: res.arguments,
            time_window: res.time_window,
            row_count: res.row_count,
            records: res.records,
            evidence_links: res.evidence_links
          }
        }
      ]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Error communicating with Telemetry Engine. Please check server connectivity.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#FAF8F5] dark:bg-[#0B0F17] p-4 lg:p-6 flex flex-col space-y-4 max-w-5xl mx-auto w-full transition-colors">
      {/* Header */}
      <div className="border-b border-[#E2DDD5] dark:border-[#1E2C44] pb-3">
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase">
          <span>ICCC AUDIT COPILOT</span>
          <span>•</span>
          <span className="text-emerald-600 font-bold">TOOL-CALLING VERIFIED AGENT</span>
        </div>
        <h1 className="font-serif font-bold text-2xl text-[#16191F] dark:text-white mt-1">
          NagarNetra Telemetry Assistant
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Deterministic analytics dispatch: every answer cites the exact whitelisted tool invoked, time window, row count, and verified records.
        </p>
      </div>

      {/* Quick Prompt Pills */}
      <div className="flex flex-wrap gap-2">
        {quickQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] hover:border-gray-400 text-xs font-mono text-gray-700 dark:text-gray-300 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 min-h-[450px] p-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl p-4 space-y-3 ${
                m.role === 'user'
                  ? 'bg-[#0D1B2A] text-white dark:bg-[#1E293B] shadow-sm font-sans text-sm'
                  : 'bg-white dark:bg-[#131B2A] border border-[#E2DDD5] dark:border-[#223048] text-[#16191F] dark:text-white shadow-sm'
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                {m.role === 'assistant' ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                    <Bot className="w-4 h-4" /> NAGARNETRA ENGINE
                  </span>
                ) : (
                  <span>OPERATOR (#DESHMUKH-88)</span>
                )}
              </div>

              {/* Text Narrative */}
              <p className="text-xs leading-relaxed font-sans">{m.content}</p>

              {/* Tool Evidence Citation Card (If Assistant returned tool data) */}
              {m.tool_data && (
                <div className="rounded-lg bg-gray-50 dark:bg-[#0E1524] p-3 border border-gray-200 dark:border-gray-800 space-y-2 text-xs font-mono">
                  {/* Citation Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-800 text-[11px]">
                    <span className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                      <FileCode className="w-3.5 h-3.5 text-blue-500" />
                      Tool: <span className="text-blue-600 dark:text-blue-400">{m.tool_data.tool_called}()</span>
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      {m.tool_data.time_window}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      {m.tool_data.row_count} Rows Returned
                    </span>
                  </div>

                  {/* Rendered Evidence Table / Data */}
                  {m.tool_data.records.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      {m.tool_data.records.map((r: any, rIdx: number) => (
                        <div
                          key={rIdx}
                          className="p-2 rounded bg-white dark:bg-[#131B2A] border border-gray-200 dark:border-gray-800 flex items-center justify-between text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {r.id || r.route_id}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-2">
                              {r.title || r.name}
                            </span>
                          </div>
                          {r.formula && (
                            <span className="text-teal-600 dark:text-teal-400 font-semibold">
                              {r.formula}
                            </span>
                          )}
                          {r.latency && (
                            <span className="text-red-600 dark:text-red-400 font-bold">
                              {r.latency}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deep link pills */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="text-gray-500">Evidence Link:</span>
                    <Link
                      href="/"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold"
                    >
                      Inspect in Command Center ↗
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500 animate-pulse">
            <Bot className="w-4 h-4 text-emerald-500" />
            Executing tool query on spatial ledger...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="pt-2 border-t border-[#E2DDD5] dark:border-[#1E2C44]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask a question (e.g. 'Explain priority formula for INC-2025-0849')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#131B2A] text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 rounded-lg bg-[#0D1B2A] dark:bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-mono font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
