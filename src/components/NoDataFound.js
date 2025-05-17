import React from 'react';
import { Ban } from 'lucide-react';

const NoDataFound = ({ message = "No data found", iconSize = 48 }) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                color: '#6B7280'
            }}
        >
            <Ban
                size={iconSize}
                color="#DF6229"
                style={{ marginBottom: '0.5rem' }}
            />
            <p
                style={{
                    fontSize: '1.125rem',
                    fontWeight: 500,
                    margin: 0
                }}
            >
                {message}
            </p>
        </div>
    );
};

export default NoDataFound;