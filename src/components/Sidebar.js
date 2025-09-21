import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Settings,
  MenuSquare,
  Contact2,
  Headset,
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
  X
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
    icon: MenuSquare,
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
    icon: Headset,
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
  const { staff } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-open menu containing current page
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
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-slate-200"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-40 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-xl lg:shadow-none
        ${collapsed ? 'w-20' : 'w-72'}
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              {!collapsed && (
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Fizzy
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">Admin Dashboard</p>
                </div>
              )}
            </div>
            <button 
              className="hidden lg:flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          <ul className="space-y-3">
            {filteredMenuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <li key={index}>
                  {item.submenu ? (
                    <div>
                      <button
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                          openMenus.has(index)
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        onClick={() => toggleMenu(index)}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent size={20} className={openMenus.has(index) ? 'text-blue-600' : 'text-slate-500'} />
                          {!collapsed && <span>{item.title}</span>}
                          }
                        </div>
                        {!collapsed && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${openMenus.has(index) ? 'rotate-180' : ''}`} />
                        )}
                      </button>
                      
                      {openMenus.has(index) && !collapsed && (
                        <ul className="mt-2 ml-8 space-y-1 border-l-2 border-slate-100 pl-4">
                          {item.submenu.map((subItem, subIdx) => {
                            const SubIconComponent = subItem.icon;
                            return (
                              <li key={subIdx}>
                                <Link
                                  to={subItem.path}
                                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isActive(subItem.path) 
                                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                  }`}
                                  onClick={() => setIsMobileOpen(false)}
                                >
                                  <SubIconComponent size={16} className={isActive(subItem.path) ? 'text-blue-600' : 'text-slate-400'} />
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
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isActive(item.path) 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <IconComponent size={20} className={isActive(item.path) ? 'text-blue-600' : 'text-slate-500'} />
                      {!collapsed && <span>{item.title}</span>}
                      }
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-slate-200">
          <button 
            className="w-full flex items-center gap-3 px-4 py-4 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-200 group"
            onClick={() => {
              navigate("/profile");
              setIsMobileOpen(false);
            }}
          >
            <div className="relative">
              <img 
                src={staff?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} 
                alt="Profile" 
                className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 group-hover:border-blue-300 transition-colors"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            {!collapsed && (
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-slate-900 truncate">{staff?.name}</div>
                <div className="text-xs text-blue-600 font-medium">{staff?.role?.name}</div>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;