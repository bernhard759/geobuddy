import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TextQuiz from './components/TextQuiz';
import GraphicalQuiz from './components/GraphicalQuiz';
import NotFound from './components/NotFound';
import Home from './components/Home';
import { FaChevronRight, FaChevronLeft, FaChevronCircleUp, FaChevronCircleDown, FaBars } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

/* Constants */
const REGIONS = {
  EUROPE: 'Europe',
  AFRICA: 'Africa',
  ASIA: 'Asia',
  AMERICAS: 'Americas'
};
const POINTS = { "easy": 1, "medium": 2, "hard": 3 };
const REGION_MAX = 15;

/* User profile init generator */
const generateInitialUserProfile = () => {
  const initialProfile = {};
  Object.values(REGIONS).forEach(region => {
    initialProfile[region] = { correct: 0, incorrect: 0, points: 0, difficulty: 'easy' };
  });
  return initialProfile;
};

const App = () => {
  // User model
  const [userProfile, setUserProfile] = useState(generateInitialUserProfile);
  const [answeredCapitals, setAnsweredCapitals] = useState([]);
  const [answeredCountries, setAnsweredCountries] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(REGIONS.EUROPE);

  // Badges
  const [earnedBadges, setEarnedBadges] = useState([]); // Tracks earned badges
  const [newBadge, setNewBadge] = useState(null); // For new badge popup

  // Technical
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isRegionProgressVisible, setIsRegionProgressVisible] = useState(false); // Toggle state for collapsible section
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const toggleRegionProgress = () => {
    setIsRegionProgressVisible(!isRegionProgressVisible);
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const updateUserProfile = (region, correct, difficulty) => {
    setUserProfile(prev => {
      const performance = prev[region];
      return {
        ...prev,
        [region]: {
          correct: correct ? performance.correct + 1 : performance.correct,
          incorrect: correct ? performance.incorrect : performance.incorrect + 1,
          points: correct ? performance.points + POINTS[difficulty] : performance.points,
          difficulty: performance.difficulty
        }
      };
    });
  };

  const updateUserProfileDifficulty = (region, difficulty) => {
    setUserProfile(prev => {
      const performance = prev[region];
      return {
        ...prev,
        [region]: {
          correct: performance.correct,
          incorrect: performance.incorrect,
          points: performance.points,
          difficulty: difficulty
        }
      };
    });
  };

  /* Progress calculation stuff */
  const calculateProgress = (current, max) => Math.min((current / max) * 100, 100);
  const totalCorrect = Object.values(REGIONS).reduce(
    (total, region) => total + (userProfile[region]?.correct || 0),
    0
  );
  const totalPoints = Object.values(REGIONS).reduce(
    (total, region) => total + (userProfile[region]?.points || 0),
    0
  );

  // Function to generate badges based on user performance
  const getBadges = () => {
    return Object.keys(REGIONS).map(region => {
      const regionName = REGIONS[region];
      const isExpert = userProfile[regionName]?.correct >= REGION_MAX;
      return isExpert ? `${regionName} Expert` : null;
    }).filter(badge => badge !== null);
  };

  // Effect to detect and display new badges
  useEffect(() => {
    const badges = getBadges();
    const newEarnedBadges = badges.filter(badge => !earnedBadges.includes(badge));

    if (newEarnedBadges.length > 0) {
      setNewBadge(newEarnedBadges[0]); // Display the first new badge
      setEarnedBadges(badges); // Update earned badges list

      // Hide the popup after 3 seconds
      setTimeout(() => setNewBadge(null), 3000);
    }
  }, [userProfile]);


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  /* Markup */
  return (
    <Router>
      <div className="h-100 flex flex-col bg-white text-slate-500">

        {/* Header */}
        <header className="bg-slate-50 py-4 px-6 border-b-2 border-slate-200 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            Geo<span className="text-orange-500"><i>Buddy</i></span>
          </h1>
          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Home</Link>
            <Link to="/text-quiz" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Text Quiz</Link>
            <Link to="/graphical-quiz" className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-100">Graphical Quiz</Link>
          </nav>

          {/* Hamburger Menu Icon */}
          <button onClick={toggleMobileMenu} className="md:hidden text-2xl text-slate-500">
            <FaBars />
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-100">
            <nav className="flex flex-col items-start space-y-2 p-4">
              <Link to="/" onClick={toggleMobileMenu} className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-200 w-full">Home</Link>
              <Link to="/text-quiz" onClick={toggleMobileMenu} className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-200 w-full">Text Quiz</Link>
              <Link to="/graphical-quiz" onClick={toggleMobileMenu} className="text-slate-600 p-2 rounded hover:text-orange-500 hover:bg-slate-200 w-full">Graphical Quiz</Link>
            </nav>
          </div>
        )}

        {/* Content section */}
        <div className="flex flex-grow text-slate-500 h-screen">
          <div className={`overflow-y-scroll bg-slate-200 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'w-64' : 'w-16'} flex-shrink-0`}>
            <div className="flex items-center justify-between p-4">
              <h2 className="font-bold text-lg text-center w-full">{isSidebarExpanded ? 'User Model' : ''}</h2>
              <button
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                className="text-2xl text-slate-400"
              >
                {isSidebarExpanded ? <FaChevronLeft /> : <FaChevronRight />}
              </button>
            </div>

            {isSidebarExpanded && (
              <div className="p-4">
                <p>Total Correct Answers: {totalCorrect}</p>
                <p>Total Points: {totalPoints}</p>
                <hr />
                <p>Current Region: {currentRegion}</p>
                <p>Level in that region: {userProfile[currentRegion].difficulty}</p>
                <hr />

                {/* Overall Score Gauge */}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Total Points</h3>
                  <div className="w-24 h-24 mx-auto">
                    <CircularProgressbar
                      value={totalPoints}
                      maxValue={REGION_MAX * Object.keys(REGIONS).length * 2}
                      text={`${totalPoints} points`}
                      styles={buildStyles({
                        pathColor: `var(--color-progress)`,
                        textColor: `var(--color-slate-500)`,
                        trailColor: `var(--color-slate-300)`,
                      })}
                    />
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Overall Answers Progress</h3>
                  <div className="w-full bg-slate-300 rounded-full h-4">
                    <div
                      className="h-4 rounded-full"
                      style={{ width: `${calculateProgress(totalCorrect, REGION_MAX * Object.keys(REGIONS).length)}%`, backgroundColor: "var(--color-progress)" }}
                    ></div>
                  </div>
                  <p className="text-sm mt-1">{totalCorrect} / {REGION_MAX * Object.keys(REGIONS).length}</p>
                </div>

                {/* Region-specific Progress Bars */}
                <div>
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2 flex items-center">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={toggleRegionProgress}
                          className="mr-2 p-2 rounded-full text-blue-500 focus:outline-none hover:bg-slate-300"
                        >
                          {!isRegionProgressVisible ? <FaChevronCircleDown /> : <FaChevronCircleUp />}
                        </button>
                        <div className="text-sm">{isRegionProgressVisible ? 'Hide' : 'Show'} Progress by Region</div>
                      </div>
                    </h3>

                    {isRegionProgressVisible && (
                      <div>
                        {Object.values(REGIONS).map(region => (
                          <div key={region} className="mb-3">
                            <p className="text-sm">{region}</p>
                            <div className="w-full bg-slate-300 rounded-full h-4">
                              <div
                                className="h-4 rounded-full"
                                style={{
                                  width: `${calculateProgress(userProfile[region]?.correct || 0, REGION_MAX)}%`,
                                  backgroundColor: "var(--color-progress)"
                                }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1">
                              {userProfile[region]?.correct || 0} / {REGION_MAX}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Badges Section */}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Badges</h3>
                  <div className="flex flex-wrap gap-4">
                    {Object.values(REGIONS).map(region => (
                      <div
                        key={region}
                        className={`w-16 h-16 flex p-2 items-center justify-center rounded-full text-white text-center text-[0.5rem] font-bold uppercase ${userProfile[region]?.correct >= REGION_MAX ? 'bg-gradient-to-r from-emerald-500 to-emerald-300' : 'bg-gradient-to-r from-slate-400 to-slate-300'}`}
                      >
                        {userProfile[region]?.correct >= REGION_MAX ? `${region} Expert` : ""}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Badge Popup */}
          {newBadge && (
            <div className="fixed z-50 bottom-4 right-4 p-4 bg-emerald-400 text-white rounded-lg shadow-lg">
              You earned a new badge: {newBadge}!
            </div>
          )}


          {/* Content */}
          <div className={`overflow-y-scroll flex-grow flex items-start justify-center mt-4 p-6 transition-all duration-300 ${isSidebarExpanded && 'hidden sm:flex'}`}>
            <div className="container mx-auto">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/text-quiz"
                  element={<TextQuiz regions={REGIONS} userProfile={userProfile} updateUserProfile={updateUserProfile} updateUserProfileDifficulty={updateUserProfileDifficulty} answeredCapitals={answeredCapitals} setAnsweredCapitals={setAnsweredCapitals} currentRegion={currentRegion} setCurrentRegion={setCurrentRegion} />} />
                <Route path="/graphical-quiz"
                  element={<GraphicalQuiz regions={REGIONS} userProfile={userProfile} updateUserProfile={updateUserProfile} updateUserProfileDifficulty={updateUserProfileDifficulty} answeredCountries={answeredCountries} setAnsweredCountries={setAnsweredCountries} currentRegion={currentRegion} setCurrentRegion={setCurrentRegion} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </div>


        {/* Footer */}
        <footer className="bg-slate-700 text-slate-300 p-6 mt-auto text-center w-full">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-sm">
                <p>GeoBuddy</p>
              </div>

              <div className="flex space-x-4">
                <Link to="/" className="hover:text-orange-500">Home</Link>
                <a href="https://github.com/bernhard759/geobuddy" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500">GitHub</a>
              </div>

              <div className="text-sm">
                <p>Developed by me</p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </Router>
  );
};

export default App;
