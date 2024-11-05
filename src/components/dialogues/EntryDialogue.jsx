import React, { useState } from 'react';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const EntryDialog = ({ regions, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [difficulties, setDifficulties] = useState({});

  const handleNext = () => {
    if (currentStep < regions.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDifficultyChange = (region, difficulty) => {
    setDifficulties({ ...difficulties, [region]: difficulty });
  };

  const handleSubmit = () => {
    onSubmit({ name, difficulties });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        {currentStep === 0 ? (
          <div>
            <h2 className="text-xl font-bold">Welcome to GeoBuddy!</h2>
            <p>Please enter your name:</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 mt-4 border rounded"
              placeholder="Your Name"
            />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold">Set Your Difficulty</h2>
            <p>How comfortable are you with {regions[currentStep - 1]}?</p>
            <select
              value={difficulties[regions[currentStep - 1]] || ''}
              onChange={(e) => handleDifficultyChange(regions[currentStep - 1], e.target.value)}
              className="w-full p-2 mt-4 border rounded"
            >
              <option value="">Select Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        )}

        <div className="mt-4 flex justify-between">
          <button onClick={handlePrev} disabled={currentStep === 0} className={currentStep === 0 ? "text-gray-300" : "text-orange-500 hover:bg-slate-200"}>
          <FaArrowLeft />
          </button>
          {currentStep === regions.length ? (
            <button onClick={handleSubmit} className="bg-orange-500 text-white px-4 py-2 rounded">
              Submit
            </button>
          ) : (
            <button onClick={handleNext} className="text-orange-500 px-4 py-2 rounded hover:bg-slate-200">
              <FaArrowRight/>
            </button>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: regions.length + 1 }).map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full ${index === currentStep ? 'bg-orange-500' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntryDialog;
