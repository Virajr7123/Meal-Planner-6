import React, { useState, useEffect } from 'react';
import { UserProfile, MealPlan } from '../types';
import CloseIcon from './icons/CloseIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSignOut: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  savedPlans: MealPlan[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userProfile, onSignOut, onUpdateProfile, savedPlans }) => {
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  useEffect(() => {
    setDisplayName(userProfile?.displayName || '');
  }, [userProfile]);

  const handleNameUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim() && displayName.trim() !== userProfile?.displayName) {
      onUpdateProfile({ displayName: displayName.trim() });
    }
  };

  const toggleAccordion = (planId: string) => {
    setActiveAccordion(activeAccordion === planId ? null : planId);
  };
  
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <aside className={`fixed top-0 left-0 h-full w-64 md:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close menu">
            <CloseIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {/* Account Section */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Account</h3>
            <p className="text-sm text-gray-500 mb-3 truncate" title={userProfile?.email}>{userProfile?.email}</p>
            <form onSubmit={handleNameUpdate} className="flex gap-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="flex-grow w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="px-3 py-2 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
                Save
              </button>
            </form>
          </div>

          {/* Saved Plans Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">My Saved Plans</h3>
            {savedPlans.length > 0 ? (
                <div className="space-y-2">
                    {savedPlans.map(plan => (
                        <div key={plan.id} className="border rounded-lg overflow-hidden">
                            <button onClick={() => toggleAccordion(plan.id!)} className="w-full text-left p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100">
                                <span className="font-semibold text-sm text-gray-700">{new Date(plan.savedAt!).toLocaleDateString()} - {plan.totalCalories} kcal</span>
                                <span className={`transform transition-transform duration-200 ${activeAccordion === plan.id ? 'rotate-180' : ''}`}>&#9660;</span>
                            </button>
                            {activeAccordion === plan.id && (
                                <div className="p-3 bg-white border-t text-sm space-y-3">
                                    <p><span className="font-semibold">Summary:</span> {plan.summary}</p>
                                    {plan.meals.map(meal => (
                                        <div key={meal.name}>
                                            <p className="font-semibold text-emerald-700">{meal.mealType}: {meal.name}</p>
                                            <p className="text-gray-600 pl-2">{meal.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500 text-center py-4">You haven't saved any plans yet.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t">
          <button 
            onClick={onSignOut}
            className="w-full text-center py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
