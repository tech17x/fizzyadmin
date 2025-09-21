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
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="px-8 py-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-center">
                            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-6">
                                <span className="text-2xl font-bold text-white">F</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-2">FIZZY ADMIN</h1>
                            <p className="text-blue-100 text-sm">Restaurant Management System</p>
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
                                    label="Email Address"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your email address"
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
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                                        />
                                        <span className="ml-3 text-sm text-gray-600 font-medium">Remember me</span>
                                    </label>
                                    <button 
                                        type="button"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                
                                <GradientButton type="submit" className="w-full py-4 text-base">
                                    Sign In to Dashboard
                                </GradientButton>
                            </form>
                        </div>
                    </div>
                    
                    <div className="text-center mt-8">
                        <p className="text-sm text-gray-600 mb-4">Need assistance?</p>
                        <Button className="mx-auto">Contact Support Team</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;