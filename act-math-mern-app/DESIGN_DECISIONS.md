# Design Decisions

## Calculator UI

### 1. Color Scheme and Layout

-   **Color Scheme:** The calculator will feature a dark-mode color scheme with a dark gray or black background, white or light gray numbers, and orange or yellow accents for operators and functions. This will provide a modern, high-contrast look that is easy on the eyes.
-   **Layout:** The calculator will have a clean, grid-based layout with responsive buttons that provide clear visual feedback on hover and click. The display will be large and easy to read, with a separate area for showing the history of calculations.

### 2. Functionality

-   **Basic Operations:** The calculator will support all basic arithmetic operations, including addition, subtraction, multiplication, and division.
-   **Trigonometric Functions:** The calculator will include buttons for sine, cosine, and tangent, as well as their inverse functions.
-   **Exponents and Roots:** The calculator will support exponents, square roots, and other roots.
-   **Parentheses and Order of Operations:** The calculator will correctly handle parentheses and follow the standard order of operations.

### 3. User Experience

-   **Accessibility:** The calculator will be designed with accessibility in mind, including high-contrast colors, clear button labels, and keyboard support.
-   **Responsiveness:** The calculator will be fully responsive and work seamlessly on both desktop and mobile devices.
> "To ensure that the 'Skills Breakdown' section provides statistically meaningful insights, a **five-question threshold** was implemented. A subcategory card will only be displayed on the dashboard after the user has answered at least five questions belonging to that subcategory. This prevents the system from making premature judgments about a user's proficiency based on a small, potentially unrepresentative, sample of answers."

> "A **floating calculator component** was designed and implemented to provide users with easy access to a calculator at any point during a practice session. Key design choices include: 1) **UI/Theme:** A dark-mode theme was chosen for a modern, high-contrast aesthetic. 2) **Input Logic:** A standard 'number-then-function' input flow was adopted for reliability, avoiding the complexity of a full mathematical parser. 3) **Functionality:** A toggle for 'Degrees' and 'Radians' was included to match the requirements of different ACT problem types."

> "The Practice Screen UI was refined to improve focus and usability. The timer and calculator were moved out of the main content flow. The **calculator is now accessed via a floating action button**, and the **timer is a small, persistent widget**. This declutters the main question area and ensures these tools are always accessible without being intrusive. Additionally, answer choices were given a subtle lift-and-highlight animation on hover to improve interactivity."

> "To improve the onboarding experience for new users, the 'Skills Breakdown' section on the dashboard was enhanced. A **progress counter** (e.g., '0/58 Skills Assessed') was added to show the user's progress against the total number of skills. An **info icon with a tooltip** was also added to proactively explain that skills only appear after five questions have been answered in that topic. This prevents user confusion and clarifies the path to populating the dashboard."