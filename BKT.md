# Bayesian Knowledge Tracing (BKT) Model

## Key Concepts

BKT tracks a learner's knowledge of each skill individually using four parameters:

1. **P(L0)** - Initial Probability of Knowledge: The probability that a learner already knows the skill before any attempts.
2. **P(T)** - Transition Probability: The probability that a learner will learn the skill after each attempt.
3. **P(G)** - Guess Probability: The probability that the learner will answer correctly by guessing, despite not knowing the skill.
4. **P(S)** - Slip Probability: The probability that the learner will answer incorrectly due to a slip, even though they know the skill.

The model updates the probability of the learner's knowledge state after each attempt, helping determine when they have likely mastered the skill.

### BKT Parameter Values in the Code

In the JavaScript code, these parameters are defined in the `BKT_PARAMS` object:

```javascript
const BKT_PARAMS = {
    P_L0: 0.2,  // initial knowledge probability
    P_T: 0.15,  // transition (learning) probability
    P_G: 0.25,  // guessing probability
    P_S: 0.1    // slipping probability
};
```

These values can be adjusted based on empirical data or tuned for specific types of learners or content.

---

## Implementing Bayesian Knowledge Tracing in the Code

The BKT model updates the learner's knowledge probability after each question attempt. If the learner answers correctly, the probability that they know the skill increases; if they answer incorrectly, it decreases, accounting for factors like guessing and slipping.

### Step 1: Initializing the User Profile

In our model, each region (e.g., Europe, Asia) is treated as a separate skill to be tracked. When the user profile is generated, we initialize each region with:

- `P_L` (the probability the learner knows the skill), set to `P_L0`.
- Other tracking properties such as `correct`, `incorrect`, and `points`.

```javascript
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
```

### Step 2: Updating the Knowledge State

Each time the learner attempts a question, we call the `updateUserProfile` function, which includes the `calculateBKT` function to update the knowledge state.

The knowledge state, `P_L`, is updated based on whether the answer was correct or incorrect. The calculation is done by the `calculateBKT` function:

```javascript
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
```

#### Explanation of the `calculateBKT` function:

- **Calculate Probability of Correct Response**: Depending on whether the response was correct or incorrect, this computes `P_correct`, the probability that the response matches the learner's knowledge.
- **Update Probability**: The updated knowledge probability, `P_L`, is calculated differently based on whether the learner answered correctly or not.
- **Transition Probability**: Finally, `P_L` is adjusted using the transition probability, `P_T`, which reflects the chance of learning from this attempt.

### Step 3: Updating the Profile with New Knowledge

The `updateUserProfile` function updates the user profile with the new knowledge probability calculated by `calculateBKT`:

```javascript
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
```

The new knowledge probability is stored in the `P_L` property for each region, dynamically tracking the learner's understanding as they continue.

### Step 4: Adjusting Difficulty Based on Knowledge State

Using the updated knowledge probability, we can adjust the difficulty level for each region in `determineDifficulty`:

```javascript
export const determineDifficulty = (userProfile, region) => {
    const { P_L } = userProfile[region];

    // Set difficulty based on knowledge probability thresholds
    if (P_L >= 0.8) return DIFFICULTIES.HARD;
    if (P_L >= 0.5) return DIFFICULTIES.MEDIUM;
    return DIFFICULTIES.EASY;
};
```

Here:
- If `P_L >= 0.8`, we consider the learner highly knowledgeable in the region and assign a **hard** difficulty.
- If `P_L >= 0.5`, the learner is moderately knowledgeable, and we assign a **medium** difficulty.
- Otherwise, the difficulty remains **easy**.

---

## Example Walkthrough

Let’s go through an example to see how BKT works in this model:

1. **Initialization**: Assume we initialize a learner's profile with `P_L0 = 0.2` (20% initial knowledge). They start with an **easy** question in Europe.

2. **Answering Correctly**: The learner answers correctly.
   - The `calculateBKT` function calculates a new `P_L` using `P_G` and `P_S`.
   - Given a correct answer, `P_L` increases, reflecting that they’re more likely to know this skill.

3. **Determining New Difficulty**: If `P_L` is now above 0.5, `determineDifficulty` will adjust the region difficulty to **medium**.

4. **Subsequent Attempts**: As the learner continues to answer correctly, `P_L` will increase, and the difficulty may eventually reach **hard**.

If they answer incorrectly, the knowledge probability may decrease based on the slip and guess probabilities, allowing the model to select easier questions as appropriate.
