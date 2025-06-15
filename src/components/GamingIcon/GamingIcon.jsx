import React from 'react';
import GamingIconService from '../../services/gamingIconService';

const GamingIcon = ({ 
  iconKey, 
  size = 32, 
  className = '', 
  showTooltip = false,
  glowEffect = false,
  animated = false 
}) => {
  const iconData = GamingIconService.renderIcon(iconKey, size);

  const getGlowClass = () => {
    if (!glowEffect) return '';
    return 'drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 hover:scale-110';
  };

  const getAnimationClass = () => {
    if (!animated) return '';
    return 'animate-pulse hover:animate-none';
  };

  const combinedClassName = `${className} ${getGlowClass()} ${getAnimationClass()}`.trim();

  if (iconData.type === 'emoji') {
    return (
      <span 
        className={`inline-block ${combinedClassName}`}
        style={iconData.style}
        title={showTooltip ? iconKey : undefined}
        role="img"
        aria-label={iconKey}
      >
        {iconData.content}
      </span>
    );
  }

  if (iconData.type === 'logo') {
    return (
      <img
        src={iconData.content}
        alt={iconKey}
        className={`inline-block ${combinedClassName}`}
        style={iconData.style}
        title={showTooltip ? iconKey : undefined}
      />
    );
  }

  return null;
};

// ✅ Composant sélecteur d'icônes pour les formulaires
export const GamingIconSelector = ({ 
  selectedIcon, 
  onSelect, 
  className = '',
  suggestedIcons = [],
  showCategories = true 
}) => {
  const categories = GamingIconService.getCategories();
  const allIcons = GamingIconService.getAllIcons();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Suggestions basées sur le nom */}
      {suggestedIcons.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            💡 Suggestions
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestedIcons.map(iconKey => {
              const icon = allIcons[iconKey];
              if (!icon) return null;
              
              return (
                <button
                  key={iconKey}
                  type="button"
                  onClick={() => onSelect(iconKey)}
                  className={`p-2 border-2 rounded-lg transition-all hover:scale-105 ${
                    selectedIcon === iconKey
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                  title={icon.name}
                >
                  <GamingIcon iconKey={iconKey} size={32} glowEffect />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Catégories d'icônes */}
      {showCategories && Object.entries(categories).map(([categoryKey, category]) => (
        <div key={categoryKey}>
          <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {category.name}
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {Object.entries(category.icons).map(([iconKey, icon]) => (
              <button
                key={iconKey}
                type="button"
                onClick={() => onSelect(iconKey)}
                className={`p-2 border-2 rounded-lg transition-all hover:scale-105 ${
                  selectedIcon === iconKey
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
                title={icon.name}
              >
                <GamingIcon iconKey={iconKey} size={24} glowEffect />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Option pour emoji personnalisé */}
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          🎮 Emojis Gaming
        </h4>
        <div className="grid grid-cols-8 sm:grid-cols-12 gap-2">
          {Object.entries(GamingIconService.GAMING_EMOJIS || {}).map(([emojiKey, emoji]) => (
            <button
              key={emojiKey}
              type="button"
              onClick={() => onSelect(emojiKey)}
              className={`p-2 border-2 rounded-lg transition-all hover:scale-105 ${
                selectedIcon === emojiKey
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              title={emojiKey}
            >
              <span className="text-xl">{emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamingIcon;