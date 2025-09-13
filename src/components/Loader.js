import React from "react";

const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center space-y-4 max-w-sm mx-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{message}</p>
                    <p className="text-sm text-gray-600 mt-1">Please wait a moment</p>
                </div>
            </div>
        </div>
    );
};

export default Loader;