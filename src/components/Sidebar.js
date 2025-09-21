import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import {
  LayoutDashboard,
  Settings,
  MenuSquare,
  Contact2,
  Headset,
  Bell,
  PanelLeftClose,
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
  FileText,
  MessageCircle,
  LogOut,
  Phone,
  Mail,
  CheckCircle,
  Trash2,
  ChartBarStacked,
  Warehouse,
  FileBarChart2,
  IndianRupee,
  Star,
  UsersRound,
  CalendarDays,
  CalendarRange,
  Clock,
  PercentCircle,
  RotateCw,
  PackageSearch,
  ListOrdered,
  UserRound,
  Building2,
  BriefcaseBusiness,
  BarChart3,
  FileTextIcon,
  Package,
  Tags,
  Plus,
  UsersIcon,
  Calendar,
  XCircle,
  PieChart,
  PieChartIcon,
  DollarSign,
} from 'lucide-react';
import AuthContext from '../context/AuthContext';

const menuItems = [
  {
    title: 'Payroll',
    icon: <Contact2 color="#DF6229" size={15} />,
    submenu: [
      { title: 'Overview', path: '/staff-overview', icon: <BarChart3 color="#DF6229" size={15} />, permission: 'brand_manage' },
      { title: 'Daily Shifts', path: '/shifts', icon: <Calendar color="#DF6229" size={15} />, permission: 'brand_manage' },
      { title: 'Payroll', path: '/payroll', icon: <DollarSign color="#DF6229" size={15} />, permission: 'brand_manage' },
      { title: 'Timeline', path: '/timeline', icon: <Clock color="#DF6229" size={15} />, permission: 'brand_manage' },
    ],
  },
  {
    title: 'Reports',
    icon: <PieChart color="#DF6229" size={15} />,
    submenu: [
      {
        title: 'Sales Overview',
        path: '/sales',
        permission: 'dashboard_view',
        icon: <BarChart3 size={15} color="#DF6229" />
      },
      {
        title: 'Customer Insights',
        path: '/new-vs-repeat-customers',
        permission: 'dashboard_view',
        icon: <Users size={15} color="#DF6229" />
      },
      {
        title: 'Detailed Orders',
        path: '/detail-orders',
        permission: 'dashboard_view',
        icon: <FileTextIcon size={15} color="#DF6229" />
      },
      {
        title: 'Item-wise Sales',
        path: '/item-wise-sales',
        permission: 'dashboard_view',
        icon: <Package size={15} color="#DF6229" />
      },
      {
        title: 'Category Sales',
        path: '/category-sales',
        permission: 'dashboard_view',
        icon: <Tags size={15} color="#DF6229" />
      },
      {
        title: 'Add-on Sales',
        path: '/add-on-sales',
        permission: 'dashboard_view',
        icon: <Plus size={15} color="#DF6229" />
      },
      {
        title: 'Staff Performance',
        path: '/staff-performance',
        permission: 'dashboard_view',
        icon: <UsersIcon size={15} color="#DF6229" />
      },
      {
        title: 'Payment Summary',
        path: '/payment-summary',
        permission: 'dashboard_view',
        icon: <CreditCard size={15} color="#DF6229" />
      },
      {
        title: 'Day-end Summary',
        path: '/day-end-summary',
        permission: 'dashboard_view',
        icon: <Calendar size={15} color="#DF6229" />
      },
      {
        title: 'Cancel/Refund',
        path: '/cancel-refund',
        permission: 'dashboard_view',
        icon: <XCircle size={15} color="#DF6229" />
      }
    ],
  },
  {
    title: 'Brand Configuration',
    icon: <Settings color="#DF6229" size={15} />,
    submenu: [
      { title: 'Brand', path: '/brand', icon: <Building color="#DF6229" size={15} />, permission: 'brand_manage' },
      { title: 'Outlet', path: '/outlet', icon: <Store color="#DF6229" size={15} />, permission: 'outlet_manage' },
      { title: 'Staff', path: '/staff', icon: <Users color="#DF6229" size={15} />, permission: 'staff_manage' },
      { title: 'Order Type', path: '/order-type', icon: <Type color="#DF6229" size={15} />, permission: 'order_type_manage' },
      { title: 'Payment Mode', path: '/payment-mode', icon: <CreditCard color="#DF6229" size={15} />, permission: 'payment_type_manage' },
    ],
  },
  {
    title: 'Master Configuration',
    icon: <Layers color="#DF6229" size={15} />,
    submenu: [
      { title: 'Tax', path: '/tax', icon: <Percent color="#DF6229" size={15} />, permission: 'tax_manage' },
      { title: 'Floor', path: '/floor', icon: <Grid color="#DF6229" size={15} />, permission: 'floor_manage' },
      { title: 'Table', path: '/table', icon: <TableProperties color="#DF6229" size={15} />, permission: 'table_manage' },
      { title: 'Discount Charge', path: '/discount-charge', icon: <Tag color="#DF6229" size={15} />, permission: 'discount_manage' },
      { title: 'Buy X Get Y', path: '/buy-x-get-y-item', icon: <Gift color="#DF6229" size={15} />, permission: 'buyxgety_manage' },
    ],
  },
  {
    title: 'Menu Configuration',
    icon: <MenuSquare color="#DF6229" size={15} />,
    submenu: [
      { title: 'Categories', path: '/categories', icon: <FolderKanban color="#DF6229" size={15} />, permission: 'category_manage' },
      { title: 'Menu', path: '/menu', icon: <Utensils color="#DF6229" size={15} />, permission: 'menu_manage' },
      { title: 'Addon', path: '/addon', icon: <PlusCircle color="#DF6229" size={15} />, permission: 'addon_manage' },
    ],
  },
  {
    title: 'CRM',
    icon: <Contact2 color="#DF6229" size={15} />,
    submenu: [
      { title: 'Customer', path: '/customer', icon: <User color="#DF6229" size={15} />, permission: 'customers_view' },
      { title: 'Whatsapp Setup', path: '/whatsapp-setup', icon: <MessageCircle color="#DF6229" size={15} />, permission: 'whatsapp_manage' },
    ],
  },
  {
    title: 'Support',
    icon: <Headset color="#DF6229" size={15} />,
    submenu: [
      {
        title: '1800-100-1001',
        path: 'tel:+18001001001',
        icon: <Phone color="#DF6229" size={15} />,
      },
      {
        title: 'support@fizzy.com',
        path: 'mailto:support@fizzy.com',
        icon: <Mail color="#DF6229" size={15} />,
      },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768 ? true : false);
  const [openIndex, setOpenIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { staff, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu?.some((sub) => sub.path === location.pathname)) {
        setOpenIndex(index);
      }
    });
  }, [location.pathname]);

  const handleAccordionToggle = (index) => {
    if (collapsed) {
      setCollapsed(window.innerWidth < 768 ? true : false);
      setOpenIndex(index);
    } else {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      if (!collapsed) setCollapsed(true);
      setHoveredIndex(null);
    } else {
      if (collapsed) setCollapsed(false);
    }
  };

  const filteredMenuItems = menuItems
    .map((item) => {
      if (item.submenu) {
        const filteredSubmenu = item.submenu.filter(
          (sub) => !sub.permission || staff.permissions.includes(sub.permission)
        );

        // Only show parent if it has at least one allowed submenu
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
    <div className={`h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Fizzy
              </span>
            )}
          </div>
          {!collapsed && (
            <button 
              className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeftClose size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
            {filteredMenuItems.map((item, index) => (
              <li key={index} className="relative">
                {item.submenu ? (
                  <button
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      openIndex === index 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => handleAccordionToggle(index)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path) 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                )}

                {openIndex === index && !collapsed && item.submenu && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.submenu.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          onClick={handleLinkClick}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(subItem.path) 
                              ? 'bg-orange-100 text-orange-700' 
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {subItem.icon}
                          <span>{subItem.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

      {/* Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <button 
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => { handleLinkClick(); navigate("/profile"); }}
        >
          <img 
            src={staff?.image || "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
          />
          {!collapsed && (
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900">{staff?.name}</div>
              <div className="text-xs text-orange-600">{staff?.role?.name}</div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
