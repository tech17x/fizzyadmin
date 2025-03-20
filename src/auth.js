// src/auth.js
export const isAuthenticated = async () => {
    try {
        const response = await fetch("/api/auth/validate-token", {
            credentials: "include", // Ensures cookies are sent with request
        });

        if (response.ok) {
            return true; // User is authenticated
        }
    } catch (error) {
        console.error("Authentication check failed:", error);
    }

    return false;
};
