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
};
export const POINTS = { "easy": 1, "medium": 2, "hard": 3 };
export const REGION_MAX = 15;

// Bayesian Knowledge Tracing parameters
const BKT_PARAMS = {
    P_L0: 0.2,  // initial knowledge probability
    P_T: 0.15,  // transition (learning) probability
    P_G: 0.25,  // guessing probability
    P_S: 0.1    // slipping probability
};

//---------------------------------------------
// Functions for the learner model
//---------------------------------------------

// Function to initialize a user profile for each region with Bayesian parameters
export const generateInitialUserProfile = (regions) => {
    const initialProfile = {};
    Object.values(regions).forEach(region => {
        initialProfile[region] = {
            correct: 0,
            incorrect: 0,
            points: 0,
            difficulty: 'easy',
            P_L: BKT_PARAMS.P_L0  // initial knowledge state for BKT
        };
    });
    return initialProfile;
};

// Function to update performance and Bayesian knowledge state
export const updateUserProfile = (userProfile, region, correct, difficulty) => {
    const updatedProfile = { ...userProfile };
    const performance = updatedProfile[region];

    // Calculate the knowledge state update
    const prevP_L = performance.P_L;
    const newP_L = calculateBKT(correct, prevP_L);

    updatedProfile[region] = {
        correct: correct ? performance.correct + 1 : performance.correct,
        incorrect: correct ? performance.incorrect : performance.incorrect + 1,
        points: correct ? performance.points + POINTS[difficulty] : performance.points,
        difficulty: performance.difficulty,
        P_L: newP_L  // update knowledge state
    };

    return updatedProfile;
};

// BKT function to calculate updated knowledge state
const calculateBKT = (correct, P_L) => {
    const { P_G, P_S, P_T } = BKT_PARAMS;

    // Calculate probability of correct response
    const P_correct = correct
        ? P_L * (1 - P_S) + (1 - P_L) * P_G
        : P_L * P_S + (1 - P_L) * (1 - P_G);

    // Update knowledge probability
    const updatedP_L = correct
        ? (P_L * (1 - P_S)) / P_correct
        : (P_L * P_S) / P_correct;

    // Apply learning transition
    return updatedP_L + (1 - updatedP_L) * P_T;
};

// Function to determine the new difficulty based on Bayesian knowledge probability
export const determineDifficulty = (userProfile, region) => {
    const { P_L } = userProfile[region];

    // Set difficulty based on knowledge probability thresholds
    if (P_L >= 0.8) return DIFFICULTIES.HARD;
    if (P_L >= 0.5) return DIFFICULTIES.MEDIUM;
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
    // First, set a weight based on knowledge probability
    const weightedRegions = Object.values(regions).map(region => {
        const performance = userProfile[region];
        const weight = Math.max(0, 1 - performance.P_L);  // lower knowledge -> higher weight
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

//---------------------------------------------
// Prompting
//---------------------------------------------

export const generateCapitalTextPrompt = (avoid, region, difficulty) => {
    let questionPrompt = difficulty === DIFFICULTIES.HARD
        ? `Provide a ${difficulty} quiz question about the capital city in the ${region} region. Describe the country instead of naming it but include an unambiguous hint in your description.`
        : `Provide a ${difficulty} quiz question about the capital city in the ${region} region.`;
    questionPrompt += ` Dont ask for questions present here: ${avoid}.`;
    let formatPrompt = 'Provide four different capitals as answer options (the correct one must of course be present in those options). Also dont include a Numbering in the Answer options.';
    let thePrompt = `${questionPrompt} ${formatPrompt} Format the response as: Question: What is the capital of {country}? Options: {Option1}, {Option2}, {Option3}, {Option4} Correct Answer: {CorrectOption}`;
    return thePrompt;
};

export const generateCountryGraphicalPrompt = (avoid, region, difficulty) => {
    let regionPrompt = `Provide a ${difficulty} quiz question about a country in the ${region} region. The answer should be a country and also the options.`;
    regionPrompt += ` Dont ask for questions on countries present here: ${avoid}.`;
    regionPrompt += ` Also provide the latitude and longitude of the capital of this country.`;
    return `${regionPrompt} Format the response as: Question: Which {country} is this? Options: {Option1}, {Option2}, {Option3}, {Option4} Correct Answer: {CorrectOption} Latitude: {Latitude} Longitude: {Longitude}`;
};

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

export const generateChatPrompt = (username) => {
    return `
    You are GeoBuddy, an educational assistant. Provide concise and accurate responses. 
    Do not answer questions about capitals of countries where the answer would be a capital city or country. In such questions answer with a hint describing the city or capital that was asked for.
    Avoid answering forbidden topics such as personal data requests, inappropriate or off-topic content.
    Only answer about topics that are connected to geography: cities, countries, continents, earth, lakes, forests, ...
    Never name a single city in your response.
    The person you are communicating with is called ${username}.
    `;
};
