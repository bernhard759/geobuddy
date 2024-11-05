//---------------------------------------------
// Constants
//---------------------------------------------

export const REGIONS = {
    EUROPE: 'Europe',
    AFRICA: 'Africa',
    ASIA: 'Asia',
    AMERICAS: 'Americas'
};
export const DIFFICULTIES = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
}
export const POINTS = { "easy": 1, "medium": 2, "hard": 3 };
export const REGION_MAX = 15;


//---------------------------------------------
// Functions for the learner model
//---------------------------------------------

// Function to initialize a user profile for each region
export const generateInitialUserProfile = (regions) => {
    const initialProfile = {};
    Object.values(regions).forEach(region => {
        initialProfile[region] = { correct: 0, incorrect: 0, points: 0, difficulty: 'easy' };
    });
    return initialProfile;
};

// Function to update performance based on correctness and difficulty
export const updateUserProfile = (userProfile, region, correct, difficulty) => {
    const updatedProfile = { ...userProfile };
    const performance = updatedProfile[region];

    updatedProfile[region] = {
        correct: correct ? performance.correct + 1 : performance.correct,
        incorrect: correct ? performance.incorrect : performance.incorrect + 1,
        points: correct ? performance.points + POINTS[difficulty] : performance.points,
        difficulty: performance.difficulty
    };

    return updatedProfile;
};


// Function to determine the new difficulty based on performance
export const determineDifficulty = (userProfile, region) => {
    // Get the correct and incorrect answer nums from the learner model state
    const { correct, incorrect } = userProfile[region];
    // Calculate accuracy
    const accuracy = correct / (correct + incorrect + 1); // +1 to avoid division by zero

    // Stay in initial difficulty when just started
    if (correct+incorrect <= 3) return userProfile[region].difficulty;

    // Set the difficulty
    if (accuracy >= 0.8 && correct > 5) return DIFFICULTIES.HARD;
    if (accuracy >= 0.5 && correct > 3) return DIFFICULTIES.MEDIUM;
    return DIFFICULTIES.EASY;
};

// Function to set the new difficulty level in the profile
export const updateUserProfileDifficulty = (userProfile, region, newDifficulty) => {
    const updatedProfile = { ...userProfile };
    updatedProfile[region].difficulty = newDifficulty;
    return updatedProfile;
};


// Function to get the total number of correct answers across all regions
export const getTotalCorrectAnswers = (userProfile, regions) => {
    return Object.values(regions).reduce(
        (total, region) => total + (userProfile[region]?.correct || 0),
        0
    );
};

// Function to get the total points of a learner across all regions summed up
export const getTotalPoints = (userProfile, regions) => {
    return Object.values(regions).reduce(
        (total, region) => total + (userProfile[region]?.points || 0),
        0
    );
};

// Function for returning badges for a region
export const getBadges = (userProfile, regions, regionMax) => {
    return Object.keys(regions).map(region => {
        const regionName = regions[region];
        const isExpert = userProfile[regionName]?.correct >= regionMax;
        return isExpert ? `${regionName} Expert` : null;
    }).filter(badge => badge !== null);
};


// Function to select a region based on user performance using random weight algorithm
export const selectRegion = (userProfile, regions) => {
    // first we set a weight for each region based on the number of correct answers
    // the more correct answers the lower the weight
    const weightedRegions = Object.values(regions).map(region => {
        const performance = userProfile[region];
        const weight = Math.max(0, 10 - performance.correct);
        return { region, weight };
    });
    //console.log(weightedRegions);

    // Sum up all the weights together
    const totalWeight = weightedRegions.reduce((sum, { weight }) => sum + weight, 0);
    // Choose a random number between 0 and the total weight
    let random = Math.random() * totalWeight;
    
    // Now we loop over the weighted regions and subtract the weight from our random number
    // regions with higher weights reduce random by a larger amount and are thus more likely to be selected
    for (const { region, weight } of weightedRegions) {
        random -= weight;
        if (random < 0) return region;
    }
    // Default return
    return regions[0];
};


//---------------------------------------------
// Prompting
//---------------------------------------------

// Text quiz prompt
export const generateCapitalTextPrompt = (avoid, region, difficulty) => {
    let questionPrompt = difficulty === DIFFICULTIES.HARD
        ? `Provide a ${difficulty} quiz question about the capital city in the ${region} region. Describe the country instead of naming it but include an unambiguous hint in your description.`
        : `Provide a ${difficulty} quiz question about the capital city in the ${region} region.`;
    questionPrompt += ` Dont ask for questions present here: ${avoid}.`;
    let formatPrompt = 'Provide four different capitals as answer options (the correct one must of course be present in those options). Also dont include a Numbering in the Answer options.';
    let thePrompt = `${questionPrompt} ${formatPrompt} Format the response as: Question: What is the capital of {country}? Options: {Option1}, {Option2}, {Option3}, {Option4} Correct Answer: {CorrectOption}`;
    return thePrompt;
}

// Graphical quiz prompt
export const generateCountryGraphicalPrompt = (avoid, region, difficulty) => {
    let regionPrompt = `Provide a ${difficulty} quiz question about a country in the ${region} region. The answer should be a country and also the options.`;
    regionPrompt += ` Dont ask for questions on countries present here: ${avoid}.`;
    regionPrompt += ` Also provide the latitude and longitude of the capital of this country.`;
    return `${regionPrompt} Format the response as: Question: Which {country} is this? Options: {Option1}, {Option2}, {Option3}, {Option4} Correct Answer: {CorrectOption} Latitude: {Latitude} Longitude: {Longitude}`;
}

// Buddy prompt
export const generateBuddyPrompt = (answer, correctAnswer, isCorrect, isCountry) => {
    if (isCorrect) {
        return isCountry
            ? `Tell me an interesting fun fact about the country ${answer}.`
            : `Tell me an interesting fun fact about the capital city of ${answer}.`;
    } else {
        return isCountry
            ? `Describe the country ${correctAnswer} in two sentences without mentioning its name.`
            : `Describe the capital ${correctAnswer} in two sentences without mentioning its name.`;
    }
};

// Chat system prompt
export const generateChatPrompt = (username) => {
    return `
    You are GeoBuddy, an educational assistant. Provide concise and accurate responses. 
    Do not answer questions about capitals of countries where the answer would be a capital city or country. In such questions answer with a hint describing the city or capital that was asked for.
    Avoid answering forbidden topics such as personal data requests, inappropriate or off-topic content.
    Only answer about topics that are connected to geography: cities, countries, continents, earth, lakes, forests, ...
    Never name a single city in your response.
    The person you are communicating with is called ${username}.
    `;
}