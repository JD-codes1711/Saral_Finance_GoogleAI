import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { SparklesIcon, PaperAirplaneIcon, ArrowUpTrayIcon } from './icons/Icons';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SYSTEM_INSTRUCTION = `You are SaralFin-AI, a friendly and expert financial advisor chatbot specifically designed for Indian students. Your goal is to analyze a user's transaction history and provide personalized, actionable, and empathetic suggestions to help them manage their monthly allowance better and reach their savings goals. The user will provide their transaction history as CSV data. You will analyze this data and then engage in a conversational Q&A. **Analysis Process (Internal):** When you receive the CSV data, you must systemically analyze it to calculate: 1. Total Income & Total Expenses. 2. Average Monthly Expense. 3. Category-wise Breakdown (total and percentage). 4. Top Spending Categories. 5. Savings Rate: (Total Income - Total Expenses) / Total Income * 100. 6. Patterns: Look for unusually large transactions, high frequency of spending in a particular category, or potential "money leaks". **Conversational Flow:** 1. **After analyzing the initial CSV data**, your first response MUST be: "I've analyzed your spending! How can I help you today? You can ask me things like: - How can I save [AMOUNT] next month? - Where am I spending the most money? - What are some easy ways to cut my expenses? - Can you create a simple budget for me?" 2. **When responding to user questions, especially savings goals (e.g., "How can I save ₹2000?"):** - **Acknowledge the Goal:** Start positively. "That's a great goal! Saving ₹2000 is a fantastic start." - **Reality Check:** Compare their goal to their past performance. "Based on your past months, your average savings were ₹[X]. To save ₹2000, we need to adjust by ₹[Y]." - **Actionable Advice:** Give category-specific, practical tips. Target high-impact areas and low-hanging fruit. - **Suggest Income Ideas:** Brainstorm ways to increase income. - **Simple Plan:** Summarize the advice into a clear, numbered or bulleted plan. - **Encourage:** End on a high note. "Remember, small changes add up. You can do this!" **Tone & Personality:** - **Empathetic:** Use phrases like "I understand," "That's a common challenge." - **Encouraging:** Be a cheerleader. "Great job on saving last month!" - **Culturally Relevant:** Use Indian currency (₹) and refer to common Indian student scenarios (canteen, auto-rickshaw, mobile recharges). - **Concise but Thorough:** Use bullet points and bold text for clarity. - **Non-Judgemental:** Frame advice positively, focusing on opportunities.`;

const Advisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hello! I'm SaralFin-AI, your budgeting assistant. To get started, please upload your transaction history CSV file. I'll analyze it and then you can ask me questions like 'How can I save ₹2000 next month?'" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        setCsvData(text);
        setIsLoading(true);
        setMessages(prev => [...prev, { role: 'user', text: `Uploaded ${file.name}` }]);

        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const newChat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction: SYSTEM_INSTRUCTION },
          });
          setChat(newChat);
          
          const response = await newChat.sendMessageStream({ message: `Here is the user's transaction data in CSV format:\n\n${text}` });
          
          let fullResponse = '';
          setMessages(prev => [...prev, { role: 'model', text: '' }]);
          
          for await (const chunk of response) {
            fullResponse += chunk.text;
            setMessages(prev => {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1].text = fullResponse;
              return newMessages;
            });
          }
        } catch (error) {
          console.error("AI Error:", error);
          setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error analyzing your file. Please ensure it's a valid CSV and try again." }]);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || !chat) return;

    const userMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chat.sendMessageStream({ message: userInput });
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of response) {
        fullResponse += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\* (.*?)(?=\n\* |\n|$)/g, '<li class="list-disc ml-5">$1</li>')
      .replace(/(\r\n|\n|\r)/gm, '<br>');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg h-[80vh] flex flex-col">
      <div className="p-4 border-b flex items-center space-x-3">
        <SparklesIcon className="h-8 w-8 text-primary"/>
        <h2 className="text-2xl font-bold text-dark-text">SaralFin-AI</h2>
      </div>
      <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-dark-text'}`}
              dangerouslySetInnerHTML={{ __html: formatText(msg.text) }}
            />
          </div>
        ))}
         {isLoading && messages[messages.length-1].role === 'user' && (
           <div className="flex justify-start">
             <div className="bg-gray-100 text-dark-text p-3 rounded-2xl">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
             </div>
           </div>
         )}
      </div>
      <div className="p-4 border-t">
        {!csvData ? (
          <>
            <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform transform hover:scale-105 disabled:bg-gray-400"
            >
              <ArrowUpTrayIcon className="h-6 w-6" />
              <span>Upload Transaction CSV</span>
            </button>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-orange-600 disabled:bg-gray-400" disabled={isLoading || !userInput.trim()}>
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Advisor;