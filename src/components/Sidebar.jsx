import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaChevronCircleUp, FaChevronCircleDown } from 'react-icons/fa';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
    REGIONS,
    REGION_MAX,
    getTotalCorrectAnswers,
    getTotalPoints,
} from "../engine/adaptiveEngine";

export default function Sidebar({
    userProfile,
    isSidebarExpanded,
    setIsSidebarExpanded,
    currentRegion
}) {

    // State management
 
    const [isRegionProgressVisible, setIsRegionProgressVisible] = useState(false);


    // Toggle the region progress section
    const toggleRegionProgress = () => {
        setIsRegionProgressVisible(!isRegionProgressVisible);
    };

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    // Scoring from the adaptive engine
    const totalCorrect = getTotalCorrectAnswers(userProfile, REGIONS);
    const totalPoints = getTotalPoints(userProfile, REGIONS);

    return (
        <div className={`overflow-y-scroll bg-slate-200 transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-16'} flex-shrink-0`}>
            <div className="flex items-center justify-between p-4">
                <h2 className="font-bold text-lg text-center w-full">{isSidebarExpanded ? 'Learner Model' : ''}</h2>
                <button onClick={toggleSidebar} className="text-2xl text-slate-400">
                    {isSidebarExpanded ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
            </div>

            {isSidebarExpanded && (
                <div className="p-4">
                    <p>Total Correct Answers: <span className="text-xl">{totalCorrect}</span></p>
                    <p>Total Points: <span className="text-xl">{totalPoints}</span></p>
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
                                style={{ width: `${Math.min((totalCorrect / (REGION_MAX * Object.keys(REGIONS).length)) * 100,100)}%`, backgroundColor: "var(--color-progress)" }}
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
                                        className="mr-2 p-2 rounded-full text-violet-500 focus:outline-none hover:bg-slate-300"
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
                                                        width: `${Math.min((userProfile[region]?.correct || 0) / REGION_MAX * 100,100)}%`,
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
    );
};

