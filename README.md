# Smart Meal Planner AI 🍳

A complete, hackathon-ready daily meal planning assistant powered by **Gemini 1.5 Flash** using structured JSON output. This micro-app helps users generate highly personalized daily recipe routines, shopping checklists, budget analyses, and substitutions.

---

## ✨ Features

* **Culinary Profile Customization**: Tailor plans by people count, dietary preferences (Vegetarian, Vegan, Eggetarian, Non-Veg), skill level, and prep time availability.
* **Home Pantry Matching**: Dynamic chip-based inputs + quick staples selector to subtract items already available in the pantry from the shopping list.
* **Cost Optimization Mode**: Regenerate menus to prioritize cheaper staples and minimize grocery runs.
* **Interactive checklist**: Strike-through task list for morning preparation, lunch assembly, and dinner cooking.
* **High-Quality UI**: Premium dark glassmorphism layout, responsive structure, and custom metrics (AI Health, Budget, Pantry).
* **Exporting & Utilities**: Export output as a PDF report or copy the categorized shopping list directly.

---

## 🏃 Local Setup & Run

### 1. Install Dependencies
Run the command below in the project directory:
```bash
npm install
```

### 2. Enter API Key
You can authenticate in two ways:
* **In-UI Config**: Run the server and click **"Enter API Key"** in the top right to paste your Gemini API Key. It is stored securely in `localStorage`.
* **Environment Variable**: Define a `.env` file in the root folder:
  ```env
  VITE_GEMINI_API_KEY=your_gemini_api_key
  ```

### 3. Start Dev Server
Start the local development server:
```bash
npm run dev
```
Navigate to `http://localhost:5173/` in your browser.

*Note: If no API key is specified, the application automatically runs in **Interactive Demo Mode**, providing dynamic mock plans generated in real-time according to selected parameters.*
