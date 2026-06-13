import type { UserInputs, MealPlanResponse } from '../types';

export const mockMealPlan: MealPlanResponse = {
  breakfast: {
    name: "Avocado & Spinach Scramble",
    description: "Creamy scrambled eggs tossed with fresh baby spinach, sliced avocado, and a pinch of chili flakes. Served with toasted whole-grain sourdough.",
    time_minutes: 15,
    estimated_cost: 120.00
  },
  lunch: {
    name: "Mediterranean Chickpea Salad & Hummus Wrap",
    description: "A refreshing mixture of chickpeas, cucumber, cherry tomatoes, olives, and red onion in a light lemon-herb dressing, wrapped in a spinach tortilla spread with creamy hummus.",
    time_minutes: 20,
    estimated_cost: 180.00
  },
  dinner: {
    name: "One-Pan Garlic Herb Baked Salmon & Asparagus",
    description: "Flaky salmon fillet baked on a sheet pan with fresh asparagus spears, cherry tomatoes, drizzled with olive oil, garlic, and sliced lemon.",
    time_minutes: 25,
    estimated_cost: 290.00
  },
  grocery_list: [
    { item: "Fresh Salmon Fillets", quantity: "2 fillets", category: "Proteins" },
    { item: "Baby Spinach", quantity: "150g bag", category: "Vegetables" },
    { item: "Cherry Tomatoes", quantity: "1 pint", category: "Vegetables" },
    { item: "Asparagus", quantity: "1 bunch", category: "Vegetables" },
    { item: "Avocado", quantity: "2 medium", category: "Vegetables" },
    { item: "Cucumber", quantity: "1 large", category: "Vegetables" },
    { item: "Hummus", quantity: "1 tub (200g)", category: "Pantry" },
    { item: "Whole Grain Sourdough", quantity: "1 loaf", category: "Pantry" },
    { item: "Spinach Tortillas", quantity: "1 pack", category: "Pantry" }
  ],
  substitutions: [
    {
      ingredient: "Salmon",
      alternatives: ["Firm Tofu (high-protein vegan alternative)", "Paneer (vegetarian alternative)", "Chicken breast"]
    },
    {
      ingredient: "Eggs",
      alternatives: ["Crumbled Silken Tofu (vegan scramble)", "Chickpea flour batter (egg-free crepe)"]
    },
    {
      ingredient: "Sourdough",
      alternatives: ["Gluten-free bread", "Lettuce wraps (low-carb alternative)"]
    }
  ],
  budget_analysis: {
    budget: 800.00,
    estimated_cost: 590.00,
    remaining: 210.00,
    status: "Within Budget",
    recommendations: [
      "You saved money by utilizing eggs, olive oil, and basic spices already present in your pantry.",
      "Buy seasonal asparagus or substitute with green beans to save extra if prices are high.",
      "Consider buying dry chickpeas in bulk rather than canned for future meal savings."
    ]
  },
  todo_list: [
    "Morning: Rinse and drain the canned chickpeas for the lunch wrap.",
    "Morning: Take eggs out of the fridge and slice the avocado for breakfast.",
    "Lunch Prep: Chop cucumbers, cherry tomatoes, and red onions. Mix the Mediterranean dressing.",
    "Lunch Prep: Spread hummus on tortillas and assemble the chickpea wrap.",
    "Dinner Prep: Preheat the oven to 400°F (200°C).",
    "Dinner Prep: Arrange salmon and asparagus on a sheet pan, drizzle with olive oil, herbs, and lemon, and bake for 12-15 minutes."
  ],
  nutrition_scores: {
    protein: 88,
    fiber: 72,
    overall: 85,
    explanation: "Excellent source of healthy fats (omega-3 and avocado), lean proteins, and complex carbohydrates. High fiber content from chickpeas and veggies helps support gut health and keeps you full."
  },
  pantry_utilization: {
    score: 80,
    used_items: ["Eggs", "Olive Oil", "Salt & Pepper", "Garlic", "Lemon"],
    explanation: "Leveraged 5 pantry items you already had, reducing your grocery run list and saving you roughly ₹200."
  }
};

export function getDynamicMockPlan(inputs: UserInputs, forceCheaper: boolean = false): MealPlanResponse {
  const count = inputs.peopleCount || 1;
  const curr = inputs.currency || '₹';
  const isINR = curr === '₹';
  
  // Base calculations
  let costFactor = forceCheaper ? 0.65 : 1.0;
  const lowBudgetLimit = isINR ? 300 : 15;
  if (inputs.budget < lowBudgetLimit) {
    costFactor *= 0.75; // Automatically scale down ingredients if budget is low
  }
  
  const rates = isINR 
    ? { breakfast: 60, lunch: 100, dinner: 160 }
    : { breakfast: 2.5, lunch: 3.0, dinner: 4.5 };
  
  // Define default meals based on dietary preference
  let breakfast = { name: "", description: "", time_minutes: 15, estimated_cost: 0 };
  let lunch = { name: "", description: "", time_minutes: 20, estimated_cost: 0 };
  let dinner = { name: "", description: "", time_minutes: 25, estimated_cost: 0 };
  let groceryList: { item: string; quantity: string; category: string }[] = [];
  let substitutions: { ingredient: string; alternatives: string[] }[] = [];
  let todoList: string[] = [];
  
  // Custom ingredients and details based on dietary option
  if (inputs.dietaryPreference === 'Vegetarian') {
    breakfast = {
      name: "Paneer & Spinach Scramble",
      description: "Indian cottage cheese (paneer) crumbled and sautéed with spinach, onions, tomatoes, and ground turmeric. Served with warm buttered toast.",
      time_minutes: 15,
      estimated_cost: Number((rates.breakfast * count * costFactor).toFixed(2))
    };
    lunch = {
      name: "Mediterranean Chickpea & Feta Salad",
      description: "A refreshing toss of boiled chickpeas, crisp cucumbers, tomatoes, and crumbled feta cheese with a drizzle of lemon-garlic dressing.",
      time_minutes: 15,
      estimated_cost: Number((rates.lunch * count * costFactor).toFixed(2))
    };
    dinner = {
      name: "Rich Creamy Paneer Butter Masala & Rice",
      description: "Golden paneer cubes simmered in a smooth, mildly spiced tomato cashew gravy. Served alongside fragrant steamed basmati rice.",
      time_minutes: 30,
      estimated_cost: Number((rates.dinner * count * costFactor).toFixed(2))
    };
    
    groceryList = [
      { item: "Paneer (Cottage Cheese)", quantity: `${200 * count}g`, category: "Proteins" },
      { item: "Baby Spinach", quantity: "150g", category: "Vegetables" },
      { item: "Chickpeas (Canned)", quantity: `${count} can(s)`, category: "Pantry" },
      { item: "Feta Cheese", quantity: "100g", category: "Dairy" },
      { item: "Heavy Cream", quantity: "100ml", category: "Dairy" },
      { item: "Cashews", quantity: "50g", category: "Pantry" },
      { item: "Basmati Rice", quantity: `${100 * count}g`, category: "Pantry" }
    ];
    
    substitutions = [
      { ingredient: "Paneer", alternatives: ["Firm Tofu (Vegan)", "Tempeh", "Crumbled Scrambled Eggs"] },
      { ingredient: "Heavy Cream", alternatives: ["Coconut Cream (Dairy-free)", "Greek Yogurt (Lighter)"] },
      { ingredient: "Cashews", alternatives: ["Almonds", "Sunflower seeds (Nut-free)"] }
    ];
    
    todoList = [
      "Morning: Drain canned chickpeas and rinse under cold water. Soak cashews in hot water for dinner.",
      "Morning: Prep breakfast by crumbling paneer and chopping spinach.",
      "Lunch Prep: Dice cucumbers, tomatoes, and toss with chickpeas and feta cheese. Mix lemon juice and olive oil for dressing.",
      "Dinner Prep: Wash and boil basmati rice.",
          "Dinner Prep: Blend soaked cashews and tomatoes. Sauté paneer cubes until golden, then simmer in cashew-tomato sauce and add cream."
    ];
  } else if (inputs.dietaryPreference === 'Vegan') {

    breakfast = {
      name: "Garden Tofu & Turmeric Scramble",
      description: "Crumbled organic firm tofu seasoned with nutritional yeast, turmeric, garlic powder, and folded with spinach and cherry tomatoes. Served with avocado toast.",
      time_minutes: 15,
      estimated_cost: Number((rates.breakfast * 0.9 * count * costFactor).toFixed(2))
    };
    lunch = {
      name: "Avocado & Black Bean Burrito Bowl",
      description: "Loaded bowl with black beans, sweet corn, diced avocado, shredded lettuce, and cherry tomatoes over seasoned brown rice.",
      time_minutes: 15,
      estimated_cost: Number((rates.lunch * 0.9 * count * costFactor).toFixed(2))
    };
    dinner = {
      name: "Coconut Lentil Dahl & Sweet Potato Curry",
      description: "Red lentils and diced sweet potato slow-cooked in a creamy coconut milk broth with fresh ginger, garlic, and warm curry spices. Served with flatbread.",
      time_minutes: 30,
      estimated_cost: Number((rates.dinner * 0.8 * count * costFactor).toFixed(2))
    };
    
    groceryList = [
      { item: "Firm Organic Tofu", quantity: `${250 * count}g`, category: "Proteins" },
      { item: "Canned Black Beans", quantity: `${count} can(s)`, category: "Pantry" },
      { item: "Sweet Corn (Canned)", quantity: "1 small can", category: "Pantry" },
      { item: "Red Lentils", quantity: `${150 * count}g`, category: "Proteins" },
      { item: "Sweet Potato", quantity: "2 medium", category: "Vegetables" },
      { item: "Coconut Milk (Canned)", quantity: "1 can", category: "Pantry" },
      { item: "Brown Rice", quantity: `${100 * count}g`, category: "Pantry" },
      { item: "Avocado", quantity: "2 medium", category: "Vegetables" }
    ];
    
    substitutions = [
      { ingredient: "Tofu", alternatives: ["Tempeh", "Chickpea flour scramble", "Scrambled eggs (if not vegan)"] },
      { ingredient: "Coconut Milk", alternatives: ["Almond milk + cornstarch", "Cashew milk"] },
      { ingredient: "Black Beans", alternatives: ["Pinto beans", "Kidney beans", "Lentils"] }
    ];
    
    todoList = [
      "Morning: Press the tofu to remove excess moisture for breakfast. Wash the brown rice.",
      "Morning: Start boiling the brown rice so it is ready for lunch.",
      "Lunch Prep: Open and rinse the black beans and corn. Cube the avocado and assemble the burrito bowls.",
      "Dinner Prep: Peel and dice the sweet potato. Rinse red lentils.",
      "Dinner Prep: Sauté onion, garlic, and ginger. Add sweet potato, lentils, coconut milk, and curry spices; simmer for 25 minutes until soft."
    ];
  } else if (inputs.dietaryPreference === 'Eggetarian') {
    breakfast = {
      name: "Classic Fluffy Spinach & Feta Omelette",
      description: "Whisked eggs folded with fresh spinach leaves and crumbled feta, cooked in butter and served with toasted whole wheat bread.",
      time_minutes: 10,
      estimated_cost: Number((rates.breakfast * 0.75 * count * costFactor).toFixed(2))
    };
    lunch = {
      name: "Herbed Egg Salad Toast",
      description: "Boiled eggs mashed with light Greek yogurt, fresh dill, green onions, and mustard, spread over thick sliced toasted bread.",
      time_minutes: 15,
      estimated_cost: Number((rates.lunch * 0.7 * count * costFactor).toFixed(2))
    };
    dinner = {
      name: "Dhaba Style Egg Curry & Paratha",
      description: "Hard-boiled eggs simmered in a spicy onion, tomato, and garlic gravy. Served with layered paratha bread.",
      time_minutes: 25,
      estimated_cost: Number((rates.dinner * 0.7 * count * costFactor).toFixed(2))
    };
    
    groceryList = [
      { item: "Fresh Organic Eggs", quantity: `${3 * count} items`, category: "Proteins" },
      { item: "Feta Cheese", quantity: "80g", category: "Dairy" },
      { item: "Baby Spinach", quantity: "100g", category: "Vegetables" },
      { item: "Greek Yogurt", quantity: "150g", category: "Dairy" },
      { item: "Fresh Dill & Green Onions", quantity: "1 bunch", category: "Vegetables" },
      { item: "Whole Wheat Bread", quantity: "1 loaf", category: "Pantry" },
      { item: "Parathas (Frozen/Fresh)", quantity: `${2 * count} pieces`, category: "Pantry" }
    ];
    
    substitutions = [
      { ingredient: "Eggs", alternatives: ["Crumbled Tofu", "Chickpea flour batter"] },
      { ingredient: "Feta", alternatives: ["Goat cheese", "Paneer", "Tofu feta"] },
      { ingredient: "Greek Yogurt", alternatives: ["Mayonnaise", "Sour cream", "Mashed avocado"] }
    ];
    
    todoList = [
      "Morning: Boil egg count needed for lunch and dinner (about 2 per person).",
      "Morning: Whisk eggs with splash of milk/water, add spinach and feta to cook breakfast omelette.",
      "Lunch Prep: Peel the boiled eggs, mash with greek yogurt, dill, mustard, and green onions. Toast bread and assemble.",
      "Dinner Prep: Heat oil in a pan, sauté onions, ginger, garlic, and tomato puree until cooked. Slice boiled eggs in half and slide into the rich curry."
    ];
  } else {
    // Non-Vegetarian
    breakfast = {
      name: "Turkey Bacon, Eggs & Avocado Toast",
      description: "Crispy turkey bacon strip, two eggs cooked to your preference, and seasoned mashed avocado spread over whole-grain sourdough toast.",
      time_minutes: 15,
      estimated_cost: Number((rates.breakfast * 1.3 * count * costFactor).toFixed(2))
    };
    lunch = {
      name: "Grilled Chicken & Spinach Wrap",
      description: "Tender chicken breast slices grilled with garlic, tossed with baby spinach, tomatoes, and dynamic honey-mustard dressing inside a tortilla.",
      time_minutes: 15,
      estimated_cost: Number((rates.lunch * 1.3 * count * costFactor).toFixed(2))
    };
    dinner = {
      name: "Garlic Butter Baked Salmon & Green Beans",
      description: "Fresh salmon fillets seasoned with garlic powder, lemon juice, melted butter, baked alongside tender crisp green beans on a single sheet pan.",
      time_minutes: 25,
      estimated_cost: Number((rates.dinner * 1.5 * count * costFactor).toFixed(2))
    };
    
    groceryList = [
      { item: "Fresh Salmon Fillets", quantity: `${count} fillets`, category: "Proteins" },
      { item: "Chicken Breast", quantity: `${150 * count}g`, category: "Proteins" },
      { item: "Turkey Bacon", quantity: `${2 * count} strips`, category: "Proteins" },
      { item: "Fresh Eggs", quantity: `${2 * count} items`, category: "Proteins" },
      { item: "Fresh Green Beans", quantity: "200g", category: "Vegetables" },
      { item: "Tortillas", quantity: `${count} wraps`, category: "Pantry" },
      { item: "Avocado", quantity: "2 medium", category: "Vegetables" },
      { item: "Whole Grain Sourdough", quantity: "1 loaf", category: "Pantry" }
    ];
    
    substitutions = [
      { ingredient: "Salmon", alternatives: ["Chicken breast", "Cod fish fillets", "Paneer (Vegetarian)"] },
      { ingredient: "Turkey Bacon", alternatives: ["Pork bacon", "Smoked tofu strips (Vegan)"] },
      { ingredient: "Chicken Breast", alternatives: ["Sliced Turkey breast", "Firm Tofu", "Canned Chickpeas"] }
    ];
    
    todoList = [
      "Morning: Defrost chicken breast and salmon fillets if frozen.",
      "Morning: Fry bacon until crisp, cook eggs, and mash avocado for breakfast toast.",
      "Lunch Prep: Slice chicken breast into thin strips, sauté with garlic. Assemble chicken, spinach, tomato, and mustard in wrap.",
      "Dinner Prep: Preheat oven to 400°F (200°C). Trim green beans.",
      "Dinner Prep: Place salmon and green beans on sheet pan. Brush with melted garlic butter, lemon, salt, and bake for 12-15 minutes."
    ];
  }
 
  // Filter grocery list by removing items that are in the user's pantry
  const userPantryLower = inputs.pantryItems.map(i => i.toLowerCase().trim());
  const finalGroceryList = groceryList.filter(item => {
    // If the ingredient item matches or contains any pantry item name, skip it
    return !userPantryLower.some(pantryItem => 
      item.item.toLowerCase().includes(pantryItem) || 
      pantryItem.includes(item.item.toLowerCase())
    );
  });
  
  // Calculate total cost
  const totalCost = Number((breakfast.estimated_cost + lunch.estimated_cost + dinner.estimated_cost).toFixed(2));
  const remaining = Number((inputs.budget - totalCost).toFixed(2));
  
  let status = "Within Budget";
  if (remaining < 0) {
    if (Math.abs(remaining) > inputs.budget * 0.25) {
      status = "Significantly Over Budget";
    } else {
      status = "Slightly Over Budget";
    }
  }
 
  const recommendations = [
    `You are cooking for ${count} people. Total estimated cost is ${curr}${totalCost.toFixed(2)}.`,
    forceCheaper 
      ? "Successfully activated Maximum Savings Mode! Replaced premium items with budget staples."
      : "Save money by buying vegetables at a local farmer's market.",
    "Using spices and oils already in your pantry saved you money on this plan.",
    remaining < 0 
      ? `Try swapping out higher cost ingredients like Salmon for Tofu or Chicken to save around ${curr}${isINR ? '300.00' : '4.00'}.`
      : `You have a surplus of ${curr}${remaining.toFixed(2)} remaining today.`
  ];

  // Adjust scores depending on health goals
  let proteinScore = 75;
  let fiberScore = 65;
  let overallScore = 80;
  let scoreExp = "Balanced meal selection providing adequate macro and micro nutrients.";

  if (inputs.healthGoals === 'High protein') {
    proteinScore = 95;
    overallScore = 88;
    scoreExp = "Focused on high lean protein sources like eggs, tofu, paneer, or fish to build/repair muscle.";
  } else if (inputs.healthGoals === 'Weight loss') {
    overallScore = 92;
    fiberScore = 85;
    scoreExp = "Low calorie, nutrient-dense meals high in fiber to promote satiety and support caloric deficit.";
  } else if (inputs.healthGoals === 'Low carb') {
    proteinScore = 88;
    overallScore = 85;
    fiberScore = 60;
    scoreExp = "Minimized starches and refined sugars, rich in green vegetables and healthy fats.";
  }
  
  // Calculate a fake pantry utilization score
  const totalDefaultPantryCount = inputs.pantryItems.length;
  // Compute how many user pantry items are mentioned
  const usedPantryItems = inputs.pantryItems.filter(item => {
    const itemLower = item.toLowerCase().trim();
    return (
      breakfast.description.toLowerCase().includes(itemLower) ||
      lunch.description.toLowerCase().includes(itemLower) ||
      dinner.description.toLowerCase().includes(itemLower) ||
      todoList.some(todo => todo.toLowerCase().includes(itemLower))
    );
  });
  
  let pantryScoreVal = 0;
  if (totalDefaultPantryCount > 0) {
    pantryScoreVal = Math.round((usedPantryItems.length / totalDefaultPantryCount) * 100);
  } else {
    pantryScoreVal = 0;
  }
  if (pantryScoreVal === 0 && totalDefaultPantryCount > 0) {
    pantryScoreVal = 60; // minimum fallback for demo
    usedPantryItems.push(inputs.pantryItems[0]);
  }
  if (pantryScoreVal > 100) pantryScoreVal = 100;

  return {
    breakfast,
    lunch,
    dinner,
    grocery_list: finalGroceryList,
    substitutions,
    budget_analysis: {
      budget: inputs.budget,
      estimated_cost: totalCost,
      remaining: remaining,
      status,
      recommendations
    },
    todo_list: todoList,
    nutrition_scores: {
      protein: proteinScore,
      fiber: fiberScore,
      overall: overallScore,
      explanation: scoreExp
    },
    pantry_utilization: {
      score: pantryScoreVal,
      used_items: usedPantryItems,
      explanation: `Used ${usedPantryItems.length} out of ${totalDefaultPantryCount} of your listed pantry items (${usedPantryItems.join(', ')}), minimizing additional purchases.`
    }
  };
}
