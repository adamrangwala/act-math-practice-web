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

### Improving Square Root Spacing

To prevent the square root symbol from appearing too close to the content inside it, we use the `<mpadded>` tag to add vertical spacing.

-   **Rule:** Wrap the content of a `<msqrt>` tag with `<mpadded>`.
    -   For fractions, use `height="1.2em"`.
    -   For non-fractions, use `height="0.8em"`.

-   **Example (Fraction):**
    -   **Before:** `<math><msqrt><mfrac><mrow><mn>2</mn><mi>A</mi></mrow><mn>3</mn></mfrac></msqrt></math>`
    -   **After:** `<math><msqrt><mpadded height="1.2em"><mfrac><mrow><mn>2</A</mi></mrow><mn>3</mn></mfrac></mpadded></msqrt></math>`

-   **Example (Non-Fraction):**
    -   **Before:** `<math><msqrt><mn>6</mn><mi>A</mi></msqrt></math>`
    -   **After:** `<math><msqrt><mpadded height="0.8em"><mn>6</mn><mi>A</mi></mpadded></msqrt></math>`

### Handling Tabular Data

If a question requires a table, the data must be embedded directly into the `questionText` field as a standard HTML `<table>`.

-   **Rule:** Do not use a separate `tableData` field. The `preview.html` script and the main application do not support it.
-   **Example:**
    ```json
    "questionText": "The results are in the table below.<br/><br/><table class='table'>...</table>"
    ```

### Solution Text Best Practices

To ensure every solution is clear, consistent, and pedagogically effective, the following structure must be followed.

1.  **Equation-Centric Approach:** Prioritize showing mathematical steps over long descriptive text. For *all* calculations, including single-line sums, use a centered `<math display='block'>` containing an `<mtable>` with `rowspacing='1ex'` for optimal readability.

2.  **Structured Steps:** Break down every solution into logical parts using bolded headings like `<b>1. Find the common difference (d):</b>` or `<b>2. Calculate the area of the circle:</b>`. For very straightforward problems, a single, consolidated step is preferred to minimize line count.

3.  **Consistent Spacing:**
    *   Use **two** `<br/>` tags (`<br/><br/>`) to create a clean visual separation between major blocks of text (e.g., between an introductory sentence and the first step, or between two distinct methods).
    *   Use a **single** `<br/>` tag to separate a step heading from its subsequent `<math display='block'>` element, or after a `<math display='block'>` element to create a tighter, more connected flow into the next line of text (e.g., before a `<b>Pro Tip:</b>`).

4.  **Lists:** For any lists within the solution text (e.g., listing factors, properties, or steps that don't involve equations), use HTML bullet point entities (`&bull;`) for clear and consistent formatting.

4.  **Actionable Pro-Tips:** Conclude the solution with a `<b>Pro Tip:</b>` that offers a genuine **test-taking strategy or shortcut**. These tips are crucial for helping students work faster and smarter. *However, for exceptionally straightforward problems where a truly valuable and non-obvious tip is not apparent, the Pro Tip may be omitted.*

    *   **Good Examples:**
        *   `<b>Pro Tip:</b> Instead of complex algebra, you can solve this by "Plugging In The Answers." Start with option C or H. If it's too small, try a larger number.` (Teaches a new strategy)
        *   `<b>Pro Tip:</b> The 3-4-5 triangle is a common Pythagorean triple. Recognizing it can save you from having to do the full Pythagorean theorem calculation.` (Highlights a shortcut)
        *   `<b>Pro Tip:</b> When a question asks for who is NOT in a certain group on a Venn diagram, a good strategy is to cover that entire circle with your finger. The numbers you can still see are the ones you need to add up.` (Provides a visual strategy)
        *   `<b>Pro Tip:</b> Always check your units! Many ACT problems try to trick you by giving information in different units (like quarts and ounces, or feet and inches). Converting everything to a consistent unit at the very beginning is the safest way to avoid errors.` (Emphasizes a common pitfall and best practice)

---

**Complete Example of a Well-Formatted Solution:**

```json
"solutionText": "<b>1. Solve for 'b' in terms of 'a':</b><br/><math display='block'><mtable columnalign='right center left' rowspacing='1ex'><mtr><mtd><mn>4</mn><mi>a</mi></mtd><mtd><mo>=</mo></mtd><mtd><mn>3</mn><mi>b</mi><mo>+</mo><mn>5</mn></mtd></mtr><mtr><mtd><mn>4</mn><mi>a</mi><mo>-</mo><mn>5</mn></mtd><mtd><mo>=</mo></mtd><mtd><mn>3</mn><mi>b</mi></mtd></mtr><mtr><mtd><mfrac><mrow><mn>4</mn><mi>a</mi><mo>-</mo><mn>5</mn></mrow><mn>3</mn></mfrac></mtd><mtd><mo>=</mo></mtd><mtd><mi>b</mi></mtd></mtr></mtable></math><br/>Therefore, the correct expression for <math><mi>b</mi></math> is <math><mfrac><mrow><mn>4</mn><mi>a</mi><mo>-</mo><mn>5</mn></mrow><mn>3</mn></mfrac></math>."
```

---

## 4. Data Validation & Schema

To ensure data integrity and prevent application errors, all new questions must be validated against two sources of truth:

1.  **JSON Schema:** Every new question object **must** contain all the keys present in the `example.json` file. While some keys can have a `null` value (e.g., `diagramSvg`), the key itself must be present.

2.  **Subcategory Vocabulary:** All strings in the `subcategories` array **must** be an exact match to an entry in the `ACT_MATH_TOPICS.md` file. This ensures a controlled and consistent taxonomy for targeted practice and data analysis.

---

## 5. Frontend Formatting and Rendering

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

5.  **Verify All Calculations:** Every calculation in the `solutionText` and used to determine the `correctAnswerIndex` must be double-checked for accuracy.

6.  **Design Plausible Distractors:** The incorrect `options` should be common mistakes that a student might make. Examples include off-by-one errors, the value of 'x' instead of the final answer, or results from a forgotten negative sign.

7.  **Meticulous Final Preview:** The question must be rendered in `preview.html` to confirm there are no visual or formatting errors. Pay close attention to the precision of SVG diagrams, the clarity of MathML rendering, and the consistency of spacing (`<br/><br/>`) before equations.

8.  **Pedagogical Review:** Read the `solutionText` from a student's perspective. Is the explanation clear and easy to follow? Does it teach a robust, scalable method? Could a 'Pro Tip' be added to help students avoid common traps?



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