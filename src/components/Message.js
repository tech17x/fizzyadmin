import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Message = ({ 
  type = 'info', 
  message, 
  onClose, 
  autoDismiss = false, 
  duration = 3000,
  title = null 
}) => {
    useEffect(() => {
        if (autoDismiss && message) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, autoDismiss, duration, onClose]);

    if (!message) return null;

    const typeConfig = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-600'
        },
        error: {
            icon: XCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-600'
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            textColor: 'text-yellow-800',
            iconColor: 'text-yellow-600'
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-600'
        }
    };

    const config = typeConfig[type];
    const IconComponent = config.icon;

    return (
        <div 
            className={`
                ${config.bgColor} ${config.borderColor} ${config.textColor}
                border rounded-lg p-4 shadow-sm animate-fade-in
            `}
            role="alert" 
            aria-live="assertive"
        >
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="ml-3 flex-1">
                    {title && (
                        <h3 className="text-sm font-medium mb-1">{title}</h3>
                    )}
                    <p className="text-sm">{message}</p>
                </div>
                {onClose && (
                    <div className="ml-auto pl-3">
                        <button
                            onClick={onClose}
                            className={`
                                inline-flex rounded-md p-1.5 hover:bg-opacity-20 hover:bg-gray-600
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent
                                ${config.iconColor}
                            `}
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Message;