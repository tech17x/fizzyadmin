import React from "react";
import {
  PieChart,
  BookOpen,
  Settings,
  Users,
  Headphones,
  TrendingUp,
} from "lucide-react";

/**
 * Fizzy Admin — Professional Main Navigation
 * Clean, minimal, and aligned with the black–white–orange design.
 * Each top-level section handles its own internal navigation.
 */

const menuItems = [
  {
    title: "Overview",
    path: "/staff-overview",
    icon: <TrendingUp size={18} />,
    description: "Get real-time insights into staff, shifts, and payroll.",
  },
  {
    title: "Reports",
    path: "/sales",
    icon: <PieChart size={18} />,
    description: "Analyze performance, revenue, and customer behavior.",
  },
  {
    title: "Catalog",
    path: "/catalog",
    icon: <BookOpen size={18} />,
    description: "Manage your menu, add-ons, taxes, and pricing structure.",
  },
  {
    title: "Brand",
    path: "/brand",
    icon: <Settings size={18} />,
    description: "Control your brands, outlets, and staff roles effortlessly.",
  },
  {
    title: "CRM",
    path: "/crm",
    icon: <Users size={18} />,
    description: "Engage with customers and manage relationships seamlessly.",
  },
  {
    title: "Support",
    path: "/support",
    icon: <Headphones size={18} />,
    description: "Need help? Reach out to our team anytime.",
  },
];

export default menuItems;
