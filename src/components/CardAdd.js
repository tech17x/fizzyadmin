import React from "react";
import { Plus } from "lucide-react";

const CardAdd = ({ handleAdd }) => {
    return (
        <button 
            onClick={handleAdd}
            className="group bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-dashed border-orange-200 rounded-xl p-6 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:shadow-md transition-shadow duration-300">
                <Plus 
                    size={24} 
                    className="text-orange-600 group-hover:text-orange-700 transition-colors duration-200" 
                />
            </div>
            <span className="text-sm font-medium text-orange-700 group-hover:text-orange-800 transition-colors duration-200">
                Add New Item
            </span>
            <span className="text-xs text-orange-600 mt-1 opacity-75">
                Click to create
            </span>
        </button>
    );
};

export default CardAdd;