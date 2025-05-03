import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import Auth Context
import PrivateRoute from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import Brand from "./pages/Brand";
import Login from "./pages/Login";
import Outlet from "./pages/Outlet";
import Staff from "./pages/Staff";
import OrderType from "./pages/OrderType";
import Tax from "./pages/Tax";
// import Table from "./pages/Table";
import Discount from "./pages/Discount";
import BuyXGetY from "./pages/BuyXGetY";
import Categories from "./pages/Categories";
import Menu from "./pages/Menu";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentType from "./pages/PaymentType";
import Floor from "./pages/Floor";
import Table from "./pages/Table";
import Addon from "./pages/Addon";
import Customer from "./pages/Customer";
import WhatsAppSetupPage from "./pages/WhatsAppSetupPage";
import Orders from "./pages/Orders";
import ProfilePage from "./pages/ProfilePage";

function App() {
    return (
        <>
            <Router> {/* ✅ Keep only one Router (BrowserRouter alias) */}
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Private Routes */}
                        <Route element={<PrivateRoute />}>
                            <Route path="/dashboard" element={<Dashboard />} />
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
                            <Route path="/orders" element={<Orders />} />
                            <Route path="/profile" element={<ProfilePage />} />
                        </Route>

                        {/* Redirect unknown routes to login */}
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </AuthProvider>
            </Router>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
}

export default App;
