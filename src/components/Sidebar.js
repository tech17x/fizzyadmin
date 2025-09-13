import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Settings, MenuSquare, Contact2, Headset, Bell, PanelLeftClose,
  Building, Store, Users, Type, CreditCard, Percent, Layers, Grid, TableProperties,
  Tag, Gift, FolderKanban, Utensils, PlusCircle, User, FileText, MessageCircle,
  LogOut, Phone, Mail, CheckCircle, Trash2, ChartBarStacked, Warehouse,
  FileBarChart2, IndianRupee, Star, UsersRound, CalendarDays, CalendarRange,
  Clock, PercentCircle, RotateCw, PackageSearch, ListOrdered, UserRound,
  Building2, BriefcaseBusiness, BarChart3, FileTextIcon, Package, Tags, Plus,
  UsersIcon, Calendar, XCircle, PieChart, PieChartIcon, DollarSign, Menu, X
} from 'lucide-react';
import FizzyLogo from './FizzyLogo';
import AuthContext from '../context/AuthContext';

const menuItems = [
  {
    title: 'Payroll',
    icon: <Contact2 className="w-5 h-5" />,
    submenu: [
      { title: 'Overview', path: '/staff-overview', icon: <BarChart3 className="w-4 h-4" />, permission: 'brand_manage' },
      { title: 'Daily Shifts', path: '/shifts', icon: <Calendar className="w-4 h-4" />, permission: 'brand_manage' },
      { title: 'Payroll', path: '/payroll', icon: <DollarSign className="w-4 h-4" />, permission: 'brand_manage' },
      { title: 'Timeline', path: '/timeline', icon: <Clock className="w-4 h-4" />, permission: 'brand_manage' },
    ],
  },
  {
    title: 'Reports',
    icon: <PieChart className="w-5 h-5" />,
    submenu: [
      { title: 'Sales Overview', path: '/sales', permission: 'dashboard_view', icon: <BarChart3 className="w-4 h-4" /> },
      { title: 'Detailed Orders', path: '/detail-orders', permission: 'dashboard_view', icon: <FileTextIcon className="w-4 h-4" /> },
      { title: 'Item-wise Sales', path: '/item-wise-sales', permission: 'dashboard_view', icon: <Package className="w-4 h-4" /> },
      { title: 'Category Sales', path: '/category-sales', permission: 'dashboard_view', icon: <Tags className="w-4 h-4" /> },
      { title: 'Add-on Sales', path: '/add-on-sales', permission: 'dashboard_view', icon: <Plus className="w-4 h-4" /> },
      { title: 'Staff Performance', path: '/staff-performance', permission: 'dashboard_view', icon: <UsersIcon className="w-4 h-4" /> },
      { title: 'Payment Summary', path: '/payment-summary', permission: 'dashboard_view', icon: <CreditCard className="w-4 h-4" /> },
      { title: 'Day-end Summary', path: '/day-end-summary', permission: 'dashboard_view', icon: <Calendar className="w-4 h-4" /> },
      { title: 'Cancel/Refund', path: '/cancel-refund', permission: 'dashboard_view', icon: <XCircle className="w-4 h-4" /> }
    ],
  },
  {
    title: 'Brand Configuration',
    icon: <Settings className="w-5 h-5" />,
    submenu: [
      { title: 'Brand', path: '/brand', icon: <Building className="w-4 h-4" />, permission: 'brand_manage' },
      { title: 'Outlet', path: '/outlet', icon: <Store className="w-4 h-4" />, permission: 'outlet_manage' },
      { title: 'Staff', path: '/staff', icon: <Users className="w-4 h-4" />, permission: 'staff_manage' },
      { title: 'Order Type', path: '/order-type', icon: <Type className="w-4 h-4" />, permission: 'order_type_manage' },
      { title: 'Payment Mode', path: '/payment-mode', icon: <CreditCard className="w-4 h-4" />, permission: 'payment_type_manage' },
    ],
  },
  {
    title: 'Master Configuration',
    icon: <Layers className="w-5 h-5" />,
    submenu: [
      { title: 'Tax', path: '/tax', icon: <Percent className="w-4 h-4" />, permission: 'tax_manage' },
      { title: 'Floor', path: '/floor', icon: <Grid className="w-4 h-4" />, permission: 'floor_manage' },
      { title: 'Table', path: '/table', icon: <TableProperties className="w-4 h-4" />, permission: 'table_manage' },
      { title: 'Discount Charge', path: '/discount-charge', icon: <Tag className="w-4 h-4" />, permission: 'discount_manage' },
      { title: 'Buy X Get Y', path: '/buy-x-get-y-item', icon: <Gift className="w-4 h-4" />, permission: 'buyxgety_manage' },
    ],
  },
  {
    title: 'Menu Configuration',
    icon: <MenuSquare className="w-5 h-5" />,
    submenu: [
      { title: 'Categories', path: '/categories', icon: <FolderKanban className="w-4 h-4" />, permission: 'category_manage' },
      { title: 'Menu', path: '/menu', icon: <Utensils className="w-4 h-4" />, permission: 'menu_manage' },
      { title: 'Addon', path: '/addon', icon: <PlusCircle className="w-4 h-4" />, permission: 'addon_manage' },
    ],
  },
  {
    title: 'CRM',
    icon: <Contact2 className="w-5 h-5" />,
    submenu: [
      { title: 'Customer', path: '/customer', icon: <User className="w-4 h-4" />, permission: 'customers_view' },
      { title: 'WhatsApp Setup', path: '/whatsapp-setup', icon: <MessageCircle className="w-4 h-4" />, permission: 'whatsapp_manage' },
    ],
  },
  {
    title: 'Support',
    icon: <Headset className="w-5 h-5" />,
    submenu: [
      { title: '1800-100-1001', path: 'tel:+18001001001', icon: <Phone className="w-4 h-4" /> },
      { title: 'support@fizzy.com', path: 'mailto:support@fizzy.com', icon: <Mail className="w-4 h-4" /> },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 1024);
  const [openIndex, setOpenIndex] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { staff, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
        setMobileMenuOpen(false);
      } else {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu?.some((sub) => sub.path === location.pathname)) {
        setOpenIndex(index);
      }
    });
  }, [location.pathname]);

  const handleAccordionToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo Section */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <FizzyLogo />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            <PanelLeftClose className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredMenuItems.map((item, index) => (
              <li key={index}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => handleAccordionToggle(index)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                        ${openIndex === index 
                          ? 'bg-orange-50 text-orange-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    
                    {openIndex === index && (
                      <ul className="mt-2 space-y-1 ml-6">
                        {item.submenu.map((subItem, subIdx) => (
                          <li key={subIdx}>
                            <Link
                              to={subItem.path}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`
                                flex items-center px-3 py-2 text-sm rounded-lg transition-colors duration-200
                                ${isActive(subItem.path)
                                  ? 'bg-orange-100 text-orange-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <span className="mr-3">{subItem.icon}</span>
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
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                      ${isActive(item.path)
                        ? 'bg-orange-100 text-orange-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div 
            className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            onClick={() => {
              navigate("/profile");
              setMobileMenuOpen(false);
            }}
          >
            <img 
              src={staff.image || "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png"} 
              alt="Profile" 
              className="w-10 h-10 rounded-lg object-cover border-2 border-orange-100"
            />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{staff.name}</p>
              <p className="text-xs text-orange-600 truncate">{staff.role.name}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;