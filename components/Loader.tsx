
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
      <p className="mt-4 text-lg font-semibold text-emerald-700">Crafting your plan...</p>
    </div>
  );
};

export default Loader;
