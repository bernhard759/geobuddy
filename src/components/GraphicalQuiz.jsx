import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import OpenAI from 'openai';
import AskBuddy from './AskBuddy';
import { shuffleArray } from '../utils/shuffler';
// Adaptive engine imports
import {
  determineDifficulty,
  selectRegion,
  generateCountryGraphicalPrompt
} from '../engine/adaptiveEngine';

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
  const [isError, setIsError] = useState(false);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Initialize OpenAI API
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  // Fetch a new question from OpenAI
  const getQuestion = async (avoid, region) => {
    setLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "user",
          // generate prompt from adaptive engine
          content: generateCountryGraphicalPrompt(avoid, region, determineDifficulty(userProfile, region)),
        }],
        max_tokens: 150,
        temperature: 0.3,
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
      setIsError(true); // Set error flag to true
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
    let region = selectRegion(userProfile, regions);
    setCurrentRegion(region);

    updateUserProfileDifficulty(region, determineDifficulty(userProfile, region));

    // Get new question
    getQuestion(answeredCountries, region);
  };


  // Markup
  return (
    <div className="relative p-8 bg-slate-50 rounded-lg border-2 border-slate-200">
      <h1 className="text-2xl font-bold mb-6 text-center">Graphical Geography Quiz</h1>
      {isError ?
        (<>
          <p className="text-center">An error occurred while fetching the question. Please try again later.</p>
        </>)
        :
        (<>
          <p className="text-center">In which country is this capital?</p>
          {/* Map displaying the capital */}
          <MapContainer center={currentCoordinates} zoom={5} style={{ height: '300px', width: '100%', maxWidth: "800px", margin: "0 auto" }} className="z-10">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> | &copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController coords={currentCoordinates} />
            <Marker position={currentCoordinates}>
              <Popup>In which country is this city located?</Popup>
            </Marker>
          </MapContainer>

          {/* Display question and options */}
          {loading ? (
            <div className="flex flex-row flex-wrap items-center justify-center gap-4 m-4">
              <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
              <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
              <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
              <Skeleton height={50} width={150} baseColor="var(--skeleton-base-color)" highlightColor="var(--skeleton-highlight-color)" />
            </div>
          ) : (
            <>
              <div className="flex flex-row flex-wrap items-center justify-center gap-4 m-4">
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
            </>)
          }
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
