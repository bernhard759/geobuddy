// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from "lottie-react";
import animationData from '../assets/animation.json';
import "./Home.css";

const Home = () => {
  return (
    <div className="text-center">
  <div className="animation-container">
      <Lottie animationData={animationData} loop={true} />
    </div>

      <h1 className="text-4xl font-bold mb-4">Welcome to GeoBuddy!</h1>
      <p className="text-lg mb-6">Learn the capitals all around the globe with your adaptive online buddy.</p>
      
      
      <div className="flex justify-center gap-6">

        {/* Text quiz */}
        <Link
          to="/text-quiz"
          className="bg-orange-500 text-white py-2 px-6 rounded hover:bg-orange-600 transition duration-300"
        >
          Start Text Quiz
        </Link>

        {/* Graphical quiz */}
        <Link
          to="/graphical-quiz"
          className="bg-orange-500 text-white py-2 px-6 rounded hover:bg-orange-600 transition duration-300"
        >
          Start Graphical Quiz
        </Link>

      </div>
    </div>
  );
};

export default Home;
