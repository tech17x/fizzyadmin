import React from "react";
import { Plus } from "lucide-react";

const CardAdd = ({ handleAdd }) => {
    return (
        <button 
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 min-h-[200px] flex flex-col justify-center items-center text-center group p-6"
            onClick={handleAdd}
        >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 shadow-md">
                <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                Add New Item
            </span>
            <span className="text-xs text-gray-400 mt-1">Click to create</span>
        </button>
    );
};

export default CardAdd;