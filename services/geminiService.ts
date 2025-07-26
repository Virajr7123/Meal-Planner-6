import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, MealPlan, ValidationResponse } from '../types';

// Correctly access the API key using Vite's environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY environment variable is not set. Please set it in your .env file or hosting provider.");
}

const ai = new GoogleGenAI({ apiKey });

const validationSchema = {
    type: Type.OBJECT,
    properties: {
        isValid: {
            type: Type.BOOLEAN,
            description: "True if the ingredients are compatible with the diet, false otherwise."
        },
        reason: {
            type: Type.STRING,
            description: "A brief, user-friendly explanation for why the ingredients are not valid. If they are valid, this should be an empty string."
        }
    },
    required: ["isValid", "reason"]
};

const mealPlanSchema = {
    type: Type.OBJECT,
    properties: {
        meals: {
            type: Type.ARRAY,
            description: "An array of meals for the day.",
            items: {
                type: Type.OBJECT,
                properties: {
                    mealType: {
                        type: Type.STRING,
                        description: "The type of meal (e.g., 'Breakfast', 'Lunch', 'Dinner', 'Snack')."
                    },
                    name: {
                        type: Type.STRING,
                        description: "Name of the meal/dish."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A short description of the meal, including simple preparation steps or ingredients."
                    },
                    calories: {
                        type: Type.INTEGER,
                        description: "Estimated number of calories for this meal."
                    }
                },
                required: ["mealType", "name", "description", "calories"]
            }
        },
        totalCalories: {
            type: Type.INTEGER,
            description: "The total estimated calories for all meals combined for the day."
        },
        summary: {
            type: Type.STRING,
            description: "A brief summary of why this meal plan fits the user's goals, or if a full plan couldn't be generated, an explanation of why."
        }
    },
    required: ["meals", "totalCalories", "summary"]
};

export const validatePreferences = async (prefs: UserPreferences): Promise<ValidationResponse> => {
    const prompt = `
        You are a dietary compliance validator. Your role is to determine if a list of ingredients is compatible with a selected dietary preference.

        Dietary Preference: ${prefs.diet}
        Available Ingredients: ${prefs.availableIngredients}

        Analyze the ingredients provided. Determine if any of them violate the dietary preference.

        - For 'Veg', ingredients must not contain any meat, poultry, or fish.
        - For 'Pure Vegan', ingredients must not contain any animal products at all, including meat, poultry, fish, dairy (milk, cheese, butter), eggs, or honey.
        - For 'Jain', ingredients must be strictly vegetarian (no meat, fish, poultry) AND must not include any root vegetables (like onions, garlic, potatoes, carrots, radishes) or honey.
        - For 'Non-Veg', there are no restrictions, so it will always be valid unless the ingredients are nonsensical.

        Respond ONLY with a JSON object following the provided schema. If there is a violation, provide a concise reason (e.g., "Invalid input: Chicken is not a vegetarian ingredient."). If valid, the reason should be an empty string.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: validationSchema,
                temperature: 0.1, // Low temperature for deterministic validation
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            return { isValid: false, reason: "Could not validate ingredients. The API returned an empty response." };
        }

        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error validating preferences:", error);
        throw new Error("Failed to validate user preferences.");
    }
};


export const generateMealPlan = async (prefs: UserPreferences): Promise<MealPlan | null> => {
    const prompt = `
        You are an expert nutritionist and creative chef. Your task is to create a personalized one-day meal plan strictly using a provided list of ingredients, tailored to the user's dietary style and specific health goal. The user's input has already been validated to ensure the ingredients match the diet.

        User Preferences:
        - Dietary Style: ${prefs.diet}
        - Health Goal: ${prefs.goal}
        
        Available Ingredients:
        - ${prefs.availableIngredients}

        **Core Instructions:**

        1.  **Strict Ingredient Adherence:** You MUST create the entire meal plan using ONLY the ingredients from the "Available Ingredients" list. Do not assume any other ingredients are available (not even staples like salt, pepper, or oil unless they are listed). If a common ingredient is missing, you must create the plan without it.
        
        2.  **Goal-Oriented Meal Construction:** Based on the user's health goal, adjust the meal composition and portioning of the available ingredients accordingly.
            - **Weight Loss:** Prioritize lower-calorie meal combinations. Emphasize vegetables and lean proteins if available. Suggest smaller portion sizes to create a calorie deficit.
            - **Muscle Gain:** Prioritize higher-protein and calorie-dense meals. Combine protein sources and healthy fats from the list wherever possible to create a calorie surplus.
            - **Maintain Weight:** Create a balanced plan with moderate portion sizes aiming for a standard daily caloric intake suitable for maintenance.
            - **Improve Energy:** Focus on balanced meals with complex carbohydrates (if available), protein, and healthy fats to provide sustained energy.

        3.  **Handling Insufficient Ingredients:**
            - If the ingredients are insufficient for a complete one-day plan (e.g., breakfast, lunch, dinner), state this clearly in the 'summary' field. Explain what key food groups or components are missing for a balanced day (e.g., "Missing a significant protein source for muscle gain," or "Lacks enough variety for a full day's meals").
            - Despite the limitations, create as many complete meals as possible with the given ingredients. If you can only make one or two meals, that is acceptable.

        4.  **Handling Invalid Input:** If the list of ingredients is empty or nonsensical, state in the summary that you cannot create a plan without a list of ingredients and return an empty 'meals' array.

        **Output Format:**
        - Respond ONLY with a valid JSON object that adheres to the provided schema.
        - For each meal, provide a name, a brief description (mentioning the specific ingredients used), and an estimated calorie count.
        - Calculate the total estimated calories for all generated meals and provide a summary of the plan and any limitations.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: mealPlanSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        if (!jsonText) {
            console.error("Gemini API returned an empty response for meal plan generation.");
            return null;
        }

        const mealPlan: MealPlan = JSON.parse(jsonText);
        return mealPlan;

    } catch (error) {
        console.error("Error generating meal plan with Gemini API:", error);
        throw error;
    }
};