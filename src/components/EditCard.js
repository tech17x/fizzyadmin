import { Link } from 'react-router-dom';
import { Edit, ExternalLink, Clock } from 'lucide-react';

const EditCard = ({ firstLetter, title, link, status, time, role, location, handleEdit }) => {
    return (
        <div className="relative bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-orange-200 transition-all duration-200 group">
            <button 
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                type="button" 
                onClick={handleEdit}
            >
                <Edit className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
                {firstLetter && (
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">{firstLetter}</span>
                    </div>
                )}
                
                {title && (
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
                
                {role && (
                    <p className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">{role}</p>
                )}
                
                {location && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        <span>📍</span> {location}
                    </p>
                )}
                
                {time && (
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {time}
                    </p>
                )}
                
                {link && (
                    <Link 
                        className="text-xs text-orange-600 hover:text-orange-700 underline flex items-center gap-1 max-w-full truncate" 
                        to={link} 
                        target="_blank"
                    >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{link}</span>
                    </Link>
                )}
                
                {status && (
                    <span className={`status-badge ${status === 'active' ? 'status-active' : 'status-inactive'}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default EditCard;