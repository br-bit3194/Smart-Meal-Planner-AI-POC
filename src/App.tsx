import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Plus, Check, Sparkles, Clock, DollarSign, 
  AlertCircle, Scale, Utensils, Download, Copy, Key, Heart, 
  Info, Coins, Activity, Apple, ListTodo, RefreshCw
} from 'lucide-react';
import type { UserInputs, MealPlanResponse } from './types';
import { generateFullMealPlan } from './services/gemini';
import { getDynamicMockPlan } from './utils/mockData';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Popular pantry items for quick selection
const POPULAR_PANTRY = [
  'Rice', 'Flour', 'Eggs', 'Milk', 'Onion', 
  'Tomato', 'Potatoes', 'Bread', 'Oil', 'Garlic', 
  'Butter', 'Spices', 'Salt', 'Pepper'
];

// Rotating loading statements
const LOADING_TIPS = [
  "Analyzing your dietary preferences and health goals...",
  "Scanning pantry items to minimize your grocery bill...",
  "Cross-referencing recipes with your cooking time limits...",
  "Formatting chef-approved step-by-step instructions...",
  "Calculating nutritional values and protein contents...",
  "Structuring your chronological checklist for the day...",
  "Double checking ingredient substitutions and costs..."
];

// Helper to get high-quality Unsplash image based on meal keywords
function getMealImage(mealName: string, category: 'breakfast' | 'lunch' | 'dinner'): string {
  const name = mealName.toLowerCase();
  
  if (name.includes('salmon') || name.includes('fish') || name.includes('tuna')) {
    return 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('chicken') || name.includes('turkey') || name.includes('bacon') || name.includes('meat') || name.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('paneer') || name.includes('curry') || name.includes('dahl') || name.includes('masala') || name.includes('tikka')) {
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('salad') || name.includes('wrap') || name.includes('bowl') || name.includes('burrito') || name.includes('chickpea')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('scramble') || name.includes('egg') || name.includes('omelette') || name.includes('toast')) {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('tofu') || name.includes('vegan') || name.includes('spinach')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('oats') || name.includes('porridge') || name.includes('pancake') || name.includes('fruit') || name.includes('sweet')) {
    return 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80';
  }
  
  // Fallbacks by category
  if (category === 'breakfast') {
    return 'https://images.unsplash.com/photo-1496042300028-e747444501f1?w=600&auto=format&fit=crop&q=80';
  }
  if (category === 'lunch') {
    return 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80';
}

export default function App() {
  // Persistence for API Key
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Form inputs state
  const [inputs, setInputs] = useState<UserInputs>({
    peopleCount: 2,
    dietaryPreference: 'Vegetarian',
    cookingSkill: 'Intermediate',
    timeAvailable: '30-60 mins',
    budget: 600,
    currency: '₹',
    pantryItems: ['Rice', 'Oil', 'Onion', 'Salt', 'Spices'],
    cuisines: '',
    avoidFoods: '',
    allergies: '',
    healthGoals: 'Balanced diet'
  });

  const [customPantryInput, setCustomPantryInput] = useState('');
  
  // Results & App state
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(() => {
    // Load default mock plan on initial render so the page is immediately beautiful
    return getDynamicMockPlan({
      peopleCount: 2,
      dietaryPreference: 'Vegetarian',
      cookingSkill: 'Intermediate',
      timeAvailable: '30-60 mins',
      budget: 600,
      currency: '₹',
      pantryItems: ['Rice', 'Oil', 'Onion', 'Salt', 'Spices'],
      cuisines: '',
      avoidFoods: '',
      allergies: '',
      healthGoals: 'Balanced diet'
    }, false);
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTip, setLoadingTip] = useState(LOADING_TIPS[0]);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive checklist status
  const [completedTodos, setCompletedTodos] = useState<Record<number, boolean>>({});
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Rotating tips effect when loading
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % LOADING_TIPS.length;
        setLoadingTip(LOADING_TIPS[index]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Toast handler
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Save API Key helper
  const handleSaveApiKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiKeyInput(false);
    triggerToast("API Key saved successfully!");
  };

  // Add custom pantry item
  const handleAddPantryItem = () => {
    const trimmed = customPantryInput.trim();
    if (trimmed && !inputs.pantryItems.includes(trimmed)) {
      setInputs(prev => ({
        ...prev,
        pantryItems: [...prev.pantryItems, trimmed]
      }));
      setCustomPantryInput('');
    }
  };

  // Quick toggle popular pantry items
  const handleTogglePopularPantry = (item: string) => {
    setInputs(prev => {
      const exists = prev.pantryItems.includes(item);
      const newItems = exists
        ? prev.pantryItems.filter(i => i !== item)
        : [...prev.pantryItems, item];
      return { ...prev, pantryItems: newItems };
    });
  };

  // Remove pantry item
  const handleRemovePantryItem = (indexToRemove: number) => {
    setInputs(prev => ({
      ...prev,
      pantryItems: prev.pantryItems.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Main generator trigger
  const handleGenerate = async (forceCheaper: boolean = false) => {
    if (inputs.budget <= 0) {
      setError("Please specify a daily budget greater than 0.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCompletedTodos({}); // Reset checklist state
    
    try {
      if (apiKey.trim()) {
        // Real API Mode
        const response = await generateFullMealPlan(inputs, apiKey.trim(), forceCheaper);
        setMealPlan(response);
        triggerToast(forceCheaper ? "Optimized budget plan generated!" : "Personalized plan generated!");
      } else {
        // Demo Mode (simulated thinking time)
        await new Promise(resolve => setTimeout(resolve, 2000));
        const response = getDynamicMockPlan(inputs, forceCheaper);
        setMealPlan(response);
        triggerToast(forceCheaper ? "Demo budget plan loaded!" : "Demo plan loaded!");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred while communicating with Gemini. Please check your API key and network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Export results panel as PDF
  const handleExportPDF = async () => {
    const element = document.getElementById('meal-plan-results-section');
    if (!element) return;

    triggerToast("Preparing PDF download...");
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#090d16',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/webp', 0.9);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      const x = (pdfWidth - finalWidth) / 2;
      const y = 0; // Align to top
      
      pdf.addImage(imgData, 'WEBP', x, y, finalWidth, finalHeight);
      pdf.save('AI-Meal-Planner-Output.pdf');
      triggerToast("PDF downloaded successfully!");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to generate PDF. Copying list instead.");
    }
  };

  // Copy grocery list text block to clipboard
  const handleCopyGroceryList = () => {
    if (!mealPlan) return;
    
    const categorized: Record<string, string[]> = {};
    mealPlan.grocery_list.forEach(item => {
      if (!categorized[item.category]) {
        categorized[item.category] = [];
      }
      categorized[item.category].push(`${item.item} (${item.quantity})`);
    });

    let textBlock = `🧺 GROCERY SHOPPING LIST\n`;
    textBlock += `Generated by Smart Meal Planner AI\n`;
    textBlock += `====================================\n\n`;

    Object.entries(categorized).forEach(([category, items]) => {
      textBlock += `● ${category.toUpperCase()}\n`;
      items.forEach(i => {
        textBlock += `  [ ] ${i}\n`;
      });
      textBlock += `\n`;
    });

    navigator.clipboard.writeText(textBlock);
    triggerToast("Grocery list copied to clipboard!");
  };

  // Toggle checklist check state
  const toggleTodo = (index: number) => {
    setCompletedTodos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header>
        <div className="logo-section">
          <ChefHat size={36} className="logo-icon" />
          <div>
            <h1>Smart Meal Planner</h1>
          </div>
          <span>AI POC</span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Key status indicator */}
          <div 
            className="api-key-container"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            <Key size={14} className={apiKey.trim() ? "logo-icon" : "text-muted"} />
            <span style={{ 
              fontSize: '0.75rem', 
              color: apiKey.trim() ? '#10b981' : '#f59e0b',
              fontWeight: 700, 
              background: 'none', 
              padding: 0,
              letterSpacing: 0
            }}>
              {apiKey.trim() ? "GEMINI AI ENABLED" : "DEMO (MOCK PLAN MODE)"}
            </span>
          </div>
          
          {/* Toggle form button */}
          <button 
            className="btn-secondary" 
            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          >
            {apiKey.trim() ? "Modify Key" : "Enter API Key"}
          </button>
        </div>
      </header>

      {/* Floating Key Settings overlay */}
      {showApiKeyInput && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '2rem',
            borderRadius: 'var(--radius-lg)',
            width: '450px',
            maxWidth: '90%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Key className="logo-icon" /> Gemini API Authentication
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Enter your Gemini API key to query live recipe generation. Leave it blank to run in <strong>Demo Mode</strong>, which simulates AI logic with responsive parameters.
            </p>
            
            <form onSubmit={handleSaveApiKey}>
              <div className="form-group">
                <label>Gemini API Key</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  placeholder="AIzaSy..."
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-generate" style={{ margin: 0, flex: 1 }}>
                  Save Key
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowApiKeyInput(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Layout Grid */}
      <main className="layout">
        
        {/* Left Side: Parameters Form */}
        <section className="form-panel">
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-purple)' }} /> Plan Parameters
          </h2>

          {/* Part 1: Personal Info */}
          <div className="form-section-title">
            <Utensils size={16} /> Culinary Profile
          </div>

          <div className="input-row">
            <div className="form-group">
              <label htmlFor="people-count">People count</label>
              <input 
                id="people-count"
                type="number" 
                min={1} 
                max={20}
                value={inputs.peopleCount} 
                onChange={(e) => setInputs(prev => ({ ...prev, peopleCount: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dietary-preference">Dietary Option</label>
              <select 
                id="dietary-preference"
                value={inputs.dietaryPreference} 
                onChange={(e) => setInputs(prev => ({ ...prev, dietaryPreference: e.target.value as any }))}
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div className="input-row">
            <div className="form-group">
              <label htmlFor="cooking-skill">Cooking Skill</label>
              <select 
                id="cooking-skill"
                value={inputs.cookingSkill} 
                onChange={(e) => setInputs(prev => ({ ...prev, cookingSkill: e.target.value as any }))}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="time-available">Cooking Window</label>
              <select 
                id="time-available"
                value={inputs.timeAvailable} 
                onChange={(e) => setInputs(prev => ({ ...prev, timeAvailable: e.target.value as any }))}
              >
                <option value="Less than 30 mins">&lt; 30 mins</option>
                <option value="30-60 mins">30–60 mins</option>
                <option value="60-120 mins">60–120 mins</option>
                <option value="120+ mins">120+ mins</option>
              </select>
            </div>
          </div>

          {/* Part 2: Budget */}
          <div className="form-section-title">
            <Coins size={16} /> Budget Allocation
          </div>
          <div className="input-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="daily-budget">Max Budget per day</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  id="currency-selector"
                  value={inputs.currency} 
                  onChange={(e) => setInputs(prev => ({ ...prev, currency: e.target.value }))}
                  style={{ width: '80px', flexShrink: 0 }}
                >
                  <option value="$">USD ($)</option>
                  <option value="₹">INR (₹)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
                <input 
                  id="daily-budget"
                  type="number" 
                  min={1}
                  value={inputs.budget} 
                  onChange={(e) => setInputs(prev => ({ ...prev, budget: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
          </div>

          {/* Part 3: Pantry */}
          <div className="form-section-title">
            <Apple size={16} /> Home Pantry Items
          </div>
          <div className="form-group">
            <label>Add available ingredients to skip buying them</label>
            <div className="pantry-input-container">
              <input 
                type="text" 
                value={customPantryInput}
                onChange={(e) => setCustomPantryInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPantryItem(); } }}
                placeholder="Type item (e.g. Milk, Chicken)"
              />
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleAddPantryItem}
                style={{ padding: '0.75rem' }}
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Pantry Chips */}
            <div className="pantry-chips">
              {inputs.pantryItems.map((item, idx) => (
                <div key={idx} className="pantry-chip">
                  {item}
                  <button type="button" onClick={() => handleRemovePantryItem(idx)}>×</button>
                </div>
              ))}
              {inputs.pantryItems.length === 0 && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pantry is empty</span>
              )}
            </div>

            {/* Popular Staples */}
            <div className="suggested-pantry-title">Quick Staples Click-Add</div>
            <div className="suggested-pantry-list">
              {POPULAR_PANTRY.map((staple) => {
                const isActive = inputs.pantryItems.includes(staple);
                return (
                  <button
                    key={staple}
                    type="button"
                    className="suggested-pantry-item"
                    onClick={() => handleTogglePopularPantry(staple)}
                    style={{
                      background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: isActive ? 'var(--accent-purple)' : 'var(--border-color)',
                      color: isActive ? '#c4b5fd' : 'var(--text-secondary)'
                    }}
                  >
                    {isActive ? `✓ ${staple}` : staple}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Part 4: Personalization Preferences */}
          <div className="form-section-title">
            <Heart size={16} /> Personal Preferences
          </div>
          <div className="form-group">
            <label htmlFor="cuisine-style">Preferred Cuisines (optional)</label>
            <input 
              id="cuisine-style"
              type="text" 
              value={inputs.cuisines} 
              onChange={(e) => setInputs(prev => ({ ...prev, cuisines: e.target.value }))}
              placeholder="e.g. Indian, Mediterranean"
            />
          </div>
          <div className="form-group">
            <label htmlFor="avoid-foods">Avoid foods / dislikes</label>
            <input 
              id="avoid-foods"
              type="text" 
              value={inputs.avoidFoods} 
              onChange={(e) => setInputs(prev => ({ ...prev, avoidFoods: e.target.value }))}
              placeholder="e.g. Mushroom, bell pepper"
            />
          </div>
          <div className="form-group">
            <label htmlFor="allergies">Allergies</label>
            <input 
              id="allergies"
              type="text" 
              value={inputs.allergies} 
              onChange={(e) => setInputs(prev => ({ ...prev, allergies: e.target.value }))}
              placeholder="e.g. Nuts, Dairy, Gluten"
            />
          </div>
          <div className="form-group">
            <label htmlFor="health-goals">Nutritional Goal</label>
            <select 
              id="health-goals"
              value={inputs.healthGoals} 
              onChange={(e) => setInputs(prev => ({ ...prev, healthGoals: e.target.value as any }))}
            >
              <option value="Balanced diet">Balanced Diet</option>
              <option value="Weight loss">Weight Loss</option>
              <option value="High protein">High Protein</option>
              <option value="Low carb">Low Carb</option>
            </select>
          </div>

          {error && (
            <div style={{ 
              color: 'var(--accent-rose)', 
              background: 'rgba(244, 63, 94, 0.1)', 
              padding: '0.75rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid rgba(244, 63, 94, 0.2)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1.25rem'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <button 
            type="button" 
            className="btn-generate"
            onClick={() => handleGenerate(false)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="spinner" size={18} /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate My Meal Plan
              </>
            )}
          </button>
        </section>

        {/* Right Side: Results Display */}
        <section className="results-panel" id="meal-plan-results-section">
          {isLoading ? (
            /* Loading State Card */
            <div className="loading-card">
              <div className="spinner"></div>
              <div className="loading-text">Gemini Chef is Cooking...</div>
              <div className="loading-tip">{loadingTip}</div>
            </div>
          ) : mealPlan ? (
            /* Result Panel Loaded */
            <>
              {/* Control Bar */}
              <div className="control-bar" data-html2canvas-ignore="true">
                <span className="control-bar-title">Custom AI Meal Plan Details</span>
                <div className="control-buttons">
                  <button 
                    className="btn-secondary cheaper-btn" 
                    onClick={() => handleGenerate(true)}
                    disabled={isLoading}
                  >
                    <Coins size={14} /> Make This Plan Cheaper
                  </button>
                  <button className="btn-secondary" onClick={handleCopyGroceryList}>
                    <Copy size={14} /> Copy Grocery List
                  </button>
                  <button className="btn-secondary" onClick={handleExportPDF}>
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              </div>

              {/* AI Scores Summary Row */}
              <div className="metrics-row">
                {/* Nutrition Score */}
                <div className="metric-card nutrition">
                  <div className="metric-icon-wrapper">
                    <Activity size={20} />
                  </div>
                  <div className="metric-info">
                    <h4>AI Nutrition Health</h4>
                    <div className="metric-value">{mealPlan.nutrition_scores?.overall || 85}/100</div>
                    <div className="metric-detail" title={mealPlan.nutrition_scores?.explanation}>
                      {mealPlan.nutrition_scores?.explanation}
                    </div>
                  </div>
                </div>

                {/* Budget Feasibility */}
                <div className="metric-card budget">
                  <div className="metric-icon-wrapper">
                    <DollarSign size={20} />
                  </div>
                  <div className="metric-info">
                    <h4>Budget Feasibility</h4>
                    <div className="metric-value" style={{
                      color: mealPlan.budget_analysis.status.includes('Significantly') 
                        ? 'var(--accent-rose)' 
                        : mealPlan.budget_analysis.status.includes('Slightly') 
                          ? 'var(--accent-amber)' 
                          : 'var(--accent-emerald)'
                    }}>
                      {mealPlan.budget_analysis.status}
                    </div>
                    <div className="metric-detail">
                      Cost: {inputs.currency}{mealPlan.budget_analysis.estimated_cost} of {inputs.currency}{mealPlan.budget_analysis.budget}
                    </div>
                  </div>
                </div>

                {/* Pantry Score */}
                <div className="metric-card pantry">
                  <div className="metric-icon-wrapper">
                    <Apple size={20} />
                  </div>
                  <div className="metric-info">
                    <h4>Pantry Utilization</h4>
                    <div className="metric-value">{mealPlan.pantry_utilization?.score || 0}%</div>
                    <div className="metric-detail">
                      Used {mealPlan.pantry_utilization?.used_items?.length || 0} pantry items
                    </div>
                  </div>
                </div>
              </div>

              {/* Meals cards */}
              <div className="meals-section-title">
                <Utensils size={20} style={{ color: 'var(--accent-purple)' }} /> Daily Meal Schedule
              </div>
              
              <div className="meals-grid">
                {/* Breakfast */}
                <article className="meal-card">
                  <div 
                    className="meal-image-placeholder breakfast" 
                    style={{ backgroundImage: `url(${getMealImage(mealPlan.breakfast.name, 'breakfast')})` }}
                  >
                    <span className="meal-badge">Breakfast</span>
                    <div className="meal-meta">
                      <span className="meta-tag"><Clock size={12} /> {mealPlan.breakfast.time_minutes} min</span>
                      <span className="meta-tag" style={{ fontWeight: 700 }}>{inputs.currency}{mealPlan.breakfast.estimated_cost}</span>
                    </div>
                  </div>
                  <div className="meal-content">
                    <h3 className="meal-title">{mealPlan.breakfast.name}</h3>
                    <p className="meal-desc">{mealPlan.breakfast.description}</p>
                  </div>
                </article>

                {/* Lunch */}
                <article className="meal-card">
                  <div 
                    className="meal-image-placeholder lunch"
                    style={{ backgroundImage: `url(${getMealImage(mealPlan.lunch.name, 'lunch')})` }}
                  >
                    <span className="meal-badge">Lunch</span>
                    <div className="meal-meta">
                      <span className="meta-tag"><Clock size={12} /> {mealPlan.lunch.time_minutes} min</span>
                      <span className="meta-tag" style={{ fontWeight: 700 }}>{inputs.currency}{mealPlan.lunch.estimated_cost}</span>
                    </div>
                  </div>
                  <div className="meal-content">
                    <h3 className="meal-title">{mealPlan.lunch.name}</h3>
                    <p className="meal-desc">{mealPlan.lunch.description}</p>
                  </div>
                </article>

                {/* Dinner */}
                <article className="meal-card">
                  <div 
                    className="meal-image-placeholder dinner"
                    style={{ backgroundImage: `url(${getMealImage(mealPlan.dinner.name, 'dinner')})` }}
                  >
                    <span className="meal-badge">Dinner</span>
                    <div className="meal-meta">
                      <span className="meta-tag"><Clock size={12} /> {mealPlan.dinner.time_minutes} min</span>
                      <span className="meta-tag" style={{ fontWeight: 700 }}>{inputs.currency}{mealPlan.dinner.estimated_cost}</span>
                    </div>
                  </div>
                  <div className="meal-content">
                    <h3 className="meal-title">{mealPlan.dinner.name}</h3>
                    <p className="meal-desc">{mealPlan.dinner.description}</p>
                  </div>
                </article>
              </div>

              {/* Bottom Cards: Lists & Details */}
              <div className="detail-grid">
                
                {/* Left Side: Grocery + Cooking checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Grocery list card */}
                  <div className="panel-card">
                    <h3 className="panel-title">
                      <Apple size={18} style={{ color: 'var(--accent-emerald)' }} /> Categorized Grocery List
                    </h3>
                    
                    {mealPlan.grocery_list.length === 0 ? (
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                        All ingredients are available in your pantry! No grocery purchases needed today.
                      </div>
                    ) : (
                      <div className="grocery-categories">
                        {/* Render categorized lists */}
                        {Array.from(new Set(mealPlan.grocery_list.map(i => i.category))).map(cat => (
                          <div key={cat} className="grocery-category-group">
                            <h5>{cat}</h5>
                            {mealPlan.grocery_list.filter(i => i.category === cat).map((item, index) => (
                              <div key={index} className="grocery-item-row">
                                <span className="grocery-item-name">{item.item}</span>
                                <span className="grocery-item-qty">{item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cooking Checklist Card */}
                  <div className="panel-card">
                    <h3 className="panel-title">
                      <ListTodo size={18} style={{ color: 'var(--accent-purple)' }} /> Cooking Checklist
                    </h3>
                    <div className="checklist-items">
                      {mealPlan.todo_list.map((task, idx) => {
                        const isChecked = completedTodos[idx] || false;
                        return (
                          <div 
                            key={idx} 
                            className={`checklist-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => toggleTodo(idx)}
                          >
                            <div className="checklist-checkbox">
                              <Check size={12} strokeWidth={3} />
                            </div>
                            <span className="checklist-text">{task}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Right Side: Subs + Budget details + Nutrition info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Budget Analysis details */}
                  <div className="panel-card">
                    <h3 className="panel-title">
                      <DollarSign size={18} style={{ color: 'var(--accent-purple)' }} /> Budget Feasibility Analysis
                    </h3>
                    
                    <div className="budget-summary-panel">
                      <div className="budget-summary-item">
                        <span>Your daily budget:</span>
                        <span>{inputs.currency}{mealPlan.budget_analysis.budget.toFixed(2)}</span>
                      </div>
                      <div className="budget-summary-item">
                        <span>Estimated meal cost:</span>
                        <span>{inputs.currency}{mealPlan.budget_analysis.estimated_cost.toFixed(2)}</span>
                      </div>
                      <div className="budget-summary-item total">
                        <span>Remaining budget:</span>
                        <span style={{ 
                          color: mealPlan.budget_analysis.remaining >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                        }}>
                          {inputs.currency}{mealPlan.budget_analysis.remaining.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="budget-tips-title">AI Cost Recommendations</div>
                    <div className="budget-tips-list">
                      {mealPlan.budget_analysis.recommendations.map((rec, index) => (
                        <div key={index} className="budget-tip-item">{rec}</div>
                      ))}
                    </div>
                  </div>

                  {/* Ingredient Substitutions */}
                  <div className="panel-card">
                    <h3 className="panel-title">
                      <Scale size={18} style={{ color: 'var(--accent-cyan)' }} /> Ingredient Substitutions
                    </h3>
                    <div className="substitutions-list">
                      {mealPlan.substitutions.map((sub, index) => (
                        <div key={index} className="substitution-row">
                          <div className="substitution-orig">
                            Original: <strong>{sub.ingredient}</strong>
                          </div>
                          <div className="substitution-alts">
                            {sub.alternatives.map((alt, idx) => (
                              <span key={idx} className="substitution-alt-badge">{alt}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score Explanations details */}
                  <div className="panel-card">
                    <h3 className="panel-title">
                      <Info size={18} style={{ color: 'var(--accent-amber)' }} /> AI Analytics Insights
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Protein Score:</span>
                        <span style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>{mealPlan.nutrition_scores?.protein}/100</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Fiber Score:</span>
                        <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{mealPlan.nutrition_scores?.fiber}/100</span>
                      </div>
                      <div className="score-explanation">
                        <strong>Nutrition Insights:</strong> {mealPlan.nutrition_scores?.explanation}
                      </div>
                      <div className="score-explanation" style={{ borderColor: 'rgba(6, 182, 212, 0.15)', background: 'rgba(6, 182, 212, 0.02)' }}>
                        <strong>Pantry Insights:</strong> {mealPlan.pantry_utilization?.explanation}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </>
          ) : (
            /* Welcome state when no data exists (should not happen since we load mock by default) */
            <div className="welcome-card">
              <div className="welcome-icon-wrapper">
                <ChefHat size={40} />
              </div>
              <h2>Configure Your Meal Plan</h2>
              <p>Adjust the cooking parameters on the left and click "Generate My Meal Plan" to generate your plan.</p>
            </div>
          )}
        </section>

      </main>

      {/* Floating toast notification */}
      {toastMessage && (
        <div className="toast">
          <Check size={16} style={{ color: 'var(--accent-emerald)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
