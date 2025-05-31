import React from 'react';

const Select = ({ 
  options = [], 
  value, 
  onChange,
  placeholder = 'Sélectionner une option', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm 
        focus:border-purple-500 focus:ring-purple-500 focus:outline-none
        dark:bg-gray-800 dark:border-gray-600 dark:text-white
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;