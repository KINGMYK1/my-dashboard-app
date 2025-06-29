import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const TextArea = React.forwardRef(({ 
  className = '', 
  label,
  error,
  helperText,
  rows = 3,
  ...props 
}, ref) => {
  const { effectiveTheme } = useTheme();
  const isDarkMode = effectiveTheme === 'dark';
  
  const themeClasses = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus-visible:ring-gray-400' 
    : 'bg-white border-slate-200 text-gray-900 placeholder-slate-500 focus-visible:ring-slate-950';

  const errorClasses = error 
    ? 'border-red-500 focus-visible:ring-red-500' 
    : '';

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={`
          flex w-full rounded-md border px-3 py-2 text-sm 
          ring-offset-white placeholder:text-slate-500 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
          disabled:cursor-not-allowed disabled:opacity-50 
          ${themeClasses} ${errorClasses} ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = "TextArea";

// ✅ CORRECTION: Export nommé ET par défaut
export { TextArea };
export default TextArea;