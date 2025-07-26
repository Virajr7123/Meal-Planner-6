import { ref, set, get, update, push, onValue, serverTimestamp, Unsubscribe, query, orderByChild } from 'firebase/database';
import { database } from '../firebase';
import { MealPlan, UserProfile } from '../types';

// Create user profile on sign-up
export const createUserProfile = async (userId: string, email: string): Promise<void> => {
    const userRef = ref(database, `profiles/${userId}`);
    const snapshot = await get(userRef);
    if (!snapshot.exists()) {
        const profile: UserProfile = {
            email,
            displayName: email.split('@')[0] || 'User',
        };
        await set(userRef, profile);
    }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<void> => {
    const userRef = ref(database, `profiles/${userId}`);
    await update(userRef, updates);
};

// Get user profile with a listener
export const getUserProfile = (userId: string, callback: (profile: UserProfile | null) => void): Unsubscribe => {
    const userRef = ref(database, `profiles/${userId}`);
    return onValue(userRef, (snapshot) => {
        callback(snapshot.val());
    });
};

// Save a meal plan
export const saveMealPlan = async (userId: string, plan: Omit<MealPlan, 'id' | 'savedAt'>): Promise<void> => {
    const plansRef = ref(database, `users/${userId}/mealPlans`);
    const newPlanRef = push(plansRef);
    await set(newPlanRef, {
        ...plan,
        savedAt: serverTimestamp(),
    });
};

// Get all saved meal plans for a user with a listener
export const getSavedMealPlans = (userId: string, callback: (plans: MealPlan[]) => void): Unsubscribe => {
    const plansRef = query(ref(database, `users/${userId}/mealPlans`), orderByChild('savedAt'));
    return onValue(plansRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const plansArray = Object.entries(data).map(([key, value]) => ({
                id: key,
                ...(value as Omit<MealPlan, 'id'>),
            }));
            // Sort by saved date, newest first
            callback(plansArray.reverse());
        } else {
            callback([]);
        }
    });
};
