import React from "react";

const SelectInput = ({ label, options, selectedOption, onChange, disable = false }) => {
    const handleChange = (event) => {
        const selectedId = event.target.value;
        const selected = options.find((opt) => (opt._id === selectedId || opt.value === selectedId));
        onChange(selected || null);
    };

    return (
        <div className="input-field">
            {label && (
                <label
                    style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: disable ? "#aaa" : "#000",
                    }}
                >
                    {label}
                </label>
            )}

            <div className="input-container">
                <select
                    disabled={disable}
                    value={selectedOption?._id || selectedOption?.value || ""}
                    onChange={handleChange}
                    style={{
                        width: "100%",
                        padding: "10px 35px 10px 10px", // Matches input padding
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        fontSize: "16px",
                        outline: "none",
                        backgroundColor: disable ? "#f5f5f5" : "#fff",
                        color: disable ? "#aaa" : "#000",
                        opacity: disable ? 0.6 : 1,
                        appearance: "none",
                        background: `url("data:image/svg+xml;utf8,<svg fill='%23333' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'></path></svg>") no-repeat right 10px center`,
                        backgroundSize: "14px",
                    }}
                >
                    <option value="" disabled>
                        Select an option
                    </option>
                    {options.map((option) => (
                        <option key={option._id || option.value} value={option._id || option.value}>
                            {option.short_name || option.name || option.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SelectInput;
