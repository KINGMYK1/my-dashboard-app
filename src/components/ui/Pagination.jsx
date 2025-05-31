import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '',
  showFirstLast = true,
  maxDisplayed = 5
}) => {
  if (totalPages <= 1) return null;
  
  const handlePageClick = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  
  // Calculate range of pages to display
  const getPageRange = () => {
    if (totalPages <= maxDisplayed) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    const halfMax = Math.floor(maxDisplayed / 2);
    let startPage = Math.max(currentPage - halfMax, 1);
    let endPage = Math.min(startPage + maxDisplayed - 1, totalPages);
    
    if (endPage - startPage + 1 < maxDisplayed) {
      startPage = Math.max(endPage - maxDisplayed + 1, 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };
  
  const pageRange = getPageRange();
  
  return (
    <nav className={`flex items-center ${className}`}>
      <ul className="flex items-center -space-x-px">
        {/* First page */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => handlePageClick(1)}
              disabled={currentPage === 1}
              className={`
                px-3 py-2 ml-0 leading-tight rounded-l-lg border
                ${currentPage === 1 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'}
              `}
            >
              «
            </button>
          </li>
        )}
        
        {/* Previous page */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              px-3 py-2 leading-tight border
              ${currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600' 
                : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'}
            `}
          >
            ‹
          </button>
        </li>
        
        {/* Page numbers */}
        {pageRange.map(page => (
          <li key={page}>
            <button
              onClick={() => handlePageClick(page)}
              className={`
                px-3 py-2 leading-tight border
                ${currentPage === page
                  ? 'bg-purple-50 border-purple-300 text-purple-600 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-400'
                  : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'}
              `}
            >
              {page}
            </button>
          </li>
        ))}
        
        {/* Next page */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              px-3 py-2 leading-tight border
              ${currentPage === totalPages 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600' 
                : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'}
            `}
          >
            ›
          </button>
        </li>
        
        {/* Last page */}
        {showFirstLast && (
          <li>
            <button
              onClick={() => handlePageClick(totalPages)}
              disabled={currentPage === totalPages}
              className={`
                px-3 py-2 leading-tight rounded-r-lg border
                ${currentPage === totalPages 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-600' 
                  : 'bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'}
              `}
            >
              »
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;