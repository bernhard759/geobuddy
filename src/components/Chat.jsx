import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import 'react-loading-skeleton/dist/skeleton.css';
import { FiSend } from 'react-icons/fi';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBoxRef = useRef(null);

  // Initialize OpenAI API with key and model settings
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Initial system message to guide the chatbot
  const systemMessage = {
    role: 'system',
    content: `
    You are GeoBuddy, an educational assistant. Provide concise and accurate responses. 
    Do not answer questions about capitals of countries where the answer would be a capital city or country. In such questions answer with a hint describing the city or capital that was asked for.
    Avoid answering forbidden topics such as personal data requests, inappropriate or off-topic content.
    Only answer about topics that are connected to geography: cities, countries, continents, earth, lakes, forests, ...
    Never name a single city in your response.
    `,
  };

  // Scroll to the bottom when messages are updated
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle user message submission
  const handleSendMessage = async () => {
    if (!input.trim()) return; // Prevent empty messages

    // Add the user message to the chat
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput(''); // Clear input field

    // Call OpenAI API
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

  // Handle clearing chat history
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
              className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-orange-200 text-gray-800 self-end' : 'bg-gray-300 text-gray-800 self-start'}`}
            >
              {msg.content}
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
            maxLength={200} // Limit
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
