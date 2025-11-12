import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css"; // Tailwind must be imported

// --- Pages ---
import Login from "./pages/Login";
import Brand from "./pages/Brand";
import Outlet from "./pages/Outlet";
import Staff from "./pages/Staff";
import OrderType from "./pages/OrderType";
import PaymentType from "./pages/PaymentType";
import Tax from "./pages/Tax";
import Floor from "./pages/Floor";
import Table from "./pages/Table";
import Discount from "./pages/Discount";
import BuyXGetY from "./pages/BuyXGetY";
import Categories from "./pages/Categories";
import Menu from "./pages/Menu";
import Addon from "./pages/Addon";
import Customer from "./pages/Customer";
import WhatsAppSetupPage from "./pages/WhatsAppSetupPage";
import ProfilePage from "./pages/ProfilePage";
import SalesOverview from "./pages/SalesOverview";
import DetailedOrders from "./pages/DetailedOrders";
import ItemwiseSales from "./pages/ItemwiseSales";
import CategorySales from "./pages/categorySales";
import AddonSales from "./pages/AddonSales";
import PaymentSummary from "./pages/PaymentSummary";
import DayEndSummary from "./pages/DayEndSummary";
import CancellationReport from "./pages/CancellationReport";
import { ShiftTimeline } from "./pages/ShiftTimeline";
import { PayrollSummary } from "./pages/PayrollSummary";
import { DailyShifts } from "./pages/DailyShifts";
import NewVsRepeatCustomers from "./pages/NewVsRepeatCustomers";
import PayrollPage from "./pages/PayrollPage";
import StaffOverview from "./pages/StaffOverview";

function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Route */}
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
              <Route path="/staff-performance" element={<StaffOverview />} />
              {/* <Route path="/staff-performance" element={<PayrollOverview />} /> */}
              <Route path="/payment-summary" element={<PaymentSummary />} />
              <Route path="/day-end-summary" element={<DayEndSummary />} />
              <Route path="/cancel-refund" element={<CancellationReport />} />
              <Route path="/staff-overview" element={<StaffOverview />} />
              <Route path="/shifts" element={<ShiftTimeline />} />
              <Route path="/payroll" element={<PayrollSummary />} />
              <Route path="/timeline" element={<DailyShifts />} />
            </Route>

            {/* Redirect all unknown routes */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </AuthProvider>
      </Router>

      {/* Global Toast Notification */}
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </div>
  );
}

export default App;
