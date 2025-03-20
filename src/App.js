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
import PaymentMode from "./pages/PaymentMode";
import Tax from "./pages/Tax";
import Table from "./pages/Table";
import Discount from "./pages/Discount";
import BuyXGetY from "./pages/BuyXGetY";
import Categories from "./pages/Categories";
import Menu from "./pages/Menu";

function App() {
    return (
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
                        <Route path="/payment-mode" element={<PaymentMode />} />
                        <Route path="/tax" element={<Tax />} />
                        <Route path="/table" element={<Table />} />
                        <Route path="/discount" element={<Discount />} />
                        <Route path="/charge" element={<Discount />} />
                        <Route path="/coupon" element={<Discount />} />
                        <Route path="/buy-x-get-y-item" element={<BuyXGetY />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/menu" element={<Menu />} />
                    </Route>

                    {/* Redirect unknown routes to login */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
