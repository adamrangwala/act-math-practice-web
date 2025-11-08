# Pre-Flight Checklist for Preliminary Testing

This document outlines the critical steps to perform on the `staging` environment before sharing the application with preliminary testers. Following this checklist ensures that the core user experience is stable and data is clean.

---

### Step 1: Finalize and Seed Your Data 🎯

This ensures your testers have questions to answer.

1.  **Finalize `questions.json`:** Make sure all the questions you want to test with are in `act-math-mern-app/seed-data/questions.json`.
2.  **Clean the Database:** In your **staging** Firebase console, delete the `users`, `userSubcategoryProgress`, and `userStats` collections entirely. This guarantees you are testing the "new user" experience from a truly clean slate.
3.  **Seed the Questions:** Run the seed command from the `server` directory to populate the `questions` collection.
    ```bash
    npm run seed -- --env=staging
    ```

---

### Step 2: The "New User" Critical Path Test 🚶‍♂️

Do this yourself in an incognito browser window to simulate a brand new user.

1.  **Login:** Go to your Vercel URL. Does the login page appear correctly? Can you sign in with a Google account?
2.  **First Dashboard Load:** After logging in, do you land on the dashboard?
    *   Are the **Rolling Accuracy**, **Day Streak**, and **Total Sessions** all displayed as **0**?
    *   Does the "Skills Breakdown" section show the placeholder message: "Your Skills Breakdown will appear here..."?
    *   Does the **Dashboard Guide** appear and function correctly?
3.  **Start a Session:** Click "Begin Daily Practice." Does a practice session start and show the first question?
4.  **Complete a Full Session:**
    *   Answer every question in the session.
    *   On the very last question, click the "Finish Session" button.
5.  **Check the Summary:** Are you correctly navigated to the `/summary` page? Do the stats on that page seem reasonable for the session you just completed?
6.  **Return to Dashboard:** Navigate back to the dashboard. Now, check the key metrics:
    *   **Total Sessions:** Does it now show **1**? (This is the most important check for our last fix).
    *   **Rolling Accuracy:** Does it show a non-zero percentage?
    *   **Day Streak:** Does it show **1**?

---

### Step 3: The "Returning User" Check 🔄

1.  **Close the browser and wait a minute.**
2.  **Re-open the app** and go to your Vercel URL. You should be automatically logged in.
3.  **Check the Dashboard:** Do all the stats from your first session (Accuracy, Streak, Sessions) appear correctly?
4.  **Start a Second Session:** Click "Begin Daily Practice" again. This confirms the logic for a returning user works. You don't have to complete this session, just ensure it starts.

---

### Step 4: Final Sanity Check ✅

*   **Review All Questions:** Open `preview.html` one last time and quickly scroll through every question. Look for any obvious formatting errors in the math or diagrams. It's better for you to catch a typo now than for a tester to get confused by it.

---

### Step 5: Pre-Launch Readiness 🚀

These are the final steps before going live.

1.  [x] **Connect Custom Domain:** Ensure `actmathsprint.com` is pointing to your production Vercel frontend.
2.  [x] **Implement User Feedback Mechanism:** Confirm the "Feedback" button in the Navbar links to the Google Form.
3.  [x] **Finalize User Onboarding:** Verify the multi-step onboarding (Role, Test Date, Scores, Dashboard Guide) is fully functional and persists data.
4.  [ ] **Wipe Production Database:** (Manual step for you) Clear all user and progress data from the production Firebase database before launch.
5.  [ ] **Increase Question Count:** Ensure `seed-data/questions.json` has at least 50-100 high-quality questions.