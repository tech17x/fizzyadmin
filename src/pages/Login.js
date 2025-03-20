import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import InputField from "../components/InputField";
import GradientButton from "../components/GradientButton";
import Message from "../components/Message";
import "./Login.css";
import Loader from "../components/Loader";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);
    const [loader, setLoader] = useState(false);
    const { setStaff } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoader(true);
        setMessage(null); // Clear previous messages

        try {
            const response = await axios.post(
                "http://localhost:5001/api/staff/login",
                { email: username, password },
                { withCredentials: true }
            );

            if (response.data?.staff) {
                setStaff(response.data.staff);
                setMessage({ type: "success", text: "Login successful! Redirecting..." });

                // ✅ Move setLoader(false) inside setTimeout after navigation
                setTimeout(() => {
                    navigate("/dashboard");
                    setLoader(false);
                }, 1000);
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Login failed! Please try again."
            });
            setLoader(false); // ✅ Ensure loader is turned off in case of an error
        }
    };


    return (
        <>
            {
                loader && <Loader />
            }
            <div className="login-container">
                <div className="login-form">
                    <div className="login-form-head">
                        <h1>Dhindu Admin</h1>
                    </div>

                    {message && (
                        <Message
                            type={message.type}
                            message={message.text}
                            onClose={() => setMessage(null)}
                            autoDismiss={message.type === "success"}
                        />
                    )}

                    <form onSubmit={handleLogin} className="login-form-body">
                        <InputField
                            label="Email/Username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter email/username"
                            required
                        />
                        <InputField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                        <button className="forgot-password">Forgot Password</button>
                        <GradientButton type="submit">Login</GradientButton>
                    </form>
                </div>
                <div className="contact-btn-container">
                    <Button>Contact Us</Button>
                </div>
            </div>
        </>
    );
};

export default Login;