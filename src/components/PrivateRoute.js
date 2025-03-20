import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import { isAuthenticated } from "../auth";


const PrivateRoute = () => {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await isAuthenticated();
            setAuth(authenticated);
        };
        checkAuth();
    }, []);

    if (auth === null) return <div>Loading...</div>; // Show loading state

    return auth ? <AdminLayout><Outlet /></AdminLayout> : <Navigate to="/login" />;
};

export default PrivateRoute;
