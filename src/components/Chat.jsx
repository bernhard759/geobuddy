import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiSend, FiUser} from 'react-icons/fi'; // Import icons
import { AiFillRobot } from "react-icons/ai";
import { generateChatPrompt } from '../engine/adaptiveEngine';

const Chat = ({username}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBoxRef = useRef(null);

  // Initialize OpenAI API with key and model settings
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const systemMessage = {
    role: 'system',
    content: generateChatPrompt(username),
  };

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [systemMessage, ...messages, userMessage],
        max_tokens: 100,
        temperature: 0.5,
      });

      const assistantMessage = response.choices[0].message;
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: 'Error: Unable to fetch response. Please try again later.' },
      ]);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-lg flex flex-col h-[500px]">
      <h2 className="text-2xl font-bold text-center mb-4">Chat with GeoBuddy</h2>

      {/* Chat Box */}
      <div ref={chatBoxRef} className="flex-grow overflow-y-auto p-4 border rounded-lg bg-gray-100 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">Start a conversation with GeoBuddy!</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* User and Assistant Icons */}
              {msg.role === 'assistant' && (
                <AiFillRobot className="text-violet-500 mr-2 self-end" size={24} />
              )}
              <div className={`relative max-w-xs px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-gray-300 text-gray-800' : 'bg-violet-500 text-white'}`}>
                <span>{msg.content}</span>
                
                {/* Speech Bubble Arrow */}
                <div
                  className={`absolute ${msg.role === 'user' ? '-right-0' : '-left-0'} bottom-0 w-0 h-0 border-t-8 ${
                    msg.role === 'user'
                      ? 'border-r-8 border-transparent'
                      : 'border-s-8 border-transparent'
                  }`}
                  style={{
                    borderLeftColor: msg.role === 'user' ? 'transparent' : 'var(--color-bot)',
                    borderRightColor: msg.role === 'user' ? 'var(--color-user)' : 'transparent',
                  }}
                />
              </div>
              {msg.role === 'user' && (
                <FiUser className="text-gray-500 ml-2 self-end" size={24} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Field and Buttons */}
      <div className="flex flex-col space-y-2">
        <div className="flex flex-wrap gap-2 space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            maxLength={200}
            placeholder="Type your message..."
            className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center hover:bg-orange-600 disabled:bg-gray-300"
            disabled={!input.trim()}
          >
            <FiSend className="mr-2" />
            Send
          </button>
          <button
            onClick={handleClearChat}
            className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
