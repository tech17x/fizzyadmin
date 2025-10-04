import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import {
    ThemeProvider,
    CssBaseline,
    createTheme,
} from "@mui/material";
import { ThemeProviderCustom, useThemeCustom } from "./context/ThemeContext";

// Import all pages
import Brand from "./pages/Brand";
import Login from "./pages/Login";
import Outlet from "./pages/Outlet";
import Staff from "./pages/Staff";
import OrderType from "./pages/OrderType";
import Tax from "./pages/Tax";
import Discount from "./pages/Discount";
import BuyXGetY from "./pages/BuyXGetY";
import Categories from "./pages/Categories";
import Menu from "./pages/Menu";
import PaymentType from "./pages/PaymentType";
import Floor from "./pages/Floor";
import Table from "./pages/Table";
import Addon from "./pages/Addon";
import Customer from "./pages/Customer";
import WhatsAppSetupPage from "./pages/WhatsAppSetupPage";
import ProfilePage from "./pages/ProfilePage";
import SalesOverview from "./pages/SalesOverview";
import DetailedOrders from "./pages/DetailedOrders";
import ItemwiseSales from "./pages/ItemwiseSales";
import CategorySales from "./pages/categorySales";
import AddonSales from "./pages/AddonSales";
import StaffPerformance from "./pages/StaffPerformance";
import PaymentSummary from "./pages/PaymentSummary";
import DayEndSummary from "./pages/DayEndSummary";
import CancellationReport from "./pages/CancellationReport";
import { StaffOverview } from "./pages/StaffOverview";
import { ShiftTimeline } from "./pages/ShiftTimeline";
import { PayrollSummary } from "./pages/PayrollSummary";
import { DailyShifts } from "./pages/DailyShifts";
import NewVsRepeatCustomers from "./pages/NewVsRepeatCustomers";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppWithTheme() {
    const { theme } = useThemeCustom();

    const muiTheme = createTheme({
        palette: {
            mode: theme,
            primary: { main: "#6366f1" },
            secondary: { main: "#9333ea" },
            background: {
                default: theme === "dark" ? "#0b1220" : "#f6f7fb",
                paper: theme === "dark" ? "rgba(17,24,39,0.6)" : "rgba(255,255,255,0.7)",
            },
            text: {
                primary: theme === "dark" ? "#f8fafc" : "#0f1724",
                secondary: theme === "dark" ? "#cdd6e2" : "#475569",
            },
        },
        shape: { borderRadius: 14 },
        typography: {
            fontFamily: "Inter, Roboto, sans-serif",
            fontSize: 14,
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow:
                            theme === "dark"
                                ? "0 8px 30px rgba(0,0,0,0.6)"
                                : "0 8px 30px rgba(16,24,40,0.08)",
                    },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backdropFilter: "blur(14px)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow:
                            theme === "dark"
                                ? "0 6px 24px rgba(0,0,0,0.6)"
                                : "0 6px 24px rgba(16,24,40,0.08)",
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backdropFilter: "blur(14px)",
                        backgroundColor:
                            theme === "dark"
                                ? "rgba(17,24,39,0.6)"
                                : "rgba(255,255,255,0.6)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                    },
                },
            },
        },
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Private Routes */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/brand" element={<Brand />} />
                            <Route path="/outlet" element={<Outlet />} />
                            <Route path="/staff" element={<Staff />} />
                            <Route path="/order-type" element={<OrderType />} />
                            <Route path="/payment-mode" element={<PaymentType />} />
                            <Route path="/tax" element={<Tax />} />
                            <Route path="/floor" element={<Floor />} />
                            <Route path="/table" element={<Table />} />
                            <Route path="/discount-charge" element={<Discount />} />
                            <Route path="/buy-x-get-y-item" element={<BuyXGetY />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/addon" element={<Addon />} />
                            <Route path="/customer" element={<Customer />} />
                            <Route path="/whatsapp-setup" element={<WhatsAppSetupPage />} />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/sales" element={<SalesOverview />} />
                            <Route path="/new-vs-repeat-customers" element={<NewVsRepeatCustomers />} />
                            <Route path="/detail-orders" element={<DetailedOrders />} />
                            <Route path="/item-wise-sales" element={<ItemwiseSales />} />
                            <Route path="/category-sales" element={<CategorySales />} />
                            <Route path="/add-on-sales" element={<AddonSales />} />
                            <Route path="/staff-performance" element={<StaffPerformance />} />
                            <Route path="/payment-summary" element={<PaymentSummary />} />
                            <Route path="/day-end-summary" element={<DayEndSummary />} />
                            <Route path="/cancel-refund" element={<CancellationReport />} />
                            <Route path="/staff-overview" element={<StaffOverview />} />
                            <Route path="/shifts" element={<ShiftTimeline />} />
                            <Route path="/payroll" element={<PayrollSummary />} />
                            <Route path="/timeline" element={<DailyShifts />} />
                        </Route>

                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </AuthProvider>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
        </ThemeProvider>
    );
}

export default function App() {
    return (
        <ThemeProviderCustom>
            <AppWithTheme />
        </ThemeProviderCustom>
    );
}
