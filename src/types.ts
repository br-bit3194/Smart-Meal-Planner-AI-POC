export interface MealDetails {
  name: string;
  description: string;
  time_minutes: number;
  estimated_cost: number;
}

export interface GroceryItem {
  item: string;
  quantity: string;
  category: 'Vegetables' | 'Dairy' | 'Proteins' | 'Pantry' | string;
}

export interface Substitution {
  ingredient: string;
  alternatives: string[];
}

export interface BudgetAnalysis {
  budget: number;
  estimated_cost: number;
  remaining: number;
  status: 'Within Budget' | 'Slightly Over Budget' | 'Significantly Over Budget' | string;
  recommendations: string[];
}

export interface NutritionScores {
  protein: number;
  fiber: number;
  overall: number;
  explanation: string;
}

export interface PantryUtilization {
  score: number;
  used_items: string[];
  explanation: string;
}

export interface MealPlanResponse {
  breakfast: MealDetails;
  lunch: MealDetails;
  dinner: MealDetails;
  grocery_list: GroceryItem[];
  substitutions: Substitution[];
  budget_analysis: BudgetAnalysis;
  todo_list: string[];
  nutrition_scores: NutritionScores;
  pantry_utilization: PantryUtilization;
}

export interface UserInputs {
  peopleCount: number;
  dietaryPreference: 'Vegetarian' | 'Vegan' | 'Eggetarian' | 'Non-Vegetarian';
  cookingSkill: 'Beginner' | 'Intermediate' | 'Advanced';
  timeAvailable: 'Less than 30 mins' | '30-60 mins' | '60-120 mins' | '120+ mins';
  budget: number;
  currency: string;
  pantryItems: string[];
  cuisines: string;
  avoidFoods: string;
  allergies: string;
  healthGoals: 'Weight loss' | 'High protein' | 'Low carb' | 'Balanced diet' | '';
}
