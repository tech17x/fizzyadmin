// src/layouts/AdminLayout.js
import React, { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  Collapse,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications,
  Settings,
  DarkMode as DarkModeIcon,
  Person,
  Logout,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useThemeCustom } from "../context/ThemeContext";
import menuItems from "../components/menuItems";
import FizzyLogo from "../components/FizzyLogo";

const drawerWidth = 260;
const headerHeight = 72;

const AdminLayout = () => {
  const { theme, toggleTheme } = useThemeCustom();

  // 🟢 separate states
  const [sidebarOpen, setSidebarOpen] = useState(true);   // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false);    // mobile drawer

  const [anchorNotif, setAnchorNotif] = useState(null);
  const [anchorProfile, setAnchorProfile] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:1024px)");

  const handleLogout = () => navigate("/login");

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 2.25,
          color: "var(--text-primary)",
          fontWeight: 700,
          fontSize: 20,
          userSelect: "none",
        }}
      >
        <FizzyLogo />
      </Box>

      <List sx={{ flexGrow: 1, pt: 0 }}>
        {menuItems.map((item, i) => (
          <React.Fragment key={i}>
            {/* Main menu item */}
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() =>
                item.submenu ? setOpenSubmenu(openSubmenu === i ? null : i) : navigate(item.path)
              }
              component={item.submenu ? "div" : Link}
              to={item.submenu ? undefined : item.path}
              sx={{
                mx: 2,
                my: 0.5,
                borderRadius: "12px",
                py: 0.9,
                px: 1.5,
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "var(--transition)",
                "& .MuiListItemIcon-root": { minWidth: 36, color: "var(--text-muted)" },
                color: "var(--text-secondary)",
                "&:hover": { bgcolor: "var(--bg-hover)", color: "var(--text-primary)" },
                "&.Mui-selected": {
                  bgcolor: "var(--bg-active)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  "& .MuiListItemIcon-root": { color: "var(--text-accent)" },
                },
              }}
            >
              <ListItemIcon>{React.cloneElement(item.icon, { size: 18 })}</ListItemIcon>
              <ListItemText primary={item.title} />
              {item.submenu && (openSubmenu === i ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>

            {/* Submenu */}
            {item.submenu && (
              <Collapse in={openSubmenu === i} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((sub, j) => (
                    <ListItemButton
                      key={j}
                      component={Link}
                      to={sub.path}
                      selected={location.pathname === sub.path}
                      sx={{
                        pl: 6,
                        pr: 2,
                        py: 0.6,
                        mx: 2,
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                        lineHeight: 1.4,
                        color: "var(--text-secondary)",
                        "&:hover": { bgcolor: "var(--bg-hover)", color: "var(--text-primary)" },
                        "&.Mui-selected": {
                          bgcolor: "var(--bg-active)",
                          color: "var(--text-accent)",
                          fontWeight: 600,
                        },
                        "& .MuiListItemText-root": {
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {React.cloneElement(sub.icon, { size: 15 })}
                      </ListItemIcon>
                      <ListItemText primary={sub.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Desktop drawer (collapsible) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": {
            position: "fixed",
            top: 0,
            left: 0,
            width: sidebarOpen ? drawerWidth : 0,
            transition: "width 0.3s ease",
            overflowX: "hidden",
            background: "var(--bg-sidebar)",   // 🎨 from theme.css
            borderRight: "var(--border-glass)",
            backdropFilter: "var(--blur)",
            boxShadow: "var(--shadow-sidebar)",
          },
        }}
        open
      >
        {drawer}
      </Drawer>



      {/* Mobile drawer (overlay) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: "var(--border-glass)",
            backdropFilter: "var(--blur)",
            background: "var(--bg-sidebar)",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Header */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: { lg: sidebarOpen ? `${drawerWidth}px` : 0 },
          width: { lg: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          top: 0,
          height: `${headerHeight}px`,
          background: theme === "light"
            ? "var(--bg-header)"   // dark header in light mode
            : "var(--bg-header)",
          color: theme === "light" ? "var(--text-on-dark)" : "var(--text-primary)", // ✅ text contrast
          px: { xs: 1, sm: 2, lg: 3 },
        }}
      >
        <Toolbar sx={{ minHeight: `${headerHeight}px`, px: 0, display: "flex", gap: 1 }}>
          {/* Hamburger logic */}
          {isMobile ? (
            <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton onClick={() => setSidebarOpen((s) => !s)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            onClick={toggleTheme}
            sx={{ mr: 1, bgcolor: "var(--bg-hover)", "&:hover": { bgcolor: "var(--bg-active)" } }}
          >
            <DarkModeIcon />
          </IconButton>

          <IconButton
            onClick={(e) => setAnchorNotif(e.currentTarget)}
            sx={{ mr: 1, bgcolor: "var(--bg-hover)", "&:hover": { bgcolor: "var(--bg-active)" } }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton sx={{ mr: 1, bgcolor: "var(--bg-hover)", "&:hover": { bgcolor: "var(--bg-active)" } }}>
            <Settings />
          </IconButton>

          <IconButton onClick={(e) => setAnchorProfile(e.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36 }}>A</Avatar>
          </IconButton>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorProfile}
            open={Boolean(anchorProfile)}
            onClose={() => setAnchorProfile(null)}
          >
            <MenuItem component={Link} to="/profile">
              <Person sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>

          {/* Notifications Menu */}
          <Menu
            anchorEl={anchorNotif}
            open={Boolean(anchorNotif)}
            onClose={() => setAnchorNotif(null)}
          >
            <MenuItem>📩 New order received — Table 12</MenuItem>
            <MenuItem>⚠️ Low stock: Tomato sauce</MenuItem>
            <MenuItem>✅ Payroll processed for Outlet A</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { lg: sidebarOpen ? `${drawerWidth}px` : 0 },
          pt: `${headerHeight}px`,
          minHeight: "100vh",
          background: "var(--bg-body)",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
