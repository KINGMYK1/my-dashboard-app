import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Checkbox = React.forwardRef(({ 
  className = '', 
  checked = false, 
  onCheckedChange,
  disabled = false,
  ...props 
}, ref) => {
  const { isDarkMode } = useTheme();
  
  const themeClasses = isDarkMode 
    ? 'bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500' 
    : 'bg-white border-slate-300 text-blue-600 focus:ring-blue-500';

  const handleChange = (e) => {
    if (onCheckedChange) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      className={`
        h-4 w-4 rounded border focus:ring-2 focus:ring-offset-2 
        disabled:cursor-not-allowed disabled:opacity-50
        ${themeClasses} 
        ${className}
      `}
      {...props}
    />
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
export default Checkbox;