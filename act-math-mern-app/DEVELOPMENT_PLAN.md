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

  - [x] Create project structure (`client`, `server`, `seed-data`)
  - [x] Initialize React client with Vite
  - [x] Initialize Node.js server
  - [x] Create initial documentation (`README.md`, `DESIGN_DECISIONS.md`)
  - [x] Create `DEVELOPMENT_PLAN.md`
  - [x] Basic Express server setup

- [x] **Phase 2: Authentication**

  - [x] **Backend:** Create `.env` file for Firebase config
  - [x] **Backend:** Setup Firebase Admin SDK
  - [x] **Backend:** Create middleware to protect API routes
  - [x] **Backend:** Create `/api/users/init` endpoint
  - [x] **Frontend:** Create `.env` file for Firebase config
  - [x] **Frontend:** Setup Firebase client-side SDK
  - [x] **Frontend:** Build `Login.tsx` component with Google Sign-In
  - [x] **Frontend:** Implement auth state management (React Context)

- [x] **Phase 3: Core Practice Loop**
  - [x] **Backend:** Implement concept-based spaced repetition model.
  - [x] **Backend:** Create `/api/questions/today` endpoint with intelligent selection.
  - [x] **Backend:** Create `/api/progress/submit` endpoint with nuanced progress tracking.
  - [x] **Frontend:** Build `PracticeScreen.tsx` component.
  - [x] **Frontend:** Fetch questions and display them.
  - [x] **Frontend:** Submit answers and show feedback.

- [x] **Phase 4: Subcategory & Visualization Overhaul**
  - [ ] **Docs:** Update `ACT_MATH_TOPICS.md` with the new official subcategory list.
  - [ ] **Data:** Update `questions.json` to use the new subcategories.
  - [ ] **Backend:** Evolve data model to track `totalTimeSpent` per subcategory.
  - [x] **Backend:** Create `/api/stats/priority-matrix` endpoint.
  - [x] **Frontend:** Build `PriorityMatrix.tsx` visualization component.
  - [x] **Frontend:** Integrate the new visualization into the dashboard.

- [x] **Phase 5: UI/UX Refinements & Settings**
  - [x] **Frontend:** Create `SessionSummary.tsx` component for post-practice review.
  - [x] **Frontend:** Redesign summary screen to be more engaging and scannable.
  - [x] **Frontend:** Implement "Practice More" functionality for continuous learning.
  - [x] **Frontend:** Redesign navbar with a user menu dropdown for a cleaner UI.
  - [x] **Frontend:** Move brand title above the navbar for better visual hierarchy.
  - [x] **Backend:** Re-implement `GET` and `PUT` endpoints for user settings.
  - [x] **Backend:** Create `DELETE /api/progress/all` endpoint to reset user data.
  - [x] **Frontend:** Build `Settings.tsx` page to manage daily limits and reset progress.

- [ ] **Phase 6: Dashboard & Stats (Continued)**
  - [ ] **Frontend:** Add comparative feedback (user vs. global average) to the practice screen/dashboard.
  - [ ] **Backend:** Implement logic to dynamically calculate question difficulty from global stats.

- [ ] **Phase 7: Finalization**
  - [ ] Populate `questions.json` with 50+ questions
  - [ ] Create data seeding script/instructions
  - [ ] Finalize `README.md` with full setup instructions

- [ ] **Phase 8: Mock Test Mode (Post-MVP)**
  - [ ] **Backend:** Create `/api/questions/mock-test` endpoint.
  - [ ] **Frontend:** Build `MockTestScreen.tsx` component.
  - [ ] **Frontend:** Build `ResultsPage.tsx` component.

---

## Challenges & Solutions

This section documents notable technical challenges encountered during development and the solutions implemented.

1.  **Challenge:** During a major refactoring to implement `react-router-dom`, several bugs were introduced, including a `SyntaxError` due to stray comments in the JSX and a `ReferenceError` from a function being declared twice.
    -   **Solution:** The component file (`App.tsx`) had been corrupted by a series of incomplete `replace` operations. The solution was to perform a clean `write_file` operation, completely overwriting the corrupted file with a correct, validated version. This restored stability and resolved the cascading errors.

2.  **Challenge:** After cleaning up the `PracticeScreen.tsx` component, a `ReferenceError: handleSaveSettings is not defined` appeared because the function was removed but a child component (`PracticeSettings`) that depended on it was not.
    -   **Solution:** The `PracticeSettings` component and its related state were legacy code from a feature that was not currently in scope. The solution was to remove the component and all related logic from `PracticeScreen.tsx`, simplifying the component and resolving the error. This highlighted the importance of ensuring all dependencies are accounted for during refactoring.

3.  **Challenge:** Implementing the card-flip animation introduced several subtle but jarring UI bugs: misaligned text, a "jump" in the layout when the card appeared, and an unsmooth height transition between questions of different sizes.
    -   **Solution:** A multi-step refinement process was required. 1) Text alignment was fixed by giving the option letters a `min-width`, creating a stable column. 2) The initial layout jump was resolved by using a `useEffect` hook to measure and set the card's height as soon as it rendered. 3) The transition between questions was smoothed by removing the code that collapsed the container's height, allowing CSS to handle the animation between the old and new heights gracefully.

4.  **Challenge:** The main application layout felt too narrow, but attempts to widen it using Bootstrap's container system (`xl`, `xxl`, `fluid`) had no visible effect or produced inconsistent results.
    -   **Solution:** A debugging process revealed that global styles were overriding the container's width. The root cause was a combination of a `max-width` property on the `#root` element in `App.css` and `display: flex` with `place-items: center` on the `body` in `index.css`. The solution was to remove these conflicting global styles and implement a custom `.app-container` class, which gave us direct and reliable control over the main content width.

