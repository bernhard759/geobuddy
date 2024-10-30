export const determineDifficulty = (userProfile, region) => {
    const performance = userProfile[region];
    if (performance.correct >= 5) {
      return 'hard';
    } else if (performance.correct >= 3) {
      return 'medium';
    }
    return 'easy';
  };