// src/components/menuItems.js
import React from "react";
import {
  BarChart3,
  CalendarDays,
  DollarSign,
  Clock4,
  PieChart,
  Users,
  FileText,
  Package,
  Tag,
  Percent,
  Gift,
  Grid,
  Table,
  Settings,
  Building2,
  Store,
  Type,
  CreditCard,
  Utensils,
  Folder,
  PlusCircle,
  User,
  MessageSquare,
  Headphones,
  Phone,
  Mail,
  TrendingUp,
  ListChecks,
  XOctagon,
  BookOpen,
} from "lucide-react";

const menuItems = [
  // ---------------- PAYROLL ----------------
  {
    title: "Payroll",
    icon: <TrendingUp size={18} />,
    path: "/staff-overview"
  },

  // ---------------- REPORTS ----------------
  {
    title: "Reports",
    icon: <PieChart size={18} />,
    submenu: [
      { title: "Sales Overview", path: "/sales", icon: <BarChart3 size={16} /> },
      { title: "Customer Insights", path: "/new-vs-repeat-customers", icon: <Users size={16} /> },
      { title: "Detailed Orders", path: "/detail-orders", icon: <FileText size={16} /> },
      { title: "Item-wise Sales", path: "/item-wise-sales", icon: <Package size={16} /> },
      { title: "Category Sales", path: "/category-sales", icon: <Tag size={16} /> },
      { title: "Add-on Sales", path: "/add-on-sales", icon: <PlusCircle size={16} /> },
      { title: "Staff Performance", path: "/staff-performance", icon: <Users size={16} /> },
      { title: "Payment Summary", path: "/payment-summary", icon: <CreditCard size={16} /> },
      { title: "Day-end Summary", path: "/day-end-summary", icon: <ListChecks size={16} /> },
      { title: "Cancellations / Refunds", path: "/cancel-refund", icon: <XOctagon size={16} /> },
    ],
  },

  // ---------------- CATALOG ----------------
  {
    title: "Catalog",
    icon: <BookOpen size={18} />,
    submenu: [
      { title: "Categories", path: "/categories", icon: <Folder size={16} /> },
      { title: "Menu Items", path: "/menu", icon: <Utensils size={16} /> },
      { title: "Add-ons", path: "/addon", icon: <PlusCircle size={16} /> },
      { title: "Taxes", path: "/tax", icon: <Percent size={16} /> },
      { title: "Floors", path: "/floor", icon: <Grid size={16} /> },
      { title: "Tables", path: "/table", icon: <Table size={16} /> },
      { title: "Discounts & Charges", path: "/discount-charge", icon: <Tag size={16} /> },
      { title: "Promotions (Buy X Get Y)", path: "/buy-x-get-y-item", icon: <Gift size={16} /> },
    ],
  },

  // ---------------- BRAND MANAGEMENT ----------------
  {
    title: "Brand",
    icon: <Settings size={18} />,
    submenu: [
      { title: "Brands", path: "/brand", icon: <Building2 size={16} /> },
      { title: "Outlets", path: "/outlet", icon: <Store size={16} /> },
      { title: "Staff", path: "/staff", icon: <Users size={16} /> },
      { title: "Order Types", path: "/order-type", icon: <Type size={16} /> },
      { title: "Payment Modes", path: "/payment-mode", icon: <CreditCard size={16} /> },
    ],
  },

  // ---------------- CRM ----------------
  {
    title: "CRM",
    icon: <Users size={18} />,
    submenu: [
      { title: "Customers", path: "/customer", icon: <User size={16} /> },
      { title: "WhatsApp Setup", path: "/whatsapp-setup", icon: <MessageSquare size={16} /> },
    ],
  },

  // ---------------- SUPPORT ----------------
  {
    title: "Support",
    icon: <Headphones size={18} />,
    submenu: [
      { title: "Call Support", path: "tel:+18001001001", icon: <Phone size={16} /> },
      { title: "Email Support", path: "mailto:support@fizzy.com", icon: <Mail size={16} /> },
    ],
  },
];

export default menuItems;
