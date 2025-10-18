# MERN Stack Learning Guide: A Tour of This Project

Welcome! This guide is designed to help you understand the MERN stack by using this ACT Math Practice application as a practical example. Our goal is to demystify how the different parts of a modern web application work together.

## The Big Picture: The Restaurant Analogy

> **Note:** This project uses **TypeScript**, a superset of JavaScript that adds static types. This is why you see `.ts` and `.tsx` file extensions. The concepts are the same as with JavaScript, but with the added benefit of type safety, which helps prevent bugs.

Think of a web application like a restaurant. It helps to understand the two main parts: the **frontend** (what the customer sees) and the **backend** (the kitchen and staff).

1.  **Frontend (The Client):** This is the dining area of the restaurant. It's everything the user directly interacts with—the tables (UI), the menus (buttons), and the decor (styling). In our project, the `client` folder, built with **React**, is the dining area. It runs entirely in the user's web browser.

2.  **Backend (The Server):** This is the kitchen. It's hidden from the customer but does all the important work: preparing food (processing data), managing inventory (database), and handling special requests. Our `server` folder, built with **Node.js** and **Express**, is the kitchen. It runs on a remote computer (a server).

3.  **API (The Waiter):** How does the dining area communicate with the kitchen? Through a waiter. The waiter takes orders from the customer and brings them to the kitchen, then delivers the food back. An **API (Application Programming Interface)** is the waiter of a web app. It defines a set of rules for how the frontend can request information from the backend. Our `routes/api.ts` file defines these rules.

4.  **Database (The Pantry):** The kitchen needs a pantry to store ingredients. The **database** is the pantry, where all the application's data is stored—user profiles, questions, progress, etc. In this project, we are using **Google Firestore** instead of MongoDB.

---

## Deep Dive: A Tour of the Project Files

Let's walk through the key files and folders in this repository.

### The `server` Directory (The Kitchen)

This is where the core logic of our application lives.

-   `server.ts`: This is the main entrance to our kitchen. It starts the **Express** server, sets up middleware, and makes sure the server is ready to listen for requests from the frontend.

-   `/routes/api.ts`: This is the waiter's order pad. It defines all the possible API "endpoints" (URLs) that the frontend can request. For example, it might define that if someone requests `/api/questions/today`, the server should fetch today's questions.

-   `/controllers/`: These are the chefs. When a request comes in from a route, the controller contains the actual logic to fulfill that request. For example, `authController.ts` handles the logic for user authentication.

-   `/middleware/`: These are the security guards or quality checkers. Middleware functions run *before* the controller. `authMiddleware.ts` is a perfect example—it checks if a user is properly logged in before allowing them to access a protected API route.

-   `/config/firebase.ts`: This file contains the server's private configuration for connecting to Firebase services, like the Admin SDK for verifying users.

-   `.env`: This file holds secret keys and configuration variables for the server. It's like the key to the kitchen's back door—it should never be shared publicly.

### The `client` Directory (The Dining Area)

This is what the user sees and interacts with in their browser.

-   `index.html`: The single HTML page that the user's browser loads. It's mostly empty because...
-   `/src/main.tsx`: ...this file is the actual starting point of our **React** application. It tells the browser to render our main `App` component inside `index.html`.

-   `/src/App.tsx`: This is the main layout of our restaurant. It organizes the high-level structure of the UI, such as setting up routing or deciding whether to show the `Login` page or the `Dashboard`.

-   `/src/components/`: These are the reusable building blocks of our UI—the tables, chairs, and menus. `Login.tsx` is a component that shows the "Sign in with Google" button and handles the logic for when it's clicked. Breaking the UI into components keeps the code organized and reusable.

-   `/src/context/AuthContext.tsx`: This is like the restaurant's announcement system. It provides a global "state" for the entire application, so any component can easily check if a user is currently logged in (`currentUser`). This avoids having to pass user data down through many layers of components.

-   `/src/config/firebase.ts`: This file initializes the client-side Firebase SDK. It uses the public keys from the `.env` file to connect to our Firebase project from the browser.

-   `.env`: This file holds the *public* Firebase API keys. These are safe to be in the browser, as they only identify which Firebase project to connect to. They don't grant special permissions.

---

## The Authentication Flow: From Click to Login

Let's trace what happens when you click "Sign in with Google":

1.  **Click:** You click the button in the `Login.tsx` component.
2.  **Popup:** The `signInWithGoogle` function is called, which uses the client-side Firebase library to open the Google Sign-In popup.
3.  **Google Auth:** You sign in with your Google account. Google then sends a token back to our React app.
4.  **State Update:** The `onAuthStateChanged` listener in `AuthContext.tsx` detects that a user has successfully signed in. It updates the `currentUser` state.
5.  **UI Change:** Because the `currentUser` is no longer `null`, the application's UI will now reactively update—perhaps hiding the `Login` component and showing the `Dashboard` instead.

This entire process happens on the **client-side**. The backend gets involved when the client needs to access protected data (like fetching math questions). At that point, the client sends the user's Firebase token with the API request, and the `authMiddleware.ts` on the server verifies it to ensure the user is authentic.

This separation of concerns is the foundation of the MERN stack and modern web development.

---

## A Critical Concept: Client vs. Server Credentials

A common point of confusion is the two different sets of Firebase credentials used in this project. **They are not interchangeable, and it is a major security risk to mix them up.**

### 1. Client-side Config (in `client/.env`)

*   **Purpose:** **Identification.** These are public keys that tell the user's browser which Firebase project to connect to.
*   **Permissions:** **User-level.** They only grant the permissions of a regular user.
*   **Analogy:** The bank's public street address. Anyone can know it to go and interact with a teller.

### 2. Server-side Service Account Key (in `server/serviceAccountKey.json`)

*   **Purpose:** **Authentication & Administration.** This is a **secret** key that proves to Google that a request is coming from your trusted server.
*   **Permissions:** **Admin-level.** This key grants your server **full administrative control** over your Firebase project, bypassing all security rules.
*   **Analogy:** The master key to the bank's vault. It must be kept secret and is only for the bank manager (your server).

In short, the client keys are for identifying your app, while the server key is for giving your server god-like powers over your project. Never, ever expose the server key to the client.
