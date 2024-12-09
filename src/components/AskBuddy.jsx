import React, { useEffect, useState } from 'react';
import { FaComments } from 'react-icons/fa';
import OpenAI from 'openai';
// Adaptive engine imports
import { generateBuddyPrompt } from '../engine/adaptiveEngine';


const AskBuddy = ({ answer, correctAnswer, isCorrect, isCountry = false }) => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Initialize OpenAI API with your API key
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Function to fetch an interesting fact
  const getInterestingFactOrHint = async (correct) => {
    // generate buddy prompt from the adaptive engine
    let prompt = generateBuddyPrompt(answer, correctAnswer, correct, isCountry);


    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
        stream: true,
      });

      // Process the streamed response
      for await (const part of response) {
        if (part.choices && part.choices.length > 0) {
          const text = part.choices[0].delta.content || '';
          setChatMessage((prev) => prev + text);
        }
      }
    } catch (error) {
      console.error('Error fetching fact or hint:', error);
    }
  };

  useEffect(() => {
    if (answer != null) {
      setChatMessage("");
      getInterestingFactOrHint(); // Fetch fact or hint from buddy
    }
  }, [answer]);

  /* Markup */
  return (
    <div>
      {/* Chat icon to trigger chat box */}
      <div className={`absolute bottom-5 left-5 ${answer != null ? 'bg-slate-300' : 'bg-violet-500'}  rounded-full p-3 shadow-lg`}>
        <FaComments
          size={30}
          className={`cursor-pointer text-slate-50 ${answer != null ? 'pointer-events-none opacity-50' : ''}`}
          onClick={() => {
            if (answer !== null) return;
            setChatVisible((prev) => !prev);
            setChatMessage('');
            getInterestingFactOrHint(); // Fetch fact or hint from buddy
          }}
        />
      </div>

      {/* Chatbox */}
      {chatVisible && (
        <div className="absolute bottom-20 left-5 bg-white p-4 rounded-lg shadow-lg w-80 z-20">
          {answer == null &&
            <>
              <h2 className="font-bold">Buddy's hint</h2>
              <p>{chatMessage}</p>
            </>
          }

        </div>
      )}
    </div>
  );
};

export default AskBuddy;
