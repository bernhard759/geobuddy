// Constants
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

// Function to select a region based on user performance
export const selectRegion = (userProfile, regions) => {
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


export const generateCapitalTextPrompt = () => {
    // todo
}

export const generateCountryGraphicalPrompt = () => {
    // todo
}

export const generateBuddyPrompt = () => {
    // todo
}

export const generateCHatPrompt = () => {
    // todo
}