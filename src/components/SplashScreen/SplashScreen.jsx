import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 z-50">
      <div className="w-24 h-24 mb-8" style={{ filter: 'drop-shadow(0 0 12px rgba(139, 92, 246, 0.8))' }}>
        {/* Logo SVG avec animation */}
        <svg className="w-full h-full animate-pulse" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm0 384c-97.2 0-176-78.8-176-176S158.8 80 256 80s176 78.8 176 176-78.8 176-176 176z" fill="#8b5cf6"/>
          <path d="M192 192h-48v128h48V192zM368 192h-48v128h48V192zM288 240h-64v32h64v-32z" fill="#8b5cf6"/>
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
        GAMING CENTER
      </h1>
      
      {/* Spinner circulaire */}
      <div className="mt-4">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 border-r-purple-400 border-b-purple-300 border-l-purple-200 animate-spin"></div>
      </div>
    </div>
  );
};

export default SplashScreen;