import React, { useEffect, useState } from 'react';
import { FaComments } from 'react-icons/fa';
import OpenAI from 'openai';

const AskBuddy = ({ answer, correctAnswer, isCorrect, isCountry = false }) => {
  const [chatVisible, setChatVisible] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  // Initialize OpenAI API with your API key
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Function to fetch an interesting fact
  const getInterestingFact = async (correct) => {
    let prompt;
    if (correct) {
      prompt = isCountry ?
        `Tell me an interesting fun fact about the country ${answer}.`
        : `Tell me an interesting fun fact about the capital city of ${answer}.`;
    } else {
      prompt = isCountry ?
        `Describe the country ${correctAnswer} in two sentences without mentioning its name.`
        : `Describe the capital ${correctAnswer} in two sentences without mentioning its name.`;
    }


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
      getInterestingFact(); // Fetch fact
    }
  }, [answer]);

  /* Markup */
  return (
    <div>
      {/* Chat icon to trigger chat box */}
      <div className="absolute bottom-5 left-5 bg-slate-300 rounded-full p-3 shadow-lg">
        <FaComments
          size={30}
          className={`cursor-pointer text-slate-600 ${isCorrect === null ? '' : ''}`}
          onClick={() => {
            setChatVisible((prev) => !prev);
            setChatMessage('');
            if (answer == null) return;
            getInterestingFact(); // Fetch fact
          }}
        />
      </div>

      {/* Chatbox */}
      {chatVisible && (
        <div className="absolute bottom-20 left-5 bg-slate-200 p-4 rounded-lg shadow-lg w-80 z-20">
          {answer == null ?
            <p>Select an answer first to communicate with Buddy.</p>
            :
            <>
              <h2 className="font-bold">{isCorrect ? "Buddy's Fun Fact" : "Buddy's hint"}</h2>
              <p>{!isCorrect && "I can give you a hint about the correct answer:"}</p>
              <p>{chatMessage}</p>
            </>
          }

        </div>
      )}
    </div>
  );
};

export default AskBuddy;
