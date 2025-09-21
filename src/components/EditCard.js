import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';

const EditCard = ({ firstLetter, title, link, status, time, role, location, handleEdit }) => {
    return (
        <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 hover:shadow-md transition-all duration-200 min-h-[200px] flex flex-col justify-center items-center text-center">
            <button 
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-orange-600 hover:bg-white rounded-full transition-colors"
                type="button" 
                onClick={handleEdit}
            >
                <Edit size={16} />
            </button>
            
            {firstLetter &&
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-semibold text-white">{firstLetter}</span>
                </div>
            }
            
            {
                title &&
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            }
            
            {
                role ?
                    <p className="text-sm text-gray-600 mb-1">{role}</p> : null
            }
            
            {
                location ?
                    <p className="text-sm text-gray-600 mb-1">{location}</p> : null
            }
            
            {
                time ?
                    <p className="text-xs text-gray-500 mb-2">{time}</p> : null
            }
            
            {
                link &&
                <Link 
                    className="text-xs text-orange-600 hover:text-orange-700 underline truncate max-w-full block mb-2" 
                    to={link} 
                    target="_blank"
                >
                    {link}
                </Link>
            }
            
            {
                status &&
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            }
        </div>
    );
};

export default EditCard;