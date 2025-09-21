import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { 
  LogOut, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Building, 
  Store,
  Calendar,
  User,
  Settings,
  Award,
  Clock
} from 'lucide-react';

const ProfilePage = () => {
  const { staff, logout } = useContext(AuthContext);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account information and settings</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 py-8 text-center">
                <div className="relative inline-block">
                  <img
                    src={staff.image}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face";
                    }}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover mx-auto"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mt-4">{staff.name}</h2>
                <p className="text-blue-100 text-sm">{staff.email}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 text-white text-xs font-medium rounded-full">
                    <Award className="w-3 h-3" />
                    {staff.role.name}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{staff.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Joined {formatDate(staff.createdAt)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Status: </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    staff.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {staff.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Role & Permissions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Role & Permissions</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Role</span>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">
                    <Award className="w-4 h-4" />
                    {staff.role.name}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Permissions ({staff.permissions.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {staff.permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                      >
                        {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Brands */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Brands ({staff.brands.length})</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {staff.brands.map((brand) => (
                    <div key={brand._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{brand.full_name || brand.name}</h4>
                          <p className="text-sm text-gray-500">{brand.short_name}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {brand.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{brand.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{brand.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{brand.city}, {brand.state}, {brand.country}</span>
                        </div>
                        {brand.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <a 
                              href={brand.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {brand.website}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div>
                            <span className="font-medium">GST:</span> {brand.gst_no}
                          </div>
                          <div>
                            <span className="font-medium">License:</span> {brand.license_no}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assigned Outlets */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Outlets ({staff.outlets.length})</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {staff.outlets.map((outlet) => (
                    <div key={outlet._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{outlet.name}</h4>
                          <p className="text-sm text-gray-500">Code: {outlet.code}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          {outlet.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{outlet.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{outlet.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{outlet.street}, {outlet.city}, {outlet.state}</span>
                        </div>
                        {outlet.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <a 
                              href={outlet.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline"
                            >
                              {outlet.website}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{outlet.opening_time} - {outlet.closing_time}</span>
                          </div>
                          <div>
                            <span className="font-medium">Timezone:</span> {outlet.timezone?.label?.split(')')[0])}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;