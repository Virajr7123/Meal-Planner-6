import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { MealPlan, UserPreferences, ValidationResponse, UserProfile } from './types';
import { generateMealPlan, validatePreferences } from './services/geminiService';
import * as db from './services/databaseService';
import Header from './components/Header';
import MealPlannerForm from './components/MealPlannerForm';
import MealPlanDisplay from './components/MealPlanDisplay';
import Loader from './components/Loader';
import Footer from './components/Footer';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuthState, setLoadingAuthState] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoadingAuthState(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSignOut = () => {
        signOut(auth).catch((error) => console.error("Sign out error", error));
    };

    if (loadingAuthState) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-cyan-100">
                <Loader />
            </div>
        );
    }
    
    if (!user) {
        return <Auth />;
    }

    return <MealPlanner user={user} onSignOut={handleSignOut} />;
};

const MealPlanner: React.FC<{ user: User; onSignOut: () => void }> = ({ user, onSignOut }) => {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedPlans, setSavedPlans] = useState<MealPlan[]>([]);

  useEffect(() => {
    if (user) {
      const unsubProfile = db.getUserProfile(user.uid, setUserProfile);
      const unsubPlans = db.getSavedMealPlans(user.uid, setSavedPlans);
      return () => {
        unsubProfile();
        unsubPlans();
      };
    }
  }, [user]);

  const handleFormSubmit = useCallback(async (preferences: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setMealPlan(null);
    setShowWelcome(false);

    try {
      const validation: ValidationResponse = await validatePreferences(preferences);
      if (!validation.isValid) {
        setError(validation.reason);
        setIsLoading(false);
        return;
      }
      
      const plan = await generateMealPlan(preferences);
      if (plan) {
        setMealPlan(plan);
      } else {
        setError("Sorry, I couldn't generate a meal plan. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating your plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSavePlan = async (plan: MealPlan) => {
    try {
        await db.saveMealPlan(user.uid, plan);
    } catch (error) {
        console.error("Failed to save meal plan:", error);
        setError("Could not save the plan. Please try again.");
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
        await db.updateUserProfile(user.uid, updates);
    } catch (error) {
        console.error("Failed to update profile:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-cyan-100 text-gray-800 antialiased relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userProfile={userProfile}
        onSignOut={onSignOut}
        onUpdateProfile={handleUpdateProfile}
        savedPlans={savedPlans}
      />
      <div className={`transition-transform duration-300 ${isSidebarOpen ? 'transform -translate-x-64 md:-translate-x-80' : ''}`}>
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Header onMenuClick={() => setIsSidebarOpen(true)} displayName={userProfile?.displayName || null} />
          
          <main>
            <MealPlannerForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            
            <div className="mt-10">
              {isLoading && <Loader />}
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              {mealPlan && <MealPlanDisplay plan={mealPlan} onSavePlan={handleSavePlan} />}
              {showWelcome && !isLoading && !error && (
                <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md">
                  <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome, {userProfile?.displayName || user.email?.split('@')[0]}!</h2>
                  <p className="text-gray-600">Fill out the form above to get a personalized meal plan for your day.</p>
                </div>
              )}
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;