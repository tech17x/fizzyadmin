import React from "react";
import { Plus } from "lucide-react";

const CardAdd = ({ handleAdd }) => {
    return (
        <button 
            className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 min-h-[240px] flex flex-col justify-center items-center text-center group"
            onClick={handleAdd}
        >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Plus className="w-8 h-8 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-600 group-hover:text-blue-600 transition-colors">
                Add New Item
            </span>
            <span className="text-xs text-slate-400 mt-1">Click to create</span>
        </button>
    );
};

export default CardAdd;