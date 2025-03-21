import React from "react";
import "./Checkbox.css";

const Checkbox = ({ label, checked, handleChange }) => {
    return (
        <div className="checkbox">
            <input
                type="checkbox"
                id={label}
                checked={checked}
                onChange={handleChange}
            />
            <label htmlFor={label}>
                <span className="custom-checkbox">
                    {checked && (
                        <svg
                            width="18"
                            height="14"
                            viewBox="0 0 18 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M17.5277 3.61844L7.62721 13.5189C7.39587 13.7501 7.0822 13.88 6.75514 13.88C6.42808 13.88 6.1144 13.7501 5.88306 13.5189L0.360674 7.96726C0.129719 7.73594 0 7.42243 0 7.09556C0 6.76869 0.129719 6.45518 0.360674 6.22387L1.90281 4.68174C2.13402 4.45149 2.44704 4.32222 2.77334 4.32222C3.09965 4.32222 3.41266 4.45149 3.64388 4.68174L6.78598 7.729L14.2468 0.359905C14.4781 0.129421 14.7913 0 15.1177 0C15.4442 0 15.7574 0.129421 15.9887 0.359905L17.5269 1.86657C17.6426 1.98121 17.7345 2.11762 17.7972 2.26793C17.8599 2.41824 17.8922 2.57948 17.8923 2.74234C17.8923 2.90521 17.8602 3.06647 17.7976 3.21684C17.735 3.36721 17.6433 3.5037 17.5277 3.61844Z"
                                fill="black"
                            />
                        </svg>
                    )}
                </span>
                {label}
            </label>
        </div>
    );
};

export default Checkbox;
