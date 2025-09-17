import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const isSuccess = type === 'success';
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in">
      <div className={`
        max-w-lg w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden
        ${isSuccess 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
        }
      `}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="ml-3 flex-1 pt-0.5 min-w-0">
              <p className={`
                text-sm font-medium break-words
                ${isSuccess ? 'text-green-800' : 'text-red-800'}
              `}>
                {title}
              </p>
              <p className={`
                mt-1 text-sm break-words
                ${isSuccess ? 'text-green-700' : 'text-red-700'}
              `}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`
                  rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isSuccess 
                    ? 'focus:ring-green-500 hover:text-green-600' 
                    : 'focus:ring-red-500 hover:text-red-600'
                  }
                `}
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Progress bar for auto-close */}
        {autoClose && (
          <div className={`
            h-1 w-full
            ${isSuccess ? 'bg-green-100' : 'bg-red-100'}
          `}>
            <div 
              className={`
                h-full animate-shrink
                ${isSuccess ? 'bg-green-500' : 'bg-red-500'}
              `}
              style={{ animationDuration: `${duration}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
