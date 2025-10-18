# ACT Math Question Design Guide

This document outlines the standards and best practices for creating and formatting new questions for the ACT Math Practice application. Adhering to these guidelines is crucial for maintaining data consistency, application stability, and a high-quality user experience.

---

## 1. JSON Data Structure

All questions must be structured as a JSON object with the following fields. See the example below for a complete object.

```json
{
  "questionId": "string",
  "category": "string",
  "subcategories": ["string"],
  "questionText": "string",
  "options": ["string", "string", "string", "string", "string"],
  "correctAnswerIndex": "number",
  "solutionText": "string",
  "difficulty": "number",
  "diagramUrl": null,
  "diagramSvg": "string | null",
  "isActive": "boolean",
  "avgTimeSeconds": null
}
```

---

## 2. Field-by-Field Guidelines

-   **`questionId` (string):**
    -   A unique identifier for each question.
    -   **Convention:** Use the format `category_uniqueIdentifier` (e.g., `plane_geometry_001`, `pre_algebra_002`). This helps in organizing and retrieving questions.

-   **`category` (string):**
    -   The main mathematical category the question belongs to (e.g., "Plane Geometry", "Pre-Algebra", "Intermediate Algebra").

-   **`subcategories` (array of strings):**
    -   A list of more specific topics the question covers (e.g., "Pythagorean Theorem", "Mean, Median, & Mode").

-   **`questionText` (string):**
    -   The body of the question.
    -   Should be clear, concise, and formatted as plain text.

-   **`options` (array of 5 strings):**
    -   **Crucially, there must be exactly 5 options** to match the standard ACT format.
    -   The options should be provided as an array of strings in the correct order.

-   **`correctAnswerIndex` (number):**
    -   The zero-based index of the correct answer in the `options` array. For example, if the first option is correct, this value should be `0`.

-   **`solutionText` (string):**
    -   A detailed, step-by-step explanation of how to arrive at the correct answer.

-   **`difficulty` (number):**
    -   A number from 1 to 3 representing the manually-assigned difficulty of the question (1 = Easy, 2 = Medium, 3 = Hard).
    -   **Note:** This is a starting value. The long-term goal is for the system to dynamically calculate a more accurate difficulty rating based on global user performance data (e.g., average time spent, overall accuracy).

-   **`diagramSvg` (string | null):**
    -   If a question requires a diagram, it must be provided as an **inline SVG string**.
    -   SVGs should be reasonably sized (e.g., width around 250-300px) and styled with basic black strokes and fills unless color is necessary for the problem.
    -   If there is no diagram, this field should be `null`.

---

## 3. Formatting Mathematical Notation (MathJax)

To ensure mathematical formulas and symbols are rendered correctly and accessibly, this project uses the [MathJax](https://www.mathjax.org/) library.

-   **Rule:** Any mathematical expression in the `questionText`, `options`, or `solutionText` fields **must** be wrapped in standard MathML tags.

-   **Example:** For an option that is the square root of 28, the JSON should be:
    ```json
    "options": [
      "<math><msqrt><mn>28</mn></msqrt></math>",
      "<math><mn>4</mn><msqrt><mn>7</mn></msqrt></math>"
    ]
    ```

The frontend application will automatically detect these tags and use MathJax to render them as properly formatted mathematical equations.

---

## 4. Frontend Formatting and Rendering

While the JSON data is raw, the frontend is responsible for rendering it in a specific format to mimic a real ACT test.

-   **Option Lettering:**
    -   The frontend will automatically assign letters to the 5 options. The standard scheme is **F, G, H, J, K**. (The letter 'I' is skipped).

-   **Option Alignment:**
    -   The options will be rendered as a left-aligned list.
    -   The option letters (F, G, H, J, K) will be vertically aligned with each other.
    -   The option text (the numbers or phrases) will also be vertically aligned with each other, regardless of the width of the preceding letter.

This ensures a consistent and professional presentation for every question.

---

## 5. Progress Submission Data Model

When a user answers a question, the client must send a JSON object to the `/api/progress/submit` endpoint with the following structure. This data model is crucial for both tracking user progress and collecting accurate global question statistics.

```json
{
  "questionId": "string",
  "performanceRating": "number",
  "context": "string"
}
```

-   **`performanceRating` (number):**
    -   A score from **0.0 to 1.0** that represents both accuracy and speed.
    -   **Incorrect Answer:** The rating is always `0.0`.
    -   **Correct Answer:** The rating is calculated based on the time spent relative to a benchmark (e.g., 60 seconds). A fast answer receives `1.0`, while a slower answer receives a proportionally lower score.

-   **`context` (string):**
    -   Specifies the mode the user was in when they answered the question. This is critical for data integrity.
    -   Possible values:
        -   `'practice_session'`: The default, spaced-repetition-generated practice. User progress is updated, and global question stats are updated.
        -   `'targeted_practice'`: (Future Feature) A user is drilling a specific subcategory. User progress is updated, but **global question stats are NOT updated** to avoid skewing the data.
        -   `'mock_test'`: (Future Feature) A user is taking a full, timed practice test that mimics the real ACT's structure. User progress is updated, and global question stats are updated with this high-quality data.
