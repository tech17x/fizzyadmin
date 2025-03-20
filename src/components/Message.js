import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Message.css'; // Import styles

const Message = ({ type = 'error', message, onClose, autoDismiss = false, duration = 3000 }) => {
    useEffect(() => {
        if (autoDismiss && message) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, autoDismiss, duration, onClose]);

    if (!message) return null; // Don't render if no message

    return (
        <div className={`message-container ${type}`} role="alert" aria-live="assertive">
            <span className="message-text">{message}</span>
            {onClose && (
                <button className="message-close-btn" onClick={onClose} aria-label="Close">
                    &times;
                </button>
            )}
        </div>
    );
};

Message.propTypes = {
    type: PropTypes.oneOf(['success', 'error']), // Supports 'success' or 'error'
    message: PropTypes.string.isRequired,
    onClose: PropTypes.func, // Optional close function
    autoDismiss: PropTypes.bool, // Auto-hide after duration
    duration: PropTypes.number, // Auto-dismiss duration
};

export default Message;
