# ACT Math Practice App

A MERN stack application using Google Firestore for spaced repetition learning of ACT math questions.

## Overview

This project is a full-stack, production-ready MVP of an ACT Math Practice web application. The core feature is a spaced repetition learning system to help students practice and master ACT math questions efficiently.

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

3.  **Set up Firebase Admin Credentials:**
    *   Go to your Firebase project settings > "Service accounts".
    *   Click "Generate new private key" and download the JSON file.
    *   Move the downloaded file into this `server` directory and rename it to `serviceAccountKey.json`.
    *   Create a file named `.env` in this `server` directory.
    *   Add the following line to the `.env` file:
        ```
        GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
        ```
    *   **Important:** The `serviceAccountKey.json` file is secret and should not be committed to version control. The `.gitignore` file is already configured to ignore it.

4.  **Run the server:**
    ```bash
    # Run in development mode (watches for changes)
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
