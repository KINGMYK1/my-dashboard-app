
import React from 'react';

const colorClasses = {
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
};

const sizeClasses = {
  xs: 'text-xs px-1.5 py-0.5',
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-sm px-3 py-1'
};

const Badge = ({ 
  children, 
  color = 'gray', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const colorClass = colorClasses[color] || colorClasses.gray;
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${colorClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;