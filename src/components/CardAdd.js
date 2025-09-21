import React from "react";
import { Plus } from "lucide-react";

const CardAdd = ({ handleAdd }) => {
    return (
        <button 
            className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-400 hover:bg-orange-50 transition-all duration-200 min-h-[200px] flex flex-col justify-center items-center text-center group"
            onClick={handleAdd}
        >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-lg">
                <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 group-hover:text-orange-600 transition-colors">
                Add New
            </span>
        </button>
    );
};

export default CardAdd;