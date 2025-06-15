import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  const { isDarkMode } = useTheme();
  
  const themeClasses = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus-visible:ring-gray-400' 
    : 'bg-white border-slate-200 text-gray-900 placeholder-slate-500 focus-visible:ring-slate-950';

  return (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${themeClasses} ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
export default Input;