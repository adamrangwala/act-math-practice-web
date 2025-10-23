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
  "solutionDiagramSvg": "string | null",
  "isActive": "boolean",
  "avgTimeSeconds": null,
  "optionSelectionCounts": "[number]"
}
```

---

## 2. Field-by-Field Guidelines

-   ... (previous fields) ...

-   **`diagramSvg` (string | null):**
    -   If a question requires a diagram, it must be provided as an **inline SVG string**.
    -   SVGs should be reasonably sized and styled with basic strokes and fills.
    -   If there is no diagram, this field should be `null`.

-   **`solutionDiagramSvg` (string | null):**
    -   An optional, separate SVG diagram that is only shown with the solution. This should only be used for displaying **annotated diagrams** or step-by-step visual explanations. If the diagram from the question is sufficient, this field should be `null`, as the frontend will automatically display the main `diagramSvg` on the solution side.

-   **`optionSelectionCounts` (array of numbers):**
    -   **Required.** An array (e.g., `[0,0,0,0,0]`) that tracks how many times each answer option has been selected by users. The index of the array corresponds to the index of the `options` array. This is used for analyzing common distractors.

---

## 3. Formatting & Content Best Practices

### Formatting Mathematical Notation (MathJax)

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

### Handling Tabular Data

If a question requires a table, the data must be embedded directly into the `questionText` field as a standard HTML `<table>`.

-   **Rule:** Do not use a separate `tableData` field. The `preview.html` script and the main application do not support it.
-   **Example:**
    ```json
    "questionText": "The results are in the table below.<br/><br/><table class='table'>...</table>"
    ```

### Solution Text Best Practices

-   **Algebraic Steps:** For solutions involving a multi-step equation, the steps should be centered on their own lines for maximum clarity. Use a `<math display='block'>` tag containing an `<mtable>` tag. To ensure proper alignment and spacing, add the following attributes to the `<mtable>` tag: `columnalign='right center left'` and `rowspacing='1ex'`.

    -   **Example:**
        ```html
        ...so we can set up the equation: <br/><br/>
        <math display='block'>
          <mtable columnalign='right center left' rowspacing='1ex'>
            <mtr><mtd><mn>7</x><mo>+</mo><mn>5</x><mo>+</mo><mn>3</x></mtd><mtd><mo>=</mo></mtd><mtd><mn>180</mn></mtd></mtr>
            <mtr><mtd><mn>15</x></mtd><mtd><mo>=</mo></mtd><mtd><mn>180</mn></mtd></mtr>
            <mtr><mtd><mi>x</mi></mtd><mtd><mo>=</mo></mtd><mtd><mn>12</mn></mtd></mtr>
          </mtable>
        </math>
        <br/>The question asks for...
        ```
-   **Spacing:** To improve readability, add a `<br/>` tag between consecutive `<math display='block'>` elements or between the final line of text and the start of a math block.
-   **Pro Tips:** To provide helpful test-taking strategies, add a "Pro Tip" at the end of the solution text, formatted in bold.
    -   **Example:** `...Therefore, the answer is 10.<br/><br/><b>Pro Tip:</b> The 3-4-5 triangle is a common Pythagorean triple.`

---

## 4. Frontend Formatting and Rendering

While the JSON data is raw, the frontend is responsible for rendering it in a specific format to mimic a real ACT test.

-   **Option Lettering:**
    -   The frontend will automatically assign letters to the 5 options. The standard scheme is **F, G, H, J, K**. (The letter 'I' is skipped).

-   **Option Alignment:**
    -   The options will be rendered as a left-aligned list.
    -   The option letters (F, G, H, J, K) will be vertically aligned with each other.
    -   The option text (the numbers or phrases) will also be vertically aligned with each other, regardless of the width of the preceding letter.

-   **Diagram Display in Solution:**
    -   If a question contains a `diagramSvg`, the frontend must render that same diagram again within the solution view. This prevents the user from having to scroll up to reference the diagram while reading the explanation.

This ensures a consistent and professional presentation for every question.

---



## 6. Quality Control Best Practices



To ensure all questions are high-quality, authentic, and error-free, the following checks must be performed before a question is finalized:



1.  **Unique Answer Choices:** All answer options must be mathematically unique. Fully simplify all expressions and radicals to confirm that no two choices are equivalent.

2.  **Logical Scenarios:** Word problems must be logical and physically plausible. For example, the height of a falling object should decrease, not increase, over time.

3.  **Numerical Order:** All answer choices that are real numbers must be listed in ascending order (from least to greatest).

4.  **Consistent Math Rendering:** Use a single, consistent method for all mathematical notation (e.g., `<math>` tags) in both the `options` and `solutionText` to ensure uniform styling and prevent rendering errors.



---



## 7. Progress Submission Data Model

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