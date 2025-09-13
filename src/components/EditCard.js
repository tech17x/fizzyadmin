import { Link } from 'react-router-dom';
import { Edit2, ExternalLink, Clock } from 'lucide-react';

const EditCard = ({ firstLetter, title, link, status, time, role, location, handleEdit }) => {
    return (
        <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
            {/* Edit Button */}
            <button 
                onClick={handleEdit}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Edit this item"
            >
                <Edit2 size={16} />
            </button>

            {/* Avatar */}
            {firstLetter && (
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white text-xl font-semibold" 
                     style={{ background: 'linear-gradient(135deg, rgb(239, 162, 128) 0%, rgb(223, 98, 41) 100%)' }}>
                    {firstLetter.toUpperCase()}
                </div>
            )}

            {/* Content */}
            <div className="text-center space-y-2">
                {title && (
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
                )}
                
                {role && (
                    <p className="text-sm text-gray-600">{role}</p>
                )}
                
                {location && (
                    <p className="text-sm text-gray-500">{location}</p>
                )}
                
                {time && (
                    <div className="flex items-center justify-center text-xs text-gray-500">
                        <Clock size={12} className="mr-1" />
                        {time}
                    </div>
                )}
                
                {link && (
                    <Link 
                        to={link} 
                        target="_blank"
                        className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 truncate max-w-full"
                        title={link}
                    >
                        <ExternalLink size={12} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{link}</span>
                    </Link>
                )}
                
                {status && (
                    <div className="pt-2">
                        <span className={`status-badge ${status === 'active' ? 'status-active' : 'status-inactive'}`}>
                            {status.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-orange-100 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
        </div>
    );
};

export default EditCard;