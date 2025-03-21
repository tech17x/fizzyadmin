

const SelectInput = ({ label, name, value, onChange, options }) => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label htmlFor={name} style={{ fontSize: "16px", fontWeight: 500 }}>
                {label}
            </label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                style={{
                    padding: "10px 40px 10px 10px", // Added right padding to create space for dropdown icon
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    width: "100%",
                    appearance: "none",
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M17.3229 1.53062L9.36297 9.03061C9.28905 9.10035 9.20126 9.15567 9.10462 9.19341C9.00799 9.23115 8.90441 9.25058 8.79981 9.25058C8.6952 9.25058 8.59162 9.23115 8.49499 9.19341C8.39836 9.15567 8.31057 9.10035 8.23664 9.03061L0.276727 1.53062C0.127367 1.38988 0.043457 1.19901 0.043457 0.99999C0.043457 0.800967 0.127367 0.610095 0.276727 0.469364C0.426088 0.328634 0.628664 0.249573 0.839891 0.249573C1.05112 0.249573 1.25369 0.328634 1.40306 0.469364L8.79981 7.43968L16.1966 0.469364C16.2705 0.399682 16.3583 0.344406 16.4549 0.306695C16.5516 0.268983 16.6551 0.249573 16.7597 0.249573C16.8643 0.249573 16.9679 0.268983 17.0645 0.306695C17.1611 0.344406 17.2489 0.399682 17.3229 0.469364C17.3968 0.539047 17.4555 0.621773 17.4955 0.712817C17.5356 0.803862 17.5562 0.901444 17.5562 0.99999C17.5562 1.09854 17.5356 1.19612 17.4955 1.28716C17.4555 1.37821 17.3968 1.46093 17.3229 1.53062Z" fill="black" /> </svg>')`, // Custom dropdown arrow
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 10px center", // Position the icon properly
                    backgroundSize: "16px",
                    textTransform: "capitalize",
                    outline: "none"
                }}
            >
                {options.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
};


export default SelectInput;