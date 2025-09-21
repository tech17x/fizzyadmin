import React from "react";
import { Plus } from "lucide-react";

const CardAdd = ({ handleAdd }) => {
    return (
        <button 
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-dashed border-orange-300 rounded-xl p-6 hover:from-orange-100 hover:to-orange-200 hover:border-orange-400 transition-all duration-200 min-h-[200px] flex flex-col justify-center items-center text-center group"
            onClick={handleAdd}
        >
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <Plus size={24} className="text-white" />
            </div>
            <span className="text-sm font-medium text-orange-600">Add New</span>
        </button>
    );
};

export default CardAdd;
