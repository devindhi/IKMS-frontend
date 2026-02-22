import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { nanoid } from 'nanoid';

// UI Components from your library
import {
  PromptInput,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
} from '@/components/ai-elements/prompt-input';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import { RichAssistantMessage } from '../components/custom/RichMessageRenderer';

const threadId = nanoid();

function App() {
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: 'http://127.0.0.1:8000/qa' }),
    body: { thread_id: threadId },
  });

  // Auto-scroll to bottom on new messages with a smooth behavior
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('.overflow-y-auto') || scrollRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = useCallback(() => {
    if (!input.trim() || status === 'submitted') return;
    sendMessage({ text: input });
    setInput('');
  }, [input, sendMessage, status]);

  const latestAssistantIndex = messages.findLastIndex((m) => m.role === 'assistant');

  return (
    <div className="flex flex-col h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 selection:bg-neutral-200 dark:selection:bg-neutral-800">
      
      {/* ── Chat Canvas ── */}
      <Conversation 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto scrollbar-hide pt-12 pb-40"
      >
        <ConversationContent className="max-w-5xl mx-auto px-6 w-full space-y-4">
          
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[50vh] animate-in fade-in zoom-in-95 duration-1000">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 mb-6 flex items-center justify-center shadow-sm">
                <span className="text-xl">✨</span>
              </div>
              <h1 className="text-xl font-light tracking-tight text-neutral-400 dark:text-neutral-500">
                How can I assist you today?
              </h1>
            </div>
          )}

          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            const isLatestAssistant = message.role === 'assistant' && index === latestAssistantIndex;

            return (
              <div 
                key={message.id} 
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}
              >
                <Message from={message.role} className="max-w-[88%]">
                  <MessageContent>
                    {isUser ? (
                      /* User Message: Minimal "Pill" style */
                      <div className="bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/50 rounded-[22px] px-5 py-3 shadow-sm">
                        <MessageResponse className="text-[15px] leading-relaxed font-normal">
                          {message.parts?.find((p) => p.type === 'text')?.text ?? message.content}
                        </MessageResponse>
                      </div>
                    ) : (
                      isLatestAssistant && (
                        <div className="px-1 py-2 prose prose-neutral dark:prose-invert max-w-none">
                          <RichAssistantMessage 
                            text={message.parts?.filter((p) => p.type === 'text').map(p => p.text).join('') ?? ''} 
                          />
                        </div>
                      )
                    )}
                  </MessageContent>
                </Message>
              </div>
            );
          })}
        </ConversationContent>
      </Conversation>

      {/* ── Floating Input Footer ── */}
      <div className="fixed bottom-0 left-0 right-0 z-10">
        {/* Soft gradient mask to blend messages as they scroll up */}
        
        <div className="bg-[#fafafa] dark:bg-[#0a0a0a] pb-8 px-4 ">
          <div className="max-w-5xl mx-auto">
            <div className="relative group transition-all duration-300">
              {/* Subtle Outer Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-b from-neutral-200 to-transparent dark:from-neutral-800 dark:to-transparent rounded-[26px] opacity-0 group-focus-within:opacity-100 transition duration-500 blur-sm" />
              
              <PromptInput 
                onSubmit={handleSubmit}
                className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[24px] shadow-sm focus-within:shadow-md transition-all duration-300"
              >
                <PromptInputBody className="p-1.5">
                  <PromptInputTextarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="min-h-[56px] w-full px-4 py-3 bg-transparent border-none focus-visible:ring-0 resize-none text-[16px] placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-light"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                </PromptInputBody>
                
                <PromptInputFooter className="px-4 pb-3 flex items-center justify-between">
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium tracking-[0.2em] uppercase">
                    Gemini 3 Flash
                  </div>
                  <PromptInputSubmit 
                    disabled={!input || status === 'submitted'} 
                    status={status}
                    className="rounded-full w-9 h-9 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-20 disabled:hover:scale-100"
                  />
                </PromptInputFooter>
              </PromptInput>
            </div>
            
            <p className="text-[11px] text-center mt-4 text-neutral-400/60 dark:text-neutral-600/60 leading-tight">
              AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;