import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import OpenAI from 'openai';
import AskBuddy from './AskBuddy';
import { determineDifficulty } from '../utils/difficulty';

const MapController = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);

  return null;
};


const GraphicalQuiz = ({
  regions,
  userProfile,
  updateUserProfile,
  updateUserProfileDifficulty,
  answeredCountries,
  setAnsweredCountries,
  currentRegion,
  setCurrentRegion
}) => {
  const [currentCoordinates, setCurrentCoordinates] = useState([0, 0]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Initialize OpenAI API with your API key
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Select a region based on user performance
  const selectRegion = () => {
    const weightedRegions = Object.values(regions).map(region => {
      const performance = userProfile[region];
      const weight = Math.max(0, 10 - performance.correct);
      return { region, weight };
    });

    const totalWeight = weightedRegions.reduce((sum, { weight }) => sum + weight, 0);
    let random = Math.random() * totalWeight;

    for (const { region, weight } of weightedRegions) {
      random -= weight;
      if (random < 0) return region;
    }

    return regions[0];
  };

  // Fetch a new question from OpenAI
  const getQuestion = async (avoid, region) => {
    setLoading(true);
    const difficulty = determineDifficulty(userProfile, region);
    let regionPrompt = `Provide a ${difficulty} quiz question about a country in the ${region} region.`;
    regionPrompt += ` Don't ask for questions present here: ${avoid}.`;
    regionPrompt += ` Also provide the latitude and longitude of the capital of this country.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          content: `${regionPrompt} Format the response as: Question: Which {country} is this? Options: {Option1}, {Option2}, {Option3}, {Option4} Correct Answer: {CorrectOption} Latitude: {Latitude} Longitude: {Longitude}`,
        }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const { choices } = response;
      if (choices && choices.length > 0) {
        const answer = choices[0].message.content.trim();

        // Parse the question response
        const questionPattern = /Question:\s*(.+?)\s*Options:\s*(.+?)\s*Correct Answer:\s*(.+?)\s*Latitude:\s*([-\d.]+)\s*Longitude:\s*([-\d.]+)/;
        const match = answer.match(questionPattern);

        if (match) {
          const question = match[1].trim();
          const optionsString = match[2].trim();
          const correctAnswer = match[3].trim();
          const latitude = parseFloat(match[4].trim());
          const longitude = parseFloat(match[5].trim());

          // Split options based on comma
          const options = optionsString.split(",").map(option => option.trim());

          // Ensure this country hasn't been answered yet
          const isAlreadyAnswered = answeredCountries.includes(correctAnswer);
          if (isAlreadyAnswered) {
            getQuestion(avoid); // Fetch a new question if this country has already been answered
            return;
          }

          setCurrentQuestion(question);
          setOptions(shuffleArray([...options]));
          setCorrectAnswer(correctAnswer);
          setCurrentCoordinates([latitude, longitude]);
        } else {
          console.error('Received answer is not in the expected format:', answer);
          getQuestion(avoid, region); // Fetch a new question if the format is incorrect
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setCurrentQuestion('Error fetching question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle user answer selection
  const handleAnswerClick = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setAnsweredCountries(prev => [...prev, correctAnswer]);
    }

    /* Update user model */
    if (correct) {
      updateUserProfile(currentRegion, true, userProfile[currentRegion].difficulty);
    } else {
      updateUserProfile(currentRegion, false, userProfile[currentRegion].difficulty);
    }
  };

  // Fetch the first question on component mount
  useEffect(() => {
    getQuestion('', currentRegion);
  }, []);

  // Function to handle "Next" button click
  const handleNextQuestion = () => {

    // Reset state
    setSelectedAnswer(null); // Reset selected answer
    setIsCorrect(null); // Reset isCorrect state

    // Select a new region
    let region = selectRegion();
    setCurrentRegion(region);

    updateUserProfileDifficulty(region, determineDifficulty(userProfile, region));

    // Get new question
    getQuestion(answeredCountries, region);
  };

  // Helper to shuffle answer options
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  return (
    <div className="relative p-8 bg-slate-50 rounded-lg border-2 border-slate-200">
      <h1 className="text-2xl font-bold mb-6 text-center">Graphical Geography Quiz</h1>
      <p>In which country is this capital?</p>
      {/* Map displaying the capital */}
      <MapContainer center={currentCoordinates} zoom={5} style={{ height: '400px', width: '100%' }} className="z-10">
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> | &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapController coords={currentCoordinates} />
        <Marker position={currentCoordinates}>
          <Popup>Which city is here?</Popup>
        </Marker>
      </MapContainer>

      {/* Display question and options */}
      {loading ? (
        <div className="flex flex-row items-center justify-center gap-4 m-4">
          <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
          <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
          <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
          <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
        </div>
      ) : (
        <>
          <div className="flex flex-row items-center justify-center gap-4 m-4">
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
          <AskBuddy answer={selectedAnswer} correctAnswer={correctAnswer} isCorrect={isCorrect} isCountry={true} />
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

export default GraphicalQuiz;
