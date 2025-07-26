
import React, { useState } from 'react';
import { MealPlan } from '../types';
import MealCard from './MealCard';

interface MealPlanDisplayProps {
  plan: MealPlan;
  onSavePlan: (plan: MealPlan) => void;
}

const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ plan, onSavePlan }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSavePlan(plan);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500); // Show 'Saved!' message for 2.5 seconds
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-l-4 border-emerald-400">
        <div className="flex justify-between items-start gap-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Personalized Plan</h2>
            <button
                onClick={handleSave}
                disabled={isSaved}
                className="flex-shrink-0 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-all duration-200 disabled:bg-green-600 disabled:cursor-not-allowed"
            >
                {isSaved ? 'Saved!' : 'Save Plan'}
            </button>
        </div>
        <p className="text-gray-600 mb-4">{plan.summary}</p>
        <div className="bg-emerald-100 text-emerald-800 font-bold text-center py-2 px-4 rounded-lg">
          Total Estimated Calories: {plan.totalCalories}
        </div>
      </div>

      {/* Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plan.meals.map((meal, index) => (
          <MealCard key={index} meal={meal} />
        ))}
      </div>
    </div>
  );
};

export default MealPlanDisplay;