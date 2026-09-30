import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "./Navbar";

function ProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                await api.get("/me", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setAuthenticated(true);
            } catch (error) {
                localStorage.removeItem("token");
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" />;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}

export default ProtectedRoute;