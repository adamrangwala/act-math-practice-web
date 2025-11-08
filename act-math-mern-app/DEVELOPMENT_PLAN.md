## Development Workflow

To ensure a collaborative, stable, and easily debuggable process, we will follow this incremental workflow for each new feature:

1.  **Backend First (API Endpoint):**

    - I will create or modify the necessary API endpoint(s) on the Express server.
    - I will implement the core logic in the corresponding controller, including any database interaction.
    - I will add a basic test or provide instructions for you to verify the endpoint is working correctly _before_ any frontend work begins.

2.  **Frontend Second (UI Component):**

    - Once the backend API is confirmed to be working, I will build the corresponding React component(s).
    - I will connect the frontend component to the new API endpoint.
    - I will ask you to run the Vite development server (`npm run dev`) to visually and functionally test the new feature in the browser.

3.  **Review and Proceed:**
    - You can provide feedback, and we can iterate until the feature is working as expected.
    - Once confirmed, we will check it off the list and move to the next feature.

## Feature Checklist

- [x] **Phase 1: Project Setup & Initialization**
- [x] **Phase 2: Authentication**
- [x] **Phase 3: Core Practice Loop**
- [x] **Phase 4: Subcategory & Visualization Overhaul**
- [x] **Phase 5: UI/UX Refinements & Settings**
- [x] **Phase 6: Deployment & Infrastructure**
  - [x] **Environments:** Create separate Firebase projects for `dev`, `staging`, and `prod`.
  - [x] **Backend:** Configure and deploy the server to Render for staging.
  - [x] **Frontend:** Configure and deploy the client to Vercel for staging.
  - [x] **Backend:** Implement environment-aware logic for credentials.
  - [x] **Backend:** Overhaul seed script to be environment-aware.
  - [x] **Frontend:** Implement environment-aware logic for API calls.
  - [x] **Ops:** Debug and resolve all deployment, CORS, and build issues.

- [ ] **Phase 7: Beta Readiness**
  - [x] **Onboarding Enhancements**
    - [x] **Frontend & Backend:** Implement multi-step onboarding to capture user role.
    - [x] **Frontend & Backend:** Add step to capture user's official ACT test date.
    - [x] **Frontend & Backend:** Add optional step for current and target Math scores.
    - [x] **Frontend & Backend:** Implement one-time interactive Dashboard Guide.
  - [x] **Frontend:** Overhaul Dashboard UI with stat cards and detailed skills breakdown.
  - [x] **Frontend:** Implement logic for targeted practice drills from dashboard.
  - [x] **Frontend:** Enhance Practice Screen UI (animations, timer, calculator, progress bar).
  - [x] **Frontend:** Improve Practice Screen feedback with "Correct!" pop and confetti animation.
  - [x] **Frontend:** Refactor PracticeScreen.tsx into smaller components and hooks.
  - [ ] **Frontend:** Polish the Priority Matrix visual design (quadrant backgrounds, simplified color scheme).
  - [ ] **Data:** Populate `seed-data/questions.json` with at least 50 high-quality questions.

- [ ] **Phase 8: MVP Finalization**
  - [x] **Data Integrity:** Implement timer auto-pause and backend time cap.
    - [x] **Frontend:** Auto-pause practice timer when the browser tab is inactive.
    - [x] **Backend:** Add a maximum time threshold to prevent skewed global stats.
  - [ ] **Backend:** Implement logic to dynamically calculate question difficulty from global stats.
  - [ ] **Frontend:** Add comparative feedback (user vs. global average) to the practice screen/dashboard.
  - [ ] **Docs:** Finalize `README.md` with full setup and deployment instructions.

- [ ] **Phase 9: Mock Test Mode (Post-MVP)**
  - [ ] **Backend:** Create `/api/questions/mock-test` endpoint.
  - [ ] **Frontend:** Build `MockTestScreen.tsx` component.
  - [ ] **Frontend:** Build `ResultsPage.tsx` component.

