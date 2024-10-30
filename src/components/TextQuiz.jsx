import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import AskBuddy from './AskBuddy';
import { determineDifficulty } from '../utils/difficulty';
import {shuffleArray } from '../utils/shuffler';
import { selectRegion } from '../utils/regionsProba';


const TextQuiz = ({
  regions,
  userProfile,
  updateUserProfile,
  updateUserProfileDifficulty,
  answeredCapitals,
  setAnsweredCapitals,
  currentRegion,
  setCurrentRegion
}) => {
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize OpenAI API
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  /* Function to fetch a new question from OpenAI */
  const getQuestion = async (avoid, region) => {
    setLoading(true);
    const difficulty = determineDifficulty(userProfile, region);
    let regionPrompt =
      difficulty === 'hard'
        ? `Provide a ${difficulty} quiz question about the capital city in the ${region} region. Describe the country instead of naming it but include an unambiguous hint in your description.`
        : `Provide a ${difficulty} quiz question about the capital city in the ${region} region.`;
    regionPrompt += ` Dont ask for questions present here: ${avoid}.`;
    let formatPrompt =
      'Provide four different capitals as answer options (the correct one must of course be present in those options). Also dont include a Numbering in the Answer options.';
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `${regionPrompt} ${formatPrompt} Format the response as: Question: What is the capital of {country}? Options: {Option1}, {Option2}, {Option3}, {Option4} Correct Answer: {CorrectOption}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.3,
      });
      const { choices } = response;
      if (choices && choices.length > 0) {
        const answer = choices[0].message.content.trim();
        const questionPattern = /Question:\s*(.+?)\s*Options:\s*(.+?)\s*Correct Answer:\s*(.+)/;
        const match = answer.match(questionPattern);
        if (match) {
          const question = match[1].trim();
          const optionsString = match[2].trim();
          const correctAnswer = match[3].trim();
          const options = optionsString.split(',').map(option => option.trim());
          const isAlreadyAnswered = answeredCapitals.includes(correctAnswer);
          if (isAlreadyAnswered) {
            getQuestion(); // Fetch a new question if this capital has already been answered
            return;
          }
          setCurrentQuestion(question);
          setOptions(shuffleArray([...options]));
          setCorrectAnswer(correctAnswer);
        } else {
          console.error('Received answer is not in the expected format:', answer);
          getQuestion(); // Fetch a new question if the format is incorrect
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setCurrentQuestion('Error fetching question. Please try again.');
    } finally {
      setLoading(false); // Set loading to false once question is fetched
    }
  };

  // Function to handle user answer selection
  const handleAnswerClick = (selectedOption) => {
    // Check answer
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === correctAnswer;
    setIsCorrect(correct);

    /* Update avoid list of answers */
    if (correct) {
      setAnsweredCapitals(prev => {
        const newAnsweredCapitals = [...prev, correctAnswer];
        return newAnsweredCapitals;
      });
    };

    /* Update user model */
    if (correct) {
      updateUserProfile(currentRegion, true, userProfile[currentRegion].difficulty);
    } else {
      updateUserProfile(currentRegion, false, userProfile[currentRegion].difficulty);
    }
  };

  // Function to handle "Next" button click
  const handleNextQuestion = () => {

    // Reset state
    setSelectedAnswer(null); // Reset selected answer
    setIsCorrect(null); // Reset isCorrect state

    // Select a new region
    let region = selectRegion(userProfile, regions);
    setCurrentRegion(region);

    updateUserProfileDifficulty(region, determineDifficulty(userProfile, region));

    // Get new question
    getQuestion(answeredCapitals, region);
  };

  /* Get a question when we start */
  useEffect(() => {
    getQuestion('', currentRegion);
  }, []);

  /* Markup */
  return (
    <div className="relative p-8 bg-slate-50 rounded-lg border-2 border-slate-200">
      <h1 className="text-2xl font-bold mb-6 text-center">Geography Capitals Text Quiz</h1>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col w-full items-center justify-center">
          <Skeleton className="mb-6" height={30} width={300} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
          <div className="flex flex-col w-full max-w-md space-y-4 items-center">
            <Skeleton count={4} height={50} width={200} className="m-2" baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
          </div>
        </div>
      ) : (
        <>
          {/* The question */}
          <p className="text-center mb-6">{currentQuestion}</p>
          <div className="flex flex-col w-50 items-center gap-4 mb-6">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerClick(option)}
                disabled={selectedAnswer !== null}
                className={`px-6 py-3 w-40 text-slate-500 rounded-lg ${selectedAnswer === option
                  ? isCorrect
                    ? 'bg-green-300'
                    : 'bg-red-300'
                  : 'bg-slate-300 hover:bg-slate-400'
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="flex justify-center items-center">
            {selectedAnswer && (
              <p className={`text-lg font-semibold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {isCorrect ? "Correct!" : "Incorrect!"}
              </p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-between items-center mt-6">

        {/* AskBuddy component */}
        <div>
          <AskBuddy answer={selectedAnswer} correctAnswer={correctAnswer} isCorrect={isCorrect} />
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer}
          className={`px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300 ${!selectedAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>

    </div>
  );
};

export default TextQuiz;
