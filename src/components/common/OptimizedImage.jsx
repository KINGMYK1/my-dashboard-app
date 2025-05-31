import React, { useState, useEffect } from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {}, 
  placeholder = true,
  placeholderColor = '#8b5cf6',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Réinitialiser les états si la source change
    setIsLoaded(false);
    setHasError(false);
    
    // Préchargement de l'image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    return () => {
      // Nettoyage
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gray-200 dark:bg-gray-700`}
        style={style}
        {...props}
      >
        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative" style={{ overflow: 'hidden' }}>
      {/* Placeholder coloré */}
      {placeholder && !isLoaded && (
        <div 
          className={`${className} absolute inset-0 transition-opacity duration-500 ease-in-out`}
          style={{ 
            backgroundColor: placeholderColor,
            opacity: 0.3,
            ...style
          }}
        />
      )}
      
      {/* Image réelle avec transition d'opacité */}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={style}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;