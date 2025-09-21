import { Link } from 'react-router-dom';
import { Edit, ExternalLink, Clock } from 'lucide-react';

const EditCard = ({ firstLetter, title, link, status, time, role, location, handleEdit }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer">
            <div className="relative p-6">
                <button 
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                    type="button" 
                    onClick={handleEdit}
                >
                    <Edit className="w-4 h-4" />
                </button>
                
                <div className="flex flex-col items-center text-center space-y-4">
                    {firstLetter && (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                            <span className="text-xl font-bold text-white">{firstLetter}</span>
                        </div>
                    )}
                    
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    )}
                    
                    {role && (
                        <p className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">{role}</p>
                    )}
                    
                    {location && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <span>📍</span> {location}
                        </p>
                    )}
                    
                    {time && (
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {time}
                        </p>
                    )}
                    
                    {link && (
                        <Link 
                            className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-2 max-w-full truncate font-medium" 
                            to={link} 
                            target="_blank"
                        >
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{link}</span>
                        </Link>
                    )}
                    
                    {status && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditCard;