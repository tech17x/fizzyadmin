import React, { useContext } from 'react';
import { LogOut, User, Mail, Phone, MapPin, Shield, Building, Store, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import HeadingText from '../components/HeadingText';
import GradientButton from "../components/GradientButton";
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
    const { staff, logout } = useContext(AuthContext);

    if (!staff) {
        return <Loader message="Loading profile..." />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <HeadingText 
                title="Profile" 
                subtitle="Manage your account information and view your access permissions"
                icon={User}
            />
            
            {/* Profile Header */}
            <div className="card">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        <div className="relative">
                            <img 
                                src={staff.image} 
                                onError={(e) => e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-xl object-cover border-4 border-orange-100"
                            />
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                        
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{staff.name}</h2>
                            <p className="text-lg text-orange-600 font-medium">{staff.role.name}</p>
                            
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-center sm:justify-start text-gray-600">
                                    <Mail className="h-4 w-4 mr-2" />
                                    <span className="text-sm">{staff.email}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start text-gray-600">
                                    <Phone className="h-4 w-4 mr-2" />
                                    <span className="text-sm">{staff.phone}</span>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <span className="status-badge status-active">
                                    {staff.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <GradientButton clickAction={logout} className="justify-center">
                            <LogOut size={16} className="mr-2" />
                            Logout
                        </GradientButton>
                    </div>
                </div>
            </div>

            {/* Role & Permissions */}
            <div className="card">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Shield className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Role & Permissions</h3>
                        <p className="text-sm text-gray-600">Your access level and system permissions</p>
                    </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-gray-900">Current Role</p>
                            <p className="text-2xl font-bold text-orange-600">{staff.role.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Permissions</p>
                            <p className="text-xl font-semibold text-gray-900">{staff.permissions.length}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">System Permissions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {staff.permissions.map((perm, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                                <span className="text-xs font-medium text-gray-700">
                                    {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Assigned Brands */}
            <div className="card">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Building className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Assigned Brands</h3>
                        <p className="text-sm text-gray-600">Brands you have access to manage</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {staff.brands.map((brand) => (
                        <div key={brand._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{brand.full_name || brand.name}</h4>
                                    <p className="text-sm text-gray-600">{brand.short_name}</p>
                                </div>
                                <span className="status-badge status-active">Active</span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="h-3 w-3 mr-2" />
                                    <span>{brand.email}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="h-3 w-3 mr-2" />
                                    <span>{brand.phone}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="h-3 w-3 mr-2" />
                                    <span>{brand.city}, {brand.state}, {brand.country}</span>
                                </div>
                                {brand.website && (
                                    <div className="flex items-center">
                                        <Link 
                                            to={brand.website} 
                                            target="_blank"
                                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                        >
                                            Visit Website →
                                        </Link>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                                    <div>
                                        <span className="block font-medium">GST</span>
                                        <span>{brand.gst_no}</span>
                                    </div>
                                    <div>
                                        <span className="block font-medium">License</span>
                                        <span>{brand.license_no}</span>
                                    </div>
                                    <div>
                                        <span className="block font-medium">Food License</span>
                                        <span>{brand.food_license}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Assigned Outlets */}
            <div className="card">
                <div className="flex items-center mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <Store className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Assigned Outlets</h3>
                        <p className="text-sm text-gray-600">Outlet locations you can manage and access</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {staff.outlets.map((outlet) => (
                        <div key={outlet._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-semibold text-gray-900">{outlet.name}</h4>
                                    <p className="text-sm text-gray-600">Code: {outlet.code}</p>
                                </div>
                                <span className="status-badge status-active">Active</span>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <Mail className="h-3 w-3 mr-2" />
                                    <span>{outlet.email}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <Phone className="h-3 w-3 mr-2" />
                                    <span>{outlet.phone}</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <MapPin className="h-3 w-3 mr-2" />
                                    <span>{outlet.street}, {outlet.city}, {outlet.state}</span>
                                </div>
                                {outlet.website && (
                                    <div className="flex items-center">
                                        <Link 
                                            to={outlet.website} 
                                            target="_blank"
                                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                        >
                                            Visit Website →
                                        </Link>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                    <div>
                                        <span className="block font-medium">Opening</span>
                                        <span>{outlet.opening_time}</span>
                                    </div>
                                    <div>
                                        <span className="block font-medium">Closing</span>
                                        <span>{outlet.closing_time}</span>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <span className="block font-medium text-xs text-gray-500">Timezone</span>
                                    <span className="text-xs text-gray-600">{outlet.timezone.label}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;