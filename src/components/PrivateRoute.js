import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import AdminLayout from "../layouts/AdminLayout";
import Loader from "./Loader";

const PrivateRoute = () => {
    const { staff, loading } = useContext(AuthContext);

    if (loading) return (<Loader/>); // Prevent flash of login page

    return staff ? <AdminLayout><Outlet /></AdminLayout> : <Navigate to="/login" />;
};

export default PrivateRoute;