---

## Challenges & Solutions

This section documents notable technical challenges encountered during development and the solutions implemented.

1.  **Challenge:** The initial deployment to a live environment failed due to a series of interconnected issues, including CORS errors, build failures, and client-side reference errors.
    -   **Solution:** A multi-step debugging process was required.
        1.  **Build Failures:** The `package.json` for both the client and server had to be modified to move build-time packages (like `typescript` and `@types/*`) from `devDependencies` to `dependencies`, as the hosting environment did not install dev dependencies.
        2.  **CORS Errors:** The backend server (`server.ts`) required a specific CORS configuration to whitelist the frontend's Vercel domain, as the browser's security policy blocks cross-origin requests by default.
        3.  **SPA Routing:** The frontend deployment on Vercel required a `vercel.json` file with a rewrite rule (`"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]`) to correctly handle client-side routing.
        4.  **Reference Errors:** A persistent `currentUser is not defined` error was traced to a race condition. The fix was to ensure that any `useEffect` hook that depended on the `currentUser` object first checked that the object was not `null` before attempting to make an API call.

2.  **Challenge:** The `replace` tool repeatedly failed to modify files, sometimes corrupting them, due to the `old_string` not being an exact match.
    -   **Solution:** The most robust solution was to pivot to a "read-modify-write" strategy. This involved reading the entire file content, performing the desired string manipulation in memory, and then using the `write_file` tool to completely overwrite the original file with the corrected content. For critical file corruption, `git rm --force` followed by `write_file` was used to ensure a clean slate.

3.  **Challenge:** The deployed application consistently failed with a generic "Failed to fetch" error, even though the backend was running.
    -   **Solution:** This was traced to a missing environment variable on the frontend. The `VITE_API_URL` variable was not set in the Vercel deployment, so the client-side code did not know the address of the Render backend. The fix was to add the `VITE_API_URL` environment variable to the Vercel project settings, pointing it to the correct Render service URL.

4.  **Challenge:** User data (like `testDate`) was not being saved, and the application was unable to load any data from the database.
    -   **Solution:** The default Firestore security rules were `allow read, write: if false;`, which blocks all database access. The fix was to implement a new set of rules that explicitly granted authenticated users permission to read and write to their own documents in the `users`, `userStats`, and `userSubcategoryProgress` collections, while allowing read-only access to public collections like `questions`.

5.  **Challenge:** After adding a `role` field to the user profile, existing users were incorrectly forced into the onboarding flow.
    -   **Solution:** The backend's `initUser` function was updated to handle this data migration scenario. When it detects a user profile that is missing the new `role` field, it performs a second check for existing stats. If stats are found, it identifies the user as a "legacy user," automatically assigns them a default role, and bypasses the onboarding flow, ensuring a seamless experience for existing users.

6.  **Challenge:** Several race conditions were causing bugs, including the first practice session being counted twice and the onboarding screen looping instead of navigating away.
    -   **Solution:** The fixes involved making state updates and navigation more declarative and sequential. The double-counting was resolved by consolidating the session-counting logic into a single backend function. The onboarding loop was fixed by removing a manual `navigate()` call and instead letting the top-level router in `App.tsx` handle the redirection automatically after the `isNewUser` state was updated.

7.  **Challenge:** The practice session timer continued to run when the user switched tabs or minimized the window, leading to highly skewed and inaccurate time data.
    -   **Solution:** A two-part solution was implemented. 1) **Frontend:** The timer logic in `PracticeScreen.tsx` was refactored to use the browser's `visibilitychange` event. This pauses the timer by tracking accumulated elapsed time and only restarting the interval when the tab is active. 2) **Backend:** A safety net was added to the `progressController.ts` to cap the maximum `timeSpent` for any single question at 10 minutes, ensuring the integrity of global statistics against any client-side anomalies.