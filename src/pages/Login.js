// src/pages/Login.js
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Link as MuiLink
} from "@mui/material";
import { styled } from "@mui/material/styles";
import BgImage from "../assets/login-bg.jpg"; // 👉 add an image in src/assets
import FizzyLogo from "../components/FizzyLogo";

const GradientButton = styled(Button)(({ theme }) => ({
    background: "linear-gradient(135deg, #6366f1, #4338ca)",
    color: "#fff",
    fontWeight: 600,
    borderRadius: 10,
    padding: "10px 20px",
    "&:hover": {
        background: "linear-gradient(135deg, #4338ca, #3730a3)"
    }
}));

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const { setStaff } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await axios.post(
                "https://api.techseventeen.com/api/staff/login",
                { email: username, password },
                { withCredentials: true }
            );

            if (response.data?.staff) {
                setStaff(response.data.staff);
                setMessage({ type: "success", text: "Login successful! Redirecting..." });

                setTimeout(() => {
                    navigate("/staff-overview");
                    setLoading(false);
                }, 1200);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Login failed! Please try again."
            });
            setLoading(false);
        }
    };

    return (
        <Box display="flex" minHeight="100vh">
            {/* Left side (image/branding) */}
            <Box
                flex={1}
                display={{ xs: "none", md: "flex" }}
                alignItems="center"
                justifyContent="center"
                sx={{
                    // background: `url(${BgImage}) center/cover no-repeat`,
                    background: `url(https://images.unsplash.com/photo-1647427017067-8f33ccbae493?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D) no-repeat center center/cover`,
                    position: "relative",
                    p: 4,
                    color: "#fff"
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.65)", // deeper navy overlay
                        // backdropFilter: "blur(2px)"
                    }}
                />

                <Box sx={{ position: "relative", zIndex: 2, maxWidth: 400 }}>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                            color: "#fff",
                            textShadow: "0 2px 6px rgba(0,0,0,0.6)" // makes text pop
                        }}
                    >
                        Fizzy Admin
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{
                            opacity: 0.9,
                            color: "#f3f4f6",
                            textShadow: "0 1px 3px rgba(0,0,0,0.5)"
                        }}
                    >
                        Your Business. One Dashboard.
                    </Typography>
                </Box>

            </Box>

            {/* Right side (login form) */}
            <Box
                flex={1}
                display="flex"
                alignItems="center"
                justifyContent="center"
                bgcolor="background.default"
                px={2}
            >
                <Card
                    sx={{
                        maxWidth: 400,
                        width: "100%",
                        borderRadius: 3,
                        boxShadow: 6
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                        {/* <Typography
                            variant="h5"
                            fontWeight={700}
                            textAlign="center"
                            gutterBottom
                        >
                            FIZZY ADMIN
                        </Typography> */}

                        <FizzyLogo letters={["F", "I", "Z", "Z", "Y"]} animateText={false} style={{marginBottom: '16px'}}/>

                        {message && (
                            <Alert
                                severity={message.type}
                                sx={{ mb: 2 }}
                                onClose={() => setMessage(null)}
                            >
                                {message.text}
                            </Alert>
                        )}

                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Email/Username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter email/username"
                                required
                                fullWidth
                                margin="normal"
                            />

                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                                fullWidth
                                margin="normal"
                            />

                            <Box display="flex" justifyContent="flex-end" mt={1}>
                                <MuiLink
                                    component="button"
                                    variant="body2"
                                    underline="hover"
                                    sx={{ color: "primary.main", fontSize: 14 }}
                                >
                                    Forgot Password?
                                </MuiLink>
                            </Box>

                            <Box mt={3} position="relative">
                                <GradientButton
                                    type="submit"
                                    fullWidth
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </GradientButton>
                                {loading && (
                                    <CircularProgress
                                        size={26}
                                        sx={{
                                            color: "primary.light",
                                            position: "absolute",
                                            top: "50%",
                                            left: "50%",
                                            marginTop: "-13px",
                                            marginLeft: "-13px"
                                        }}
                                    />
                                )}
                            </Box>
                        </form>

                        <Box mt={3} textAlign="center">
                            <Button
                                variant="outlined"
                                color="secondary"
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 10,
                                    px: 3
                                }}
                            >
                                Contact Us
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default Login;
