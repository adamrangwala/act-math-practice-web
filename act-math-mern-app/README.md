# ACT Math Practice App

A MERN stack application using Google Firestore for spaced repetition learning of ACT math questions.

## Overview

This project is a full-stack web application designed to help students master ACT math questions. It uses a spaced repetition algorithm to intelligently schedule questions and features a unique Priority Matrix to help users identify and focus on their weakest areas.

## Tech Stack

-   **Frontend:** React (Vite), TypeScript, Bootstrap 5
-   **Backend:** Node.js, Express, TypeScript
-   **Database:** Google Cloud Firestore
-   **Authentication:** Firebase Authentication (Google Sign-In)

---

## Environment Setup

This project uses a three-environment setup: `development`, `staging`, and `production`.

1.  **Firebase:** Create three separate Firebase projects (e.g., `act-math-dev`, `act-math-staging`, `act-math-prod`). In each project, enable **Firestore** and **Google Authentication**.
2.  **Service Account Keys:** For each Firebase project, go to Project Settings > Service Accounts and generate a new private key. Rename these files and place them in the `server/config/` directory as:
    -   `serviceAccountKey-dev.json`
    -   `serviceAccountKey-staging.json`
    -   `serviceAccountKey-prod.json`
3.  **Client Keys:** For each Firebase project, create a **Web App**. Copy the `firebaseConfig` object for each project.

---

## Local Development Setup

### 1. Backend Server

1.  Navigate to the `server/` directory.
2.  Install dependencies: `npm install`.
3.  Run the development server: `npm run dev`. The server will run on `http://localhost:5000` and will automatically use the `serviceAccountKey-dev.json`.

### 2. Frontend Client

1.  Navigate to the `client/` directory.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file by copying `.env.example`.
4.  Paste the `firebaseConfig` keys from your **development** (`dev`) Firebase project into the `.env` file.
5.  Run the development server: `npm run dev`. The app will be available at `http://localhost:3000`.

### 3. Seeding the Database

To populate your database with questions, run the seed script from the `server/` directory, targeting the desired environment.

```bash
# Replace {env} with 'dev', 'staging', or 'prod'
npm run seed -- --env={env}
```

---

## Deployment

This project is configured for continuous deployment to a staging environment.

-   **Backend:** Hosted on **Render**. Connected to the `develop` branch.
-   **Frontend:** Hosted on **Vercel**. Connected to the `develop` branch.

### Backend Deployment (Render)

1.  Create a new **Web Service** on Render and connect it to your GitHub repository.
2.  **Settings:**
    -   **Name:** `act-math-app-staging`
    -   **Root Directory:** (leave blank)
    -   **Branch:** `develop`
    -   **Build Command:** `cd act-math-mern-app/server && npm install && npm run build`
    -   **Start Command:** `node act-math-mern-app/server/dist/server.js`
3.  **Environment Variables:**
    -   `NODE_ENV`: `staging`
    -   `GOOGLE_CREDENTIALS_JSON`: Paste the entire content of your `serviceAccountKey-staging.json` file.

### Frontend Deployment (Vercel)

1.  Create a new **Project** on Vercel and connect it to your GitHub repository.
2.  **Settings:**
    -   **Project Name:** `act-math-app-staging`
    -   **Framework Preset:** `Vite`
    -   **Root Directory:** `act-math-mern-app/client`
3.  **Git:** Set the **Production Branch** to `develop`.
4.  **Environment Variables:** Add all the `VITE_` keys from your **staging** Firebase project's web app config.