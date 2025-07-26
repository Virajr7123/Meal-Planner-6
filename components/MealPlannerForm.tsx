import React, { useState } from 'react';
import { UserPreferences } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface MealPlannerFormProps {
  onSubmit: (preferences: UserPreferences) => void;
  isLoading: boolean;
}

const MealPlannerForm: React.FC<MealPlannerFormProps> = ({ onSubmit, isLoading }) => {
  const [diet, setDiet] = useState('Non-Veg');
  const [goal, setGoal] = useState('Maintain Weight');
  const [availableIngredients, setAvailableIngredients] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!availableIngredients.trim()) {
      alert('Please list the ingredients you have available.');
      return;
    }
    onSubmit({ diet, goal, availableIngredients });
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diet Preference */}
          <div>
            <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-2">
              Dietary Preference
            </label>
            <select
              id="diet"
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            >
              <option>Non-Veg</option>
              <option>Veg</option>
              <option>Pure Vegan</option>
              <option>Jain</option>
            </select>
          </div>

          {/* Health Goal */}
          <div>
            <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-2">
              Health Goal
            </label>
            <select
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow"
            >
              <option>Maintain Weight</option>
              <option>Weight Loss</option>
              <option>Muscle Gain</option>
              <option>Improve Energy</option>
            </select>
          </div>
        </div>

        {/* Available Ingredients */}
        <div>
          <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
            What ingredients do you have? (Required)
          </label>
          <textarea
            id="ingredients"
            value={availableIngredients}
            onChange={(e) => setAvailableIngredients(e.target.value)}
            rows={4}
            placeholder="e.g., chicken breast, rice, broccoli, onions, olive oil"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow resize-none"
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              'Generating Plan...'
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                Generate My Meal Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MealPlannerForm;