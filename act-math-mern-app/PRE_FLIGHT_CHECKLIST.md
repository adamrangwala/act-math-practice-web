# Pre-Flight Checklist for Beta Release

This document outlines the critical user paths to test on the **production** environment (`actmathsprint.com`) before the beta release.

---

### Step 1: Finalize and Seed Production Data 🎯

This ensures testers have a clean and correct set of questions.

1.  **Finalize `questions.json`:** Ensure `act-math-mern-app/seed-data/questions.json` contains all questions for the beta.
2.  **Clean the Production Database:** In your **production** Firebase console (`act-math-prod`), manually delete the `users`, `userSubcategoryProgress`, `userStats`, and `userDailyActivity` collections. This guarantees all testers start with the "new user" experience.
3.  **Seed the Questions:** From the `server` directory, run the seed script targeting the production environment.
    ```bash
    npm run seed -- --env=production
    ```

---

### Step 2: The "New User" Critical Path Test 🚶‍♂️

**Instructions:** Use a fresh incognito browser window for this entire test.

1.  **Navigate to Login:** Go to `https://www.actmathsprint.com`. You should be redirected to the `/login` page.
2.  **Sign In:** Sign in with a Google account.
3.  **Onboarding Flow:** You should be redirected to the `/onboarding` page.
    *   Complete all steps: Role selection, test date, score goals, and daily question limit.
    *   Click "Start Practicing" at the end.
4.  **First Practice Session:** You should be navigated to the `/practice` screen.
    *   Complete the entire session by answering all questions.
    *   After the last question, you should be taken to the `/summary` page.
5.  **Session Summary:** Verify the stats on the summary page are reasonable.
6.  **First Dashboard Load:** Navigate to the dashboard.
    *   **Total Sessions:** Should be **1**.
    *   **Day Streak:** Should be **1**.
    *   **Rolling Accuracy:** Should show a non-zero percentage.
    *   **Dashboard Guide:** The guide/modal should appear. Dismiss it.

---

### Step 3: The "No Repeat Questions" Test 🔄

1.  **Start a Second Session:** From the dashboard, click "Begin Daily Practice" again.
2.  **Verify New Questions:** You should be presented with a **different** set of questions than your first session.
3.  **Complete All Questions (Optional but Recommended):** If you have enough unique questions, keep doing sessions until the question pool is exhausted.
4.  **Verify "All Done" Message:** Once you have answered every unique question in the database for the day, starting a new session should **not** show a question. Instead, it should display the message: "Great work! You've answered all available questions for today."

---

### Step 4: The "Account Deletion & Re-registration" Test 🗑️

1.  **Navigate to Settings:** Go to the `/settings` page.
2.  **Delete Account:** Click the "Delete Account" button and confirm the action in the modal.
3.  **Verify Redirect:** You should be logged out and redirected to the `/login` page.
4.  **Verify Data Deletion (Manual):** In the Firebase console, confirm the user record and all associated data (in `users`, `userStats`, etc.) for that user have been deleted.
5.  **Re-register:** Sign in again with the **exact same Google account**.
6.  **Verify Onboarding:** You should be treated as a brand new user and be taken directly to the `/onboarding` flow again. This is the most critical check for this test.

---

### Step 5: Final Sanity Checks ✅

*   **Privacy Policy:** Can you access the Privacy Policy from the footer and the login page?
*   **Targeted Practice:** Go to the dashboard, and from the "Skills Breakdown," click on a specific skill. Does it correctly start a 5-question targeted practice session for that skill?
*   **Visual Polish:** Click through all pages. Are there any obvious visual bugs, formatting errors, or typos?

---

### Step 6: Beta Readiness 🚀

*   [x] **Custom Domain Connected:** `actmathsprint.com` points to the Vercel frontend.
*   [x] **Production Backend Live:** The Render backend is running and accessible.
*   [x] **CORS Configured:** The backend correctly accepts requests from `actmathsprint.com`.
*   [x] **Firebase Auth Domain Authorized:** `actmathsprint.com` and Vercel domains are authorized in Firebase Auth.
*   [x] **`vercel.json` Deployed:** The cross-origin policy fix is live.
*   [ ] **User Feedback Mechanism:** Implement a "Feedback" button or link.
*   [ ] **Google Analytics:** Add your GA4 Measurement ID to the application.
