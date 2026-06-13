import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import type { Schema } from '@google/generative-ai';
import type { UserInputs, MealPlanResponse } from '../types';

// Structured JSON schema for Gemini response
const mealPlanSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    breakfast: {
      type: SchemaType.OBJECT,
      description: "Breakfast details",
      properties: {
        name: { type: SchemaType.STRING, description: "Name of the breakfast dish" },
        description: { type: SchemaType.STRING, description: "Short appetizing description of the breakfast" },
        time_minutes: { type: SchemaType.INTEGER, description: "Estimated prep + cooking time in minutes" },
        estimated_cost: { type: SchemaType.NUMBER, description: "Estimated cost in the requested currency for all people" }
      },
      required: ["name", "description", "time_minutes", "estimated_cost"]
    },
    lunch: {
      type: SchemaType.OBJECT,
      description: "Lunch details",
      properties: {
        name: { type: SchemaType.STRING, description: "Name of the lunch dish" },
        description: { type: SchemaType.STRING, description: "Short appetizing description of the lunch" },
        time_minutes: { type: SchemaType.INTEGER, description: "Estimated prep + cooking time in minutes" },
        estimated_cost: { type: SchemaType.NUMBER, description: "Estimated cost in the requested currency for all people" }
      },
      required: ["name", "description", "time_minutes", "estimated_cost"]
    },
    dinner: {
      type: SchemaType.OBJECT,
      description: "Dinner details",
      properties: {
        name: { type: SchemaType.STRING, description: "Name of the dinner dish" },
        description: { type: SchemaType.STRING, description: "Short appetizing description of the dinner" },
        time_minutes: { type: SchemaType.INTEGER, description: "Estimated prep + cooking time in minutes" },
        estimated_cost: { type: SchemaType.NUMBER, description: "Estimated cost in the requested currency for all people" }
      },
      required: ["name", "description", "time_minutes", "estimated_cost"]
    },
    grocery_list: {
      type: SchemaType.ARRAY,
      description: "Categorized grocery list of ingredients to buy (excluding pantry items)",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          item: { type: SchemaType.STRING, description: "Name of the ingredient" },
          quantity: { type: SchemaType.STRING, description: "Required quantity (e.g. 250g, 2 items, 1 pack)" },
          category: { type: SchemaType.STRING, description: "Category: Vegetables, Dairy, Proteins, Pantry, etc." }
        },
        required: ["item", "quantity", "category"]
      }
    },
    substitutions: {
      type: SchemaType.ARRAY,
      description: "Ingredients and their alternatives",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          ingredient: { type: SchemaType.STRING, description: "The original ingredient in the recipe" },
          alternatives: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
            description: "2-3 alternative ingredients"
          }
        },
        required: ["ingredient", "alternatives"]
      }
    },
    budget_analysis: {
      type: SchemaType.OBJECT,
      description: "Feasibility and savings suggestions",
      properties: {
        budget: { type: SchemaType.NUMBER, description: "The user's original daily budget" },
        estimated_cost: { type: SchemaType.NUMBER, description: "Total cost of breakfast + lunch + dinner" },
        remaining: { type: SchemaType.NUMBER, description: "Budget remaining (can be negative if over budget)" },
        status: { type: SchemaType.STRING, description: "Within Budget, Slightly Over Budget, or Significantly Over Budget" },
        recommendations: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "List of tips to optimize costs further"
        }
      },
      required: ["budget", "estimated_cost", "remaining", "status", "recommendations"]
    },
    todo_list: {
      type: SchemaType.ARRAY,
      description: "Chronological, actionable cooking checklist steps starting from morning, prep, to dinner",
      items: { type: SchemaType.STRING }
    },
    nutrition_scores: {
      type: SchemaType.OBJECT,
      description: "AI-calculated scores out of 100 based on nutritional quality",
      properties: {
        protein: { type: SchemaType.INTEGER, description: "Protein content score (0-100)" },
        fiber: { type: SchemaType.INTEGER, description: "Fiber content score (0-100)" },
        overall: { type: SchemaType.INTEGER, description: "Overall nutritional health score (0-100)" },
        explanation: { type: SchemaType.STRING, description: "Brief summary of nutrition quality" }
      },
      required: ["protein", "fiber", "overall", "explanation"]
    },
    pantry_utilization: {
      type: SchemaType.OBJECT,
      description: "Evaluation of how well user's pantry items were used",
      properties: {
        score: { type: SchemaType.INTEGER, description: "Percentage score (0-100) of how much pantry was utilized" },
        used_items: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description: "Pantry items successfully used in the recipes"
        },
        explanation: { type: SchemaType.STRING, description: "Explanation of how pantry items helped save costs" }
      },
      required: ["score", "used_items", "explanation"]
    }
  },
  required: [
    "breakfast", "lunch", "dinner", "grocery_list", "substitutions",
    "budget_analysis", "todo_list", "nutrition_scores", "pantry_utilization"
  ]
};

