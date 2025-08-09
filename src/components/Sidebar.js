import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import GradientText from './GradientText';

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
} from 'lucide-react';
import Popup from './Popup';
import FizzyLogo from './FizzyLogo';
import AuthContext from '../context/AuthContext';

const menuItems = [
  {
    title: 'Payroll',
    icon: <Contact2 color="#DF6229" size={15} />,
    submenu: [
      { title: 'Overview', path: '/payroll', icon: <User color="#DF6229" size={15} />, permission: 'brand_manage' },
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
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: '🔔 New Message: You have received a new inquiry from a client.', time: '2 minutes ago', read: false },
    { id: 2, message: '⚠️ System Update: Scheduled maintenance on May 5, 10:00 PM UTC.', time: '1 hour ago', read: false },
    { id: 3, message: '✅ Task Completed: "Homepage redesign" was marked as completed.', time: 'Yesterday', read: true },
  ]);
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
      setHoveredIndex(null)
    } else {
      if (collapsed) setCollapsed(false);
    }
  };

  // Function to handle marking a notification as read
  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  // Function to handle deleting a notification
  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
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
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          <FizzyLogo oneWord={collapsed} />
          {
            !collapsed && (
              <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                <PanelLeftClose color='#DF6229' size={15} />
              </button>
            )
          }
        </div>

        <nav>
          <ul>
            {filteredMenuItems.map((item, index) => (
              <li
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="menu-item"
              >
                {item.submenu ? (
                  <div
                    className={`dropdown-header ${openIndex === index ? 'active-link' : ''}`}
                    onClick={() => handleAccordionToggle(index)}
                  >
                    {item.icon}
                    {!collapsed && <GradientText>{item.title}</GradientText>}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={isActive(item.path) ? 'active-link' : ''}
                    title={item.title}
                  >
                    {item.icon}
                    {!collapsed && <GradientText>{item.title}</GradientText>}
                  </Link>
                )}

                {((openIndex === index && !collapsed) || (hoveredIndex === index && collapsed)) && item.submenu && (
                  <ul className={`submenu card ${collapsed ? 'hover-submenu' : ''}`}>
                    {item.submenu.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          onClick={() => {
                            handleLinkClick();
                            setOpenIndex(index);
                          }}
                          className={isActive(subItem.path) ? 'active-link' : ''}
                        >
                          {subItem.icon}
                          <GradientText>{subItem.title}</GradientText>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={`bottom-section ${collapsed ? "align-center" : ""}`}>
          {/* <ul>
            <li>
              <Link onClick={() => { handleLinkClick(); setShowNotificationPopup(true); }} className={`link-span ${isActive('/notifications') ? 'active-link' : ''}`}>
                <Bell color="#DF6229" size={15} />
                {!collapsed && <GradientText>Notifications</GradientText>}
              </Link>
            </li>
            <li>
              <Link to="#" onClick={(e) => { e.preventDefault(); logout(); }} className={isActive('/logout') ? 'active-link' : ''}>
                <LogOut color="#DF6229" size={15} />
                {!collapsed && <GradientText>Logout</GradientText>}
              </Link>
            </li>
          </ul> */}

          <div className="sidebar-profile" onClick={() => { handleLinkClick(); navigate("/profile"); }}>
            <img src="https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png" alt="user" />
            {!collapsed && (
              <div>
                <strong style={{ fontSize: "15px", color: "#4b5563" }}>{staff.name}</strong>
                <small style={{ fontSize: "12px", color: "#DF6229" }}>{staff.role.name}</small>
              </div>
            )}
          </div>
        </div>
      </aside>
      {showNotificationPopup && (
        <Popup title="Notifications" showCloseBtn={true} closePopup={() => setShowNotificationPopup(false)}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: notification.read ? '#f0f0f0' : '#fff',
                  padding: '10px',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <strong>{notification.read ? '✅' : '🔔'} {notification.message}</strong>
                  <br />
                  <small style={{ color: '#888' }}>{notification.time}</small>
                </div>

                <div>
                  {!notification.read && (
                    <CheckCircle
                      onClick={() => handleMarkAsRead(notification.id)}
                      style={{
                        marginRight: '8px',
                        color: '#DF6229',
                        cursor: 'pointer',
                      }}
                      size={14}
                    />
                  )}
                  <Trash2
                    onClick={() => handleDeleteNotification(notification.id)}
                    style={{
                      color: '#e53e3e',
                      cursor: 'pointer',
                    }}
                    size={14}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Popup>
      )}

    </>

  );
};

export default Sidebar;
