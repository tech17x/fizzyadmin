import React, { useState } from "react";

const SubLinks = ({ links }) => {
    const [active, setActive] = useState(null);

    return (
        <div className="flex space-x-3 p-2 bg-gray-100 rounded-full w-fit">
            {links.map((link, index) => (
                <button
                    key={index}
                    onClick={() => setActive(index)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200
            ${active === index
                            ? "bg-[rgba(255,232,225,0.85)] text-black shadow-md"
                            : "bg-white text-gray-700 hover:bg-gray-200"
                        }`}
                >
                    {link.name}
                </button>
            ))}
        </div>
    );
};

export default SubLinks;
