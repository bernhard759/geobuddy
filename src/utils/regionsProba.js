/* Function to select a region based on user performance */
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