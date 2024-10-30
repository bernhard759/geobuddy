# GeoBuddy: Intelligent Tutoring System for Learning World Capitals and Countries

GeoBuddy is an intelligent tutoring system (ITS) built to help learners master capitals and countries from around the globe. With personalized question difficulty, region-focused content, and interactive quizzes, GeoBuddy dynamically adapts to the learner’s knowledge and preferences, offering both a graphical and text-based quiz interface. GeoBuddy is designed using React and Vite for fast, interactive frontend experiences, and leverages OpenAI's GPT for hints, fun facts, and domain-specific support.

## Table of Contents
- [Overview](#overview)
- [Intelligent Tutoring System Components](#intelligent-tutoring-system-components)
  - [Learner Model](#learner-model)
  - [Tutoring Model](#tutoring-model)
  - [Domain Model](#domain-model)
- [Technical Overview](#technical-overview)
  - [Key Technologies](#key-technologies)
  - [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Running GeoBuddy](#running-geobuddy)
- [Testing](#testing)



---

## Overview
GeoBuddy is built as a modern ITS with three main models:
1. **Learner Model**: Captures the learner’s current knowledge, updating dynamically based on quiz responses.
2. **Tutoring Model**: Adapts question difficulty and selected regions to suit the learner’s progress.
3. **Domain Model**: Provides hints and fun facts about countries, leveraging OpenAI's GPT-3/4 API to offer domain-specific knowledge.

GeoBuddy uses these models to deliver a highly engaging and adaptive learning experience for students, educators, or anyone looking to improve their knowledge of world capitals and countries.

## Intelligent Tutoring System Components
### Learner Model
The **Learner Model** tracks the learner’s current understanding across various regions (e.g., Europe, Asia, Americas, Africa). It records:
- **Correct Answers** and **Incorrect Answers** for each region
- **Points** based on question difficulty
- **Difficulty Level** for each region, adjusted as learners achieve set benchmarks

This model enables the system to adapt to the learner’s strengths and weaknesses and provide personalized questions accordingly.

### Tutoring Model
The **Tutoring Model** applies the Learner Model data to dynamically adjust:
- **Question Difficulty**: Difficulty levels (easy, medium, hard) increase as the learner performs better in specific regions.
- **Region Selection**: Prioritizes regions where the learner has less knowledge to encourage well-rounded learning.
- **Hints and Fun Facts**: GeoBuddy’s tutor can deliver educational insights, explanations, and extra information to enhance understanding.

The Tutoring Model allows GeoBuddy to be responsive and tailored, ensuring that the learning experience aligns with individual progress.

### Domain Model
The **Domain Model** is powered by OpenAI’s GPT API. It is responsible for generating:
- **Hints** to guide the learner on difficult questions
- **Fun Facts** about regions and countries for added engagement
- **Feedback and Explanations** to deepen understanding

The model uses the OpenAI API, allowing GeoBuddy to access a vast range of information on global topics and deliver interactive, conversational guidance.

## Technical Overview

### Key Technologies
- **React**: Used for UI components and application structure, with `react-router-dom` managing multiple quiz modes (Text Quiz and Graphical Quiz).
- **Vite**: A fast build tool that enables hot module replacement, ensuring a quick and efficient development environment.
- **Vitest**: For testing and ensuring code stability with React Testing Library.
- **OpenAI GPT API**: Integrates GPT for hints, explanations, and fun facts. *For production, the OpenAI key should be securely managed and accessed via a backend API*.


## Setup and Installation

1. **Clone the repository and cd into it**:

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Add OpenAI API Key**:
   - For development, add your OpenAI API key in an environment variable file or in the code directly (but remember to remove it for production).
   - *For production, create a backend API to securely handle OpenAI requests.*

## Running GeoBuddy
- **Start the Development Server**:
  ```bash
  npm run dev
  ```

- **Build for Production**:
  ```bash
  npm run build
  ```

- **Preview Production Build**:
  ```bash
  npm run preview
  ```

## Testing
Vitest is used for unit and component testing.

- **Run Tests**:
  ```bash
  npm run test
  ```

GeoBuddy is designed to provide a dynamic and enriching learning experience by combining AI-driven tutoring models and interactive learning techniques. Enjoy exploring the world with GeoBuddy!