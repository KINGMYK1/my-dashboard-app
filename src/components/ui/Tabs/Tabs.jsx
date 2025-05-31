
import React, { useState } from 'react';
import Tab from './Tab';

const Tabs = ({ 
  children, 
  value, 
  onValueChange, 
  className = '',
  contentClassName = '',
  ...props 
}) => {
  const [activeTab, setActiveTab] = useState(value || null);
  
  // Filter children to only include Tab components
  const tabElements = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === Tab
  );
  
  // Get tab values and labels
  const tabs = tabElements.map(tab => ({
    value: tab.props.value,
    label: tab.props.label,
    disabled: tab.props.disabled
  }));
  
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
    if (onValueChange) {
      onValueChange(tabValue);
    }
  };
  
  // Find the active content
  const activeContent = tabElements.find(
    tab => tab.props.value === (value || activeTab)
  )?.props.children;
  
  return (
    <div className={`w-full ${className}`} {...props}>
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => !tab.disabled && handleTabChange(tab.value)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${(value || activeTab) === tab.value
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className={`pt-4 ${contentClassName}`}>
        {activeContent}
      </div>
    </div>
  );
};

export default Tabs;