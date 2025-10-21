# ACT Math Practice App

A MERN stack application using Google Firestore for spaced repetition learning of ACT math questions.

## Overview

This project is a full-stack, production-ready MVP of an ACT Math Practice web application. The core feature is a spaced repetition learning system to help students practice and master ACT math questions efficiently.

## Features

-   **Spaced Repetition Algorithm:** The app intelligently schedules questions based on your performance to maximize long-term retention.
-   **Priority Matrix:** A unique visualization that plots your accuracy against your average time for each subcategory, helping you instantly identify your biggest areas for improvement.
-   **Engaging Session Summary:** Get immediate, Duolingo-style feedback after each session with a clear breakdown of your performance on each question.
-   **Practice More:** Never run out of questions. After your daily session, you can keep practicing with a fresh set of random problems to sharpen your skills.

## Tech Stack

-   **Frontend:** React (Vite), TypeScript, Bootstrap 5
-   **Backend:** Node.js, Express, TypeScript
-   **Database:** Google Cloud Firestore
-   **Authentication:** Firebase Authentication (Google Sign-In)

## Setup and Installation

### Prerequisites

-   Node.js (v18 or later)
-   npm
-   A Firebase project with Firestore and Google Authentication enabled.

### 1. Server Setup

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 3. Environment Setup & Seeding

This project is configured to run in three separate environments: `development` (your local machine), `staging` (for beta testing), and `production` (for the live app). Each environment must have its own Firebase project.

#### a. Set up Firebase Admin Credentials:

For the backend to communicate with the correct Firebase project, you need to provide it with a "service account key" for each environment.

1.  **For each of your three Firebase projects** (dev, staging, prod), go to your Firebase project settings > "Service accounts".
2.  Click "Generate new private key" to download the JSON key file.
3.  Rename the downloaded files and place them in the `server/config/` directory with the following names:
    *   `serviceAccountKey-dev.json`
    *   `serviceAccountKey-staging.json`
    *   `serviceAccountKey-prod.json`
4.  **Important:** These key files are secret and should never be committed to version control. The `.gitignore` file is already configured to ignore them.

#### b. Run the Database Seeding Script:

To populate your Firestore database with questions, you must run the seed script and specify which environment you are targeting.

```bash
# In the /server directory
# Replace {env} with 'dev', 'staging', or 'prod'
npm run seed -- --env={env}
```

### 4. Run the Server

```bash
# In the /server directory
# This will automatically use your -dev credentials
npm run dev
```

### 2. Client Setup

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Create a .env file and add your client-side Firebase configuration keys
cp .env.example .env

# Run the client development server
npm run dev
```
