import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmButtonText = 'Confirmer',
  cancelButtonText = 'Annuler',
  confirmButtonClassName = 'bg-red-600 hover:bg-red-700',
  loading = false
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-300">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${confirmButtonClassName}`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Traitement...</span>
              </div>
            ) : (
              confirmButtonText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;