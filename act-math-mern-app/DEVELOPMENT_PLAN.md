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
  - [x] **Docs:** Update `ACT_MATH_TOPICS.md` with the new official subcategory list.
  - [x] **Data:** Update `questions.json` to use the new subcategories.
  - [x] **Backend:** Evolve data model to track `totalTimeSpent` per subcategory.
  - [x] **Backend:** Create `/api/stats/priority-matrix` endpoint.
  - [x] **Frontend:** Build `PriorityMatrix.tsx` visualization component.
  - [x] **Frontend:** Integrate the new visualization into the dashboard.

- [x] **Phase 5: UI/UX Refinements**
  - [x] **Frontend:** Create `SessionSummary.tsx` component for post-practice review.
  - [x] **Frontend:** Redesign summary screen with color-coding, improved time formatting, and aligned layout.
  - [x] **Frontend:** Implement badges and tooltips for a clean subcategory display.

- [ ] **Phase 6: Dashboard & Stats (Continued)**
  - [ ] **Frontend:** Add comparative feedback (user vs. global average) to the practice screen/dashboard.
  - [ ] **Backend:** Implement logic to dynamically calculate question difficulty from global stats.

- [ ]  **Phase 7: Settings**
  - [ ] **Backend:** Create `PUT /api/settings` endpoint to save user preferences.
  - [ ] **Backend:** Create `GET /api/settings` endpoint to retrieve user preferences.
  - [ ] **Backend:** Modify `GET /api/questions/today` to accept a `limit` parameter.
  - [ ] **Frontend:** Build `PracticeSettings.tsx` component for first-time users.
  - [ ] **Frontend:** Integrate settings prompt into the `PracticeScreen.tsx`.
  - [ ] **Frontend:** Build `SettingsModal.tsx` component for dashboard access.
  - [ ] **Frontend:** Integrate settings modal into the `Dashboard.tsx`.

- [ ] **Phase 8: Finalization**
  - [ ] Populate `questions.json` with 50+ questions
  - [ ] Create data seeding script/instructions
  - [ ] Finalize `README.md` with full setup instructions

- [ ] **Phase 9: Mock Test Mode (Post-MVP)**
  - [ ] **Backend:** Create `/api/questions/mock-test` endpoint.
  - [ ] **Frontend:** Build `MockTestScreen.tsx` component.
  - [ ] **Frontend:** Build `ResultsPage.tsx` component.
