 Project: Build a MERN Stack ACT Math Practice App with Spaced Repetition

  Objective:
  Create a full-stack, production-ready MVP of an ACT Math Practice web application. The application will use the MERN stack (React,
  Node.js, Express.js) for the frontend and backend, but will substitute MongoDB with Google Firestore for the database. The core
  feature is a spaced repetition learning system to help students practice and master ACT math questions efficiently.

  ---

  1. Core Technology Stack

   * Frontend: React (initialized with Vite for a modern build setup), styled with Bootstrap 5 (via npm).
   * Backend: Node.js runtime with the Express.js framework.
   * Database: Google Cloud Firestore (for users, questions, and userProgress data).
   * Authentication: Firebase Authentication (specifically, Google Sign-In).

  ---

  2. Key Development & Code Quality Guidelines

   * File Length Limit: Critically important. To ensure the codebase is readable, maintainable, and modular, no file should exceed 200 
     lines of code. Break down complex logic into smaller, single-responsibility functions, components, and modules.
   * Modularity: Create small, reusable components in React and modular services/controllers in the backend.
   * Environment Variables: All sensitive keys (Firebase config, API secrets, etc.) must be managed through .env files and not
     hardcoded.
   * Comments: Write clean, purposeful comments that explain the why behind complex logic, not the what.
   * Error Handling: Implement robust error handling on both the client (e.g., displaying user-friendly messages) and server (e.g.,
     proper try-catch blocks and status codes).

  ---

  3. Suggested Project Structure

    1 /act-math-mern-app
    2 ├── /client/                # React Frontend
    3 │   ├── /src/
    4 │   │   ├── /assets/
    5 │   │   ├── /components/    # Reusable React components (< 200 lines each)
    6 │   │   │   ├── Dashboard.jsx
    7 │   │   │   ├── PracticeScreen.jsx
    8 │   │   │   ├── Login.jsx
    9 │   │   │   ├── StatsCard.jsx
   10 │   │   │   └── SettingsModal.jsx
   11 │   │   ├── /services/      # Firebase integration
   12 │   │   │   ├── firebase.js # Firebase config and initialization
   13 │   │   │   └── api.js      # Functions for calling the backend API
   14 │   │   ├── App.jsx
   15 │   │   └── main.jsx
   16 │   ├── .env
   17 │   ├── index.html
   18 │   ├── package.json
   19 │   └── vite.config.js
   20 │
   21 ├── /server/                # Node.js/Express Backend
   22 │   ├── /controllers/       # Request handling logic (< 200 lines each)
   23 │   │   ├── authController.js
   24 │   │   ├── questionController.js
   25 │   │   └── progressController.js
   26 │   ├── /models/            # Data interaction logic
   27 │   │   └── spacedRepetition.js # SM-2 algorithm
   28 │   ├── /routes/            # API route definitions
   29 │   │   └── api.js
   30 │   ├── /middleware/
   31 │   │   └── authMiddleware.js # Middleware to verify Firebase tokens
   32 │   ├── .env
   33 │   ├── server.js           # Express server setup
   34 │   └── package.json
   35 │
   36 └── /seed-data/
   37     └── questions.json      # 50+ initial ACT math questions

  ---

  4. Firestore Data Models

  Define Firestore collections with the following structures:

   * `users`:
       * uid (document ID, from Firebase Auth)
       * email, displayName, photoURL
       * dailyQuestionLimit (default: 20)
       * createdAt, lastActiveAt
   * `questions`:
       * questionId (document ID)
       * category, subcategories (array of strings)
       * questionText, options (array), correctAnswerIndex, solutionText
       * difficulty (1-3, initial value)
       * globalTotalAttempts, globalCorrectAttempts, globalTotalTimeSpent (for dynamic difficulty)
   * `userSubcategoryProgress`:
       * docId (e.g., `{userId}_{subcategoryName}`)
       * userId, subcategory
       * masteryScore (e.g., 0.0 to 1.0)
       * lastReviewedAt, nextReviewDate
       * totalAttempts, correctAttempts, totalTimeSpent

  ---

  5. Backend API Endpoints (Express)

  Create a RESTful API with the following routes. All routes should be protected and require a valid Firebase Auth token.

   * POST /api/users/init: Creates a user profile in Firestore upon first login.
   * GET /api/questions/today: Fetches the user's daily set of questions based on the spaced repetition algorithm.
   * POST /api/progress/submit: Submits a user's answer, updates userProgress using the SM-2 algorithm.
   * GET /api/stats/dashboard: Retrieves aggregated stats for the user's dashboard (questions due, mastered, accuracy).
   * GET /api/stats/heatmap: Retrieves category-level performance stats.
   * PUT /api/settings: Updates user settings (e.g., dailyQuestionLimit).

  ---

  6. Frontend Features (React)

   * Authentication: A clean login page with a "Sign in with Google" button. Use React Context or a simple state management solution
     to handle the user's auth state.
   * Dashboard: Display user stats (due today, mastered, accuracy) and the performance heatmap.
   * Practice Screen:
       * Show one question at a time with multiple-choice options.
       * Provide instant feedback and a detailed solution.
       * Track time spent per question.
   * State Management: Use React hooks (useState, useEffect, useContext) for state management. Avoid complex libraries like Redux for
     this MVP.
   * Routing: Use a lightweight router like react-router-dom if you decide to use separate pages, or manage views with conditional
     rendering for a true single-page experience.

  ---

  7. Documentation Requirements

  Create the following documentation files:

   1. `README.md`: A comprehensive guide covering:
       * Project overview and features.
       * Step-by-step setup instructions for both the client and server.
       * Instructions on how to create and use a .env file with the necessary environment variables (e.g., Firebase config).
       * Deployment instructions.
   2. `DESIGN_DECISIONS.md`: A document to log key architectural choices. The first entry in this file should be:
      > "To promote readability, maintainability, and modular design, all source code files in this project are limited to a maximum
  of 200 lines. Complex logic should be broken down into smaller, single-responsibility functions and components."

  ---

  8. Final Deliverables

   * The complete source code for the client (React) and server (Node.js/Express) applications.
   * A seed-data folder with a questions.json file containing at least 50 high-quality ACT math questions.
   * A script or instructions on how to seed the Firestore database with the questions.
   * The required documentation files (README.md, DESIGN_DECISIONS.md).
