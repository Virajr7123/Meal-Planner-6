
export interface Meal {
  mealType: string;
  name: string;
  description: string;
  calories: number;
}

export interface MealPlan {
  id?: string;
  meals: Meal[];
  totalCalories: number;
  summary: string;
  savedAt?: number;
}

export interface UserPreferences {
  diet: string;
  goal: string;
  availableIngredients: string;
}

export interface ValidationResponse {
  isValid: boolean;
  reason: string;
}

export interface UserProfile {
    displayName: string;
    email: string;
}
