import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Settings,
  Contact2,
  ChevronDown,
  ChevronRight,
  Building,
  Store,
  Users,
  Type,
  CreditCard,
  Percent,
  Layers,
  Grid,
  TableProperties,
  Tag,
  Gift,
  FolderKanban,
  Utensils,
  PlusCircle,
  User,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  BarChart3,
  FileTextIcon,
  Package,
  Tags,
  Plus,
  Calendar,
  XCircle,
  PieChart,
  DollarSign,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import AuthContext from '../context/AuthContext';

const menuItems = [
  {
    title: 'Payroll',
    icon: Contact2,
    submenu: [
      { title: 'Overview', path: '/staff-overview', icon: BarChart3, permission: 'brand_manage' },
      { title: 'Daily Shifts', path: '/shifts', icon: Calendar, permission: 'brand_manage' },
      { title: 'Payroll', path: '/payroll', icon: DollarSign, permission: 'brand_manage' },
      { title: 'Timeline', path: '/timeline', icon: Clock, permission: 'brand_manage' },
    ],
  },
  {
    title: 'Reports',
    icon: PieChart,
    submenu: [
      { title: 'Sales Overview', path: '/sales', permission: 'dashboard_view', icon: BarChart3 },
      { title: 'Customer Insights', path: '/new-vs-repeat-customers', permission: 'dashboard_view', icon: Users },
      { title: 'Detailed Orders', path: '/detail-orders', permission: 'dashboard_view', icon: FileTextIcon },
      { title: 'Item-wise Sales', path: '/item-wise-sales', permission: 'dashboard_view', icon: Package },
      { title: 'Category Sales', path: '/category-sales', permission: 'dashboard_view', icon: Tags },
      { title: 'Add-on Sales', path: '/add-on-sales', permission: 'dashboard_view', icon: Plus },
      { title: 'Staff Performance', path: '/staff-performance', permission: 'dashboard_view', icon: Users },
      { title: 'Payment Summary', path: '/payment-summary', permission: 'dashboard_view', icon: CreditCard },
      { title: 'Day-end Summary', path: '/day-end-summary', permission: 'dashboard_view', icon: Calendar },
      { title: 'Cancel/Refund', path: '/cancel-refund', permission: 'dashboard_view', icon: XCircle }
    ],
  },
  {
    title: 'Brand Configuration',
    icon: Settings,
    submenu: [
      { title: 'Brand', path: '/brand', icon: Building, permission: 'brand_manage' },
      { title: 'Outlet', path: '/outlet', icon: Store, permission: 'outlet_manage' },
      { title: 'Staff', path: '/staff', icon: Users, permission: 'staff_manage' },
      { title: 'Order Type', path: '/order-type', icon: Type, permission: 'order_type_manage' },
      { title: 'Payment Mode', path: '/payment-mode', icon: CreditCard, permission: 'payment_type_manage' },
    ],
  },
  {
    title: 'Master Configuration',
    icon: Layers,
    submenu: [
      { title: 'Tax', path: '/tax', icon: Percent, permission: 'tax_manage' },
      { title: 'Floor', path: '/floor', icon: Grid, permission: 'floor_manage' },
      { title: 'Table', path: '/table', icon: TableProperties, permission: 'table_manage' },
      { title: 'Discount Charge', path: '/discount-charge', icon: Tag, permission: 'discount_manage' },
      { title: 'Buy X Get Y', path: '/buy-x-get-y-item', icon: Gift, permission: 'buyxgety_manage' },
    ],
  },
  {
    title: 'Menu Configuration',
    icon: Utensils,
    submenu: [
      { title: 'Categories', path: '/categories', icon: FolderKanban, permission: 'category_manage' },
      { title: 'Menu', path: '/menu', icon: Utensils, permission: 'menu_manage' },
      { title: 'Addon', path: '/addon', icon: PlusCircle, permission: 'addon_manage' },
    ],
  },
  {
    title: 'CRM',
    icon: Contact2,
    submenu: [
      { title: 'Customer', path: '/customer', icon: User, permission: 'customers_view' },
      { title: 'WhatsApp Setup', path: '/whatsapp-setup', icon: MessageCircle, permission: 'whatsapp_manage' },
    ],
  },
  {
    title: 'Support',
    icon: Phone,
    submenu: [
      { title: '1800-100-1001', path: 'tel:+18001001001', icon: Phone },
      { title: 'support@fizzy.com', path: 'mailto:support@fizzy.com', icon: Mail },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { staff, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu?.some((sub) => sub.path === location.pathname)) {
        setOpenMenus(prev => new Set([...prev, index]));
      }
    });
  }, [location.pathname]);

  const toggleMenu = (index) => {
    setOpenMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isActive = (path) => location.pathname === path;

  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(
          (sub) => !sub.permission || staff.permissions.includes(sub.permission)
        );
        if (filteredSubmenu.length > 0) {
          return { ...item, submenu: filteredSubmenu };
        }
        return null;
      } else if (!item.permission || staff.permissions.includes(item.permission)) {
        return item;
      }
      return null;
    })
    .filter(Boolean);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40 h-screen bg-slate-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-72'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">F</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-slate-800">Fizzy Admin</h1>
                <p className="text-xs text-slate-500">Restaurant Management</p>
              </div>
            )}
          </div>
          <button 
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* User Profile Section */}
        {!collapsed && (
          <div className="p-4 border-b border-gray-200 bg-white">
            <button 
              className="w-full flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 group"
              onClick={() => {
                navigate("/profile");
                setIsMobileOpen(false);
              }}
            >
              <img 
                src={staff?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} 
                alt="Profile" 
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
                }}
              />
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-slate-800 truncate text-sm">{staff?.name}</div>
                <div className="text-xs text-slate-500">{staff?.role?.name}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 bg-slate-50">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isMenuOpen = openMenus.has(index);
              const hasActiveSubmenu = item.submenu?.some(sub => isActive(sub.path));
              
              return (
                <li key={index}>
                  {item.submenu ? (
                    <div>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          hasActiveSubmenu
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                        }`}
                        onClick={() => toggleMenu(index)}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5" />
                          {!collapsed && <span>{item.title}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      
                      {isMenuOpen && !collapsed && (
                        <ul className="mt-1 ml-6 space-y-1 border-l border-slate-200 pl-4">
                          {item.submenu.map((subItem, subIdx) => {
                            const SubIconComponent = subItem.icon;
                            const isSubActive = isActive(subItem.path);
                            
                            return (
                              <li key={subIdx}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isSubActive 
                                      ? 'bg-blue-600 text-white shadow-sm' 
                                      : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                                  }`}
                                  onClick={() => setIsMobileOpen(false)}
                                >
                                  <SubIconComponent className="w-4 h-4" />
                                  <span>{subItem.title}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.path) 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-sm'
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <IconComponent className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={logout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;