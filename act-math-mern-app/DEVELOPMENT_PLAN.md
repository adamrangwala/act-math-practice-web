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

- [ ] **Phase 4: Subcategory & Visualization Overhaul**
  - [ ] **Docs:** Update `ACT_MATH_TOPICS.md` with the new official subcategory list.
  - [ ] **Data:** Update `questions.json` to use the new subcategories.
  - [ ] **Backend:** Evolve data model to track `totalTimeSpent` per subcategory.
  - [ ] **Backend:** Create `/api/stats/priority-matrix` endpoint.
  - [ ] **Frontend:** Build `PriorityMatrix.tsx` visualization component.
  - [ ] **Frontend:** Integrate the new visualization into the dashboard.

- [ ] **Phase 5: Dashboard & Stats (Continued)**
  - [ ] **Frontend:** Add comparative feedback (user vs. global average) to the practice screen/dashboard.
  - [ ] **Backend:** Implement logic to dynamically calculate question difficulty from global stats.

- [ ]  **Phase 6: Settings**
  - [ ] **Backend:** Create `/api/settings` endpoint
  - [ ] **Frontend:** Build `SettingsModal.tsx` component

- [ ] **Phase 7: Finalization**
  - [ ] Populate `questions.json` with 50+ questions
  - [ ] Create data seeding script/instructions
  - [ ] Finalize `README.md` with full setup instructions

- [ ] **Phase 8: Mock Test Mode (Post-MVP)**
  - [ ] **Backend:** Create `/api/questions/mock-test` endpoint.
  - [ ] **Frontend:** Build `MockTestScreen.tsx` component.
  - [ ] **Frontend:** Build `ResultsPage.tsx` component.
