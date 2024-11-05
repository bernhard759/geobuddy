import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TextQuiz from './components/TextQuiz';
import GraphicalQuiz from './components/GraphicalQuiz';
import NotFound from './components/NotFound';
import Home from './components/Home';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Chat from './components/Chat';
import Header from './components/Header';
import {
  REGIONS,
  REGION_MAX,
  DIFFICULTIES,
  generateInitialUserProfile,
  updateUserProfile,
  updateUserProfileDifficulty,
  getBadges
} from "./engine/adaptiveEngine";
import EntryDialog from './components/dialogues/EntryDialogue';
import Login from './components/Login';
import { useAuth } from './authProvider';


const App = () => {
  // User model
  const [userProfile, setUserProfile] = useState(generateInitialUserProfile(REGIONS));
  const [answeredCapitals, setAnsweredCapitals] = useState([]);
  const [answeredCountries, setAnsweredCountries] = useState([]);
  const [currentRegion, setCurrentRegion] = useState(REGIONS.EUROPE);
  const [username, setUsername] = useState(''); // State for the username

  // Badges
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);

  // Technical
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  // User auth
  const { user, loading, signOut } = useAuth();


  // Handle entry dialogue submit
  const handleDialogSubmit = (data) => {
    const { name, difficulties } = data;
    // Set the username from dialog
    setUsername(name);
    // Update userProfile with self-selected difficulties
    const updatedProfile = { ...userProfile };
    Object.keys(difficulties).forEach((region) => {
      if (updatedProfile[region]) {
        updatedProfile[region].difficulty = difficulties[region] == "" ? DIFFICULTIES.EASY : difficulties[region];
      }
    });
    setUserProfile(updatedProfile);
    setShowEntryDialog(false); // Hide the dialog after submission
  };


  // Update user profile on quiz response
  const handleUpdateUserProfile = (region, correct, difficulty) => {
    // Call the adaptive engine
    const updatedProfile = updateUserProfile(userProfile, region, correct, difficulty);
    setUserProfile(updatedProfile);
  };

  // Update the difficulty level for a specific region
  const handleUpdateUserProfileDifficulty = (region, newDifficulty) => {
    // Call the adaptive engine
    const updatedProfile = updateUserProfileDifficulty(userProfile, region, newDifficulty);
    setUserProfile(updatedProfile);
  };

  // Detect and display new badges
  useEffect(() => {
    // Get badges from the adaptive engine
    const badges = getBadges(userProfile, REGIONS, REGION_MAX);
    const newEarnedBadges = badges.filter(badge => !earnedBadges.includes(badge));

    if (newEarnedBadges.length > 0) {
      setNewBadge(newEarnedBadges[0]);
      setEarnedBadges(badges);

      // Hide the popup after 3 seconds
      setTimeout(() => setNewBadge(null), 3000);
    }
  }, [userProfile]);


  // User auth guard
  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;
  // Return the app content
  return (
    <Router>
      <div className="h-100 flex flex-col bg-white text-slate-500">

        {/* Header */}
        <Header user={user} signOut={signOut} />

        {/* Content section */}
        <div className="flex flex-grow text-slate-500 h-screen">


          {/*Sidebar*/}
          <Sidebar userProfile={userProfile} isSidebarExpanded={isSidebarExpanded} setIsSidebarExpanded={setIsSidebarExpanded} currentRegion={currentRegion} />

          {/* Entry dialogue */}
          {showEntryDialog && <EntryDialog regions={Object.values(REGIONS)} onSubmit={handleDialogSubmit} />}


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
                  element={<TextQuiz regions={REGIONS} userProfile={userProfile} updateUserProfile={handleUpdateUserProfile} updateUserProfileDifficulty={handleUpdateUserProfileDifficulty} answeredCapitals={answeredCapitals} setAnsweredCapitals={setAnsweredCapitals} currentRegion={currentRegion} setCurrentRegion={setCurrentRegion} />} />
                <Route path="/graphical-quiz"
                  element={<GraphicalQuiz regions={REGIONS} userProfile={userProfile} updateUserProfile={handleUpdateUserProfile} updateUserProfileDifficulty={handleUpdateUserProfileDifficulty} answeredCountries={answeredCountries} setAnsweredCountries={setAnsweredCountries} currentRegion={currentRegion} setCurrentRegion={setCurrentRegion} />} />
                <Route path="/chat" element={<Chat username={username} />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />

      </div>
    </Router>
  );
};

export default App;