// Main function to generate the complete meal plan using Gemini
export async function generateFullMealPlan(
  inputs: UserInputs,
  apiKey: string,
  forceCheaper: boolean = false
): Promise<MealPlanResponse> {
  if (!apiKey) {
    throw new Error("Gemini API key is required to generate a meal plan.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // Using gemini-2.5-flash as default, it is fast, cheap, and supports structured JSON outputs
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: mealPlanSchema,
      temperature: 0.2, // Lower temperature for more structured, reliable outputs matching inputs
    }
  });

  const prompt = `
    You are an expert AI chef and nutritionist. Generate a personalized meal plan and cooking checklist for the day.
    
    USER INPUTS:
    - Number of people to cook for: ${inputs.peopleCount}
    - Dietary preference: ${inputs.dietaryPreference}
    - Daily cooking skill level: ${inputs.cookingSkill}
    - Total cooking time available today: ${inputs.timeAvailable}
    - Daily food budget: ${inputs.budget} ${inputs.currency}
    - Pantry items already available (do not add these to the grocery list!): ${inputs.pantryItems.join(', ') || 'None'}
    - Favorite cuisines (optional): ${inputs.cuisines || 'Any'}
    - Foods to avoid / dislikes: ${inputs.avoidFoods || 'None'}
    - Allergies: ${inputs.allergies || 'None'}
    - Health goals: ${inputs.healthGoals || 'Balanced diet'}
    - Optimize for lower cost (Make it cheaper mode): ${forceCheaper ? 'YES, prioritize extremely low-cost ingredients, simple staples, and maximize pantry use. Replace expensive proteins/vegetables with budget-friendly ones.' : 'NO'}

    REASONING RULES:
    1. **Pantry Utilization**: Check the user's pantry items. Incorporate these ingredients into the breakfast, lunch, and dinner recipes FIRST to save money.
    2. **Grocery List**: The grocery list must ONLY contain ingredients required for the recipes that are NOT already in the user's pantry. Categorize them under Vegetables, Dairy, Proteins, Pantry, or other appropriate categories.
    3. **Time constraint**: Ensure the total combined prep + cooking time of all three meals respects the user's time limit ("${inputs.timeAvailable}"). If time is short, suggest quick, one-pot or simple meals.
    4. **Budget Feasibility**: Calculate realistic estimated costs in ${inputs.currency} for the ingredients that need to be purchased, scaled for ${inputs.peopleCount} people. Ensure the total cost is compared accurately against the user's budget of ${inputs.budget} ${inputs.currency}.
    5. **Dietary & Health Customization**: Respect all dietary preferences, allergies, health goals, and avoided foods.
    6. **Checklist**: Provide chronological and highly actionable kitchen checklist steps, starting from morning tasks (e.g. defrosting, soaking, grocery shopping), lunch prep, to final plating.
    7. **Ingredient Substitutions**: Provide 2-3 practical, healthy, and budget-friendly substitutions for key ingredients in each meal.
    8. **Scores**: Evaluate realistic nutrition scores (protein, fiber, overall health quality out of 100) and calculate the percentage of user's pantry items used in these meals.

    Return the complete response matching the JSON schema.
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    return JSON.parse(textResponse) as MealPlanResponse;
  } catch (error) {
    console.error("Gemini API generation error:", error);
    throw error;
  }
}
