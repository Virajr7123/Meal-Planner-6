
import React from 'react';
import { Meal } from '../types';

interface MealCardProps {
  meal: Meal;
}

const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
      <div className="flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-emerald-700">{meal.mealType}</h3>
          <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full">
            {meal.calories} kcal
          </span>
        </div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{meal.name}</h4>
        <p className="text-gray-600 text-sm">{meal.description}</p>
      </div>
    </div>
  );
};

export default MealCard;
