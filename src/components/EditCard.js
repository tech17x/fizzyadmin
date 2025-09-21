import { Link } from 'react-router-dom';
import { Edit, ExternalLink, Clock } from 'lucide-react';

const EditCard = ({ firstLetter, title, link, status, time, role, location, handleEdit }) => {
    return (
        <div className="relative bg-white rounded-2xl p-6 border-2 border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group cursor-pointer">
            <button 
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                type="button" 
                onClick={handleEdit}
            >
                <Edit className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-4">
                {firstLetter && (
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-white">{firstLetter}</span>
                    </div>
                )}
                
                {title && (
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                )}
                
                {role && (
                    <p className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-full font-medium">{role}</p>
                )}
                
                {location && (
                    <p className="text-sm text-slate-600 flex items-center gap-2">
                        <span>📍</span> {location}
                    </p>
                )}
                
                {time && (
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {time}
                    </p>
                )}
                
                {link && (
                    <Link 
                        className="text-xs text-blue-600 hover:text-blue-700 underline flex items-center gap-2 max-w-full truncate font-medium" 
                        to={link} 
                        target="_blank"
                    >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{link}</span>
                    </Link>
                )}
                
                {status && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'active' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default EditCard;