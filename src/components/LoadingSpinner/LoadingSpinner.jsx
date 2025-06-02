import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = null,
  fullPage = false 
}) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: isDarkMode ? 'border-purple-500' : 'border-[var(--accent-color-primary)]',
    white: 'border-white',
    gray: 'border-gray-500'
  };

  const textColorClass = isDarkMode ? 'text-gray-300' : 'text-[var(--text-secondary)]';

  const spinner = (
    <div className="flex flex-col items-center">
      <div 
        className={`
          ${sizeClasses[size]} 
          border-2 border-t-transparent 
          ${colorClasses[color]} 
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className={`mt-3 text-sm ${textColorClass}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;