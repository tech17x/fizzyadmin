import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/dark-logo.png';
import logo2 from '../assets/logo.png';
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
} from 'lucide-react';
import Popup from './Popup';

const menuItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard color="#DF6229" />,
    path: '/dashboard',
  },
  {
    title: 'Brand Configuration',
    icon: <Settings color="#DF6229" />,
    submenu: [
      { title: 'Brand', path: '/brand', icon: <Building color="#DF6229" size={16} /> },
      { title: 'Outlet', path: '/outlet', icon: <Store color="#DF6229" size={16} /> },
      { title: 'Staff', path: '/staff', icon: <Users color="#DF6229" size={16} /> },
      { title: 'Order Type', path: '/order-type', icon: <Type color="#DF6229" size={16} /> },
      { title: 'Payment Mode', path: '/payment-mode', icon: <CreditCard color="#DF6229" size={16} /> },
    ],
  },
  {
    title: 'Master Configuration',
    icon: <Layers color="#DF6229" />,
    submenu: [
      { title: 'Tax', path: '/tax', icon: <Percent color="#DF6229" size={16} /> },
      { title: 'Floor', path: '/floor', icon: <Grid color="#DF6229" size={16} /> },
      { title: 'Table', path: '/table', icon: <TableProperties color="#DF6229" size={16} /> },
      { title: 'Discount Charge', path: '/discount-charge', icon: <Tag color="#DF6229" size={16} /> },
      { title: 'Buy X Get Y', path: '/buy-x-get-y-item', icon: <Gift color="#DF6229" size={16} /> },
    ],
  },
  {
    title: 'Menu Configuration',
    icon: <MenuSquare color="#DF6229" />,
    submenu: [
      { title: 'Categories', path: '/categories', icon: <FolderKanban color="#DF6229" size={16} /> },
      { title: 'Menu', path: '/menu', icon: <Utensils color="#DF6229" size={16} /> },
      { title: 'Addon', path: '/addon', icon: <PlusCircle color="#DF6229" size={16} /> },
    ],
  },
  {
    title: 'CRM',
    icon: <Contact2 color="#DF6229" />,
    submenu: [
      { title: 'Customer', path: '/customer', icon: <User color="#DF6229" size={16} /> },
      { title: 'Orders', path: '/orders', icon: <FileText color="#DF6229" size={16} /> },
      { title: 'Whatsapp Setup', path: '/whatsapp-setup', icon: <MessageCircle color="#DF6229" size={16} /> },
    ],
  },
  {
    title: 'Support',
    icon: <Headset color="#DF6229" />,
    submenu: [
      {
        title: '1800-100-1001',
        path: 'tel:+18001001001',  // Opens the phone dialer with the number
        icon: <Phone color="#DF6229" size={16} />
      },
      {
        title: 'support@fizzy.com',
        path: 'mailto:support@fizzy.com',  // Opens the default mail client with the email address
        icon: <Mail color="#DF6229" size={16} />
      },
    ],
  },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: '🔔 New Message: You have received a new inquiry from a client.', time: '2 minutes ago', read: false },
    { id: 2, message: '⚠️ System Update: Scheduled maintenance on May 5, 10:00 PM UTC.', time: '1 hour ago', read: false },
    { id: 3, message: '✅ Task Completed: "Homepage redesign" was marked as completed.', time: 'Yesterday', read: true },
  ]);
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
      setCollapsed(false);
      setOpenIndex(index);
    } else {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLinkClick = () => {
    if (collapsed) setCollapsed(false);
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


  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="logo-section">
          <img
            src={collapsed ? logo2 : logo}
            alt="logo"
            className={`logo-img ${collapsed ? 'collapsed-logo' : ''}`}
          />
          {
            !collapsed && (
              <button className="toggle-btn" onClick={() => setCollapsed(!collapsed)}>
                <PanelLeftClose size={20} />
              </button>
            )
          }
        </div>

        <nav>
          <ul>
            {menuItems.map((item, index) => (
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
                  <ul className={`submenu ${collapsed ? 'hover-submenu' : ''}`}>
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

        <div className="bottom-section">
          <ul>
            <li>
              <Link onClick={() => setShowNotificationPopup(true)} className={`link-span ${isActive('/notifications') ? 'active-link' : ''}`}>
                <Bell color="#DF6229" />
                {!collapsed && <GradientText>Notifications</GradientText>}
              </Link>
            </li>
            <li>
              <Link to="/logout" onClick={handleLinkClick} className={isActive('/logout') ? 'active-link' : ''}>
                <LogOut color="#DF6229" />
                {!collapsed && <GradientText>Logout</GradientText>}
              </Link>
            </li>
          </ul>

          <div className="profile" onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
            <img src="https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png" alt="user" />
            {!collapsed && (
              <div>
                <span>Sahil Rao</span>
                <span>Admin</span>
              </div>
            )}
          </div>
        </div>
      </aside>
      {showNotificationPopup && (
        <Popup title="Notifications" closePopup={() => setShowNotificationPopup(false)}>
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
                        fontSize: '1rem',
                      }}
                    />
                  )}
                  <Trash2
                    onClick={() => handleDeleteNotification(notification.id)}
                    style={{
                      color: '#e53e3e',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
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
