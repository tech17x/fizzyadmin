import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Button from "../components/Button";
import InputField from "../components/InputField";
import GradientButton from "../components/GradientButton";
import Message from "../components/Message";
import Loader from "../components/Loader";

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
                    navigate("/sales");
                    setLoading(false);
                }, 1000);
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
        <>
            {loading && <Loader />}
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        {/* Header */}
                        <div className="px-8 py-8 bg-gradient-to-r from-orange-500 to-orange-600 text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl font-bold text-white">F</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">FIZZY ADMIN</h1>
                            <p className="text-orange-100 text-sm mt-2">Restaurant Management System</p>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            {message && (
                                <div className="mb-6">
                                    <Message
                                        type={message.type}
                                        message={message.text}
                                        onClose={() => setMessage(null)}
                                        autoDismiss={message.type === "success"}
                                    />
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-6">
                                <InputField
                                    label="Email/Username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your email or username"
                                    required
                                />
                                
                                <InputField
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                />
                                
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                    </label>
                                    <button 
                                        type="button"
                                        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                
                                <GradientButton type="submit" className="w-full">
                                    Sign In
                                </GradientButton>
                            </form>
                        </div>
                    </div>
                    
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-600 mb-4">Need help?</p>
                        <Button className="mx-auto">Contact Support</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;