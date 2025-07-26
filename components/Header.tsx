import React from 'react';
import PlateIcon from './icons/PlateIcon';
import MenuIcon from './icons/MenuIcon';

interface HeaderProps {
    onMenuClick: () => void;
    displayName: string | null;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, displayName }) => {
  return (
    <header className="mb-10">
       <div className="relative flex justify-between items-center h-8 mb-2">
            <span className="text-gray-600 font-medium text-sm hidden sm:block">
                Welcome, {displayName || 'User'}!
            </span>
            <button 
                onClick={onMenuClick} 
                className="p-2 rounded-full hover:bg-gray-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                aria-label="Open menu"
            >
                <MenuIcon className="w-6 h-6 text-gray-700" />
            </button>
       </div>

      <div className="text-center">
          <div className="flex items-center justify-center gap-4">
            <PlateIcon className="w-12 h-12 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
              Meal Planner
            </h1>
          </div>
          <p className="mt-3 text-lg text-gray-600">
            Created by Virajr7123
          </p>
      </div>
    </header>
  );
};

export default Header;