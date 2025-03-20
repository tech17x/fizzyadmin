import React from "react";
import "./CardAdd.css";

const CardAdd = () => {
    return (
        <div className="card-add">
            <svg className="plus-icon" viewBox="0 0 24 24">
                <defs>
                    <linearGradient id="plusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EFA280" />
                        <stop offset="100%" stopColor="#DF6229" />
                    </linearGradient>
                </defs>
                <path d="M12 5v14M5 12h14" stroke="url(#plusGradient)" strokeWidth="2" strokeLinecap="round" />
            </svg>
        </div>
    );
};

export default CardAdd;
