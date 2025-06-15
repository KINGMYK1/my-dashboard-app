import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Badge = ({ 
  children, 
  variant = 'gray', 
  size = 'sm', 
  className = '', 
  ...props 
}) => {
  const { isDarkMode } = useTheme();

  const baseClasses = 'inline-flex items-center rounded-full font-medium';

  const getVariantClasses = (variant) => {
    const lightVariants = {
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
      success: 'bg-green-100 text-green-800',
      destructive: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      secondary: 'bg-gray-100 text-gray-800',
      outline: 'border border-gray-300 text-gray-700 bg-transparent'
    };

    const darkVariants = {
      gray: 'bg-gray-700 text-gray-300',
      red: 'bg-red-900/30 text-red-300',
      green: 'bg-green-900/30 text-green-300',
      blue: 'bg-blue-900/30 text-blue-300',
      yellow: 'bg-yellow-900/30 text-yellow-300',
      purple: 'bg-purple-900/30 text-purple-300',
      success: 'bg-green-900/30 text-green-300',
      destructive: 'bg-red-900/30 text-red-300',
      warning: 'bg-yellow-900/30 text-yellow-300',
      secondary: 'bg-gray-700 text-gray-300',
      outline: 'border border-gray-600 text-gray-300 bg-transparent'
    };

    return isDarkMode ? darkVariants[variant] : lightVariants[variant];
  };

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1'
  };

  const variantClass = getVariantClasses(variant) || getVariantClasses('gray');
  const sizeClass = sizeClasses[size] || sizeClasses.sm;

  return (
    <span 
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;