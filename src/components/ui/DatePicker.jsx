// filepath: c:\Users\Mohamed\Desktop\my-dashboard-app\src\components\ui\DatePicker.jsx
import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

const DatePicker = ({ 
  selected,
  onChange,
  className = '',
  placeholderText = 'Sélectionner une date',
  disabled = false,
  ...props 
}) => {
  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      className={`
        block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm 
        focus:border-purple-500 focus:ring-purple-500 focus:outline-none
        dark:bg-gray-800 dark:border-gray-600 dark:text-white
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      placeholderText={placeholderText}
      disabled={disabled}
      locale={fr}
      dateFormat="dd/MM/yyyy"
      {...props}
    />
  );
};

export default DatePicker;