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
  DollarSign
} from 'lucide-react';
import AuthContext from '../context/AuthContext';

const menuItems = [
  {
    title: 'Payroll',
    icon: <Contact2 size={18} />,
    submenu: [
      { title: 'Overview', path: '/staff-overview', icon: <BarChart3 size={16} />, permission: 'brand_manage' },
      { title: 'Daily Shifts', path: '/shifts', icon: <Calendar size={16} />, permission: 'brand_manage' },
      { title: 'Payroll', path: '/payroll', icon: <DollarSign size={16} />, permission: 'brand_manage' },
      { title: 'Timeline', path: '/timeline', icon: <Clock size={16} />, permission: 'brand_manage' },
    ],
  },
  {
    title: 'Reports',
    icon: <PieChart size={18} />,
    submenu: [
      { title: 'Sales Overview', path: '/sales', permission: 'dashboard_view', icon: <BarChart3 size={16} /> },
      { title: 'Customer Insights', path: '/new-vs-repeat-customers', permission: 'dashboard_view', icon: <Users size={16} /> },
      { title: 'Detailed Orders', path: '/detail-orders', permission: 'dashboard_view', icon: <FileTextIcon size={16} /> },
      { title: 'Item-wise Sales', path: '/item-wise-sales', permission: 'dashboard_view', icon: <Package size={16} /> },
      { title: 'Category Sales', path: '/category-sales', permission: 'dashboard_view', icon: <Tags size={16} /> },
      { title: 'Add-on Sales', path: '/add-on-sales', permission: 'dashboard_view', icon: <Plus size={16} /> },
      { title: 'Staff Performance', path: '/staff-performance', permission: 'dashboard_view', icon: <Users size={16} /> },
      { title: 'Payment Summary', path: '/payment-summary', permission: 'dashboard_view', icon: <CreditCard size={16} /> },
      { title: 'Day-end Summary', path: '/day-end-summary', permission: 'dashboard_view', icon: <Calendar size={16} /> },
      { title: 'Cancel/Refund', path: '/cancel-refund', permission: 'dashboard_view', icon: <XCircle size={16} /> }
    ],
  },
  {
    title: 'Brand Configuration',
    icon: <Settings size={18} />,
    submenu: [
      { title: 'Brand', path: '/brand', icon: <Building size={16} />, permission: 'brand_manage' },
      { title: 'Outlet', path: '/outlet', icon: <Store size={16} />, permission: 'outlet_manage' },
      { title: 'Staff', path: '/staff', icon: <Users size={16} />, permission: 'staff_manage' },
      { title: 'Order Type', path: '/order-type', icon: <Type size={16} />, permission: 'order_type_manage' },
      { title: 'Payment Mode', path: '/payment-mode', icon: <CreditCard size={16} />, permission: 'payment_type_manage' },
    ],
  },
  {
    title: 'Master Configuration',
    icon: <Layers size={18} />,
    submenu: [
      { title: 'Tax', path: '/tax', icon: <Percent size={16} />, permission: 'tax_manage' },
      { title: 'Floor', path: '/floor', icon: <Grid size={16} />, permission: 'floor_manage' },
      { title: 'Table', path: '/table', icon: <TableProperties size={16} />, permission: 'table_manage' },
      { title: 'Discount Charge', path: '/discount-charge', icon: <Tag size={16} />, permission: 'discount_manage' },
      { title: 'Buy X Get Y', path: '/buy-x-get-y-item', icon: <Gift size={16} />, permission: 'buyxgety_manage' },
    ],
  },
  {
    title: 'Menu Configuration',
    icon: <MenuSquare size={18} />,
    submenu: [
      { title: 'Categories', path: '/categories', icon: <FolderKanban size={16} />, permission: 'category_manage' },
      { title: 'Menu', path: '/menu', icon: <Utensils size={16} />, permission: 'menu_manage' },
      { title: 'Addon', path: '/addon', icon: <PlusCircle size={16} />, permission: 'addon_manage' },
    ],
  },
  {
    title: 'CRM',
    icon: <Contact2 size={18} />,
    submenu: [
      { title: 'Customer', path: '/customer', icon: <User size={16} />, permission: 'customers_view' },
      { title: 'WhatsApp Setup', path: '/whatsapp-setup', icon: <MessageCircle size={16} />, permission: 'whatsapp_manage' },
    ],
  },
  {
    title: 'Support',
    icon: <Headset size={18} />,
    submenu: [
      { title: '1800-100-1001', path: 'tel:+18001001001', icon: <Phone size={16} /> },
      { title: 'support@fizzy.com', path: 'mailto:support@fizzy.com', icon: <Mail size={16} /> },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState(new Set());
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
    <div className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Fizzy
                </h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
          <button 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {filteredMenuItems.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                <div>
                  <button
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      openMenus.has(index)
                        ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleMenu(index)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={openMenus.has(index) ? 'text-orange-600' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      {!collapsed && <span>{item.title}</span>}
                      }
                    </div>
                    {!collapsed && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${openMenus.has(index) ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {openMenus.has(index) && !collapsed && (
                    <ul className="mt-2 ml-6 space-y-1 border-l border-gray-200 pl-4">
                      {item.submenu.map((subItem, subIdx) => (
                        <li key={subIdx}>
                          <Link
                            to={subItem.path}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                              isActive(subItem.path) 
                                ? 'bg-orange-100 text-orange-700 font-medium border border-orange-200' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <span className={isActive(subItem.path) ? 'text-orange-600' : 'text-gray-400'}>
                              {subItem.icon}
                            </span>
                            <span>{subItem.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={isActive(item.path) ? 'text-orange-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.title}</span>}
                  }
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <button 
          className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => navigate("/profile")}
        >
          <img 
            src={staff?.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face";
            }}
          />
          {!collapsed && (
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 truncate">{staff?.name}</div>
              <div className="text-xs text-orange-600">{staff?.role?.name}</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;