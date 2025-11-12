import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import FizzyLogo from "../components/FizzyLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { setStaff } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:5002/api/staff/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.data?.staff) {
        setStaff(response.data.staff);
        setMessage("Login successful. Redirecting...");
        setTimeout(() => navigate("/profile"), 800);
      } else {
        setMessage("Invalid credentials.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Soft glowing circles (background accents) */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#DF6229]/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#EFA280]/15 blur-[100px] rounded-full"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/50 px-8 py-10 sm:px-10 sm:py-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <FizzyLogo dark={true}/>
          </div>
          <p className="text-gray-500 text-sm tracking-wide">
            Your business. Simplified.
          </p>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`text-center text-sm mb-5 font-medium ${
              message.toLowerCase().includes("success")
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white 
              focus:border-[#DF6229] focus:ring-2 focus:ring-[#EFA280]/30 outline-none transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-slate-300 bg-slate-50 focus:bg-white 
              focus:border-[#DF6229] focus:ring-2 focus:ring-[#EFA280]/30 outline-none transition-all duration-200"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 text-sm font-semibold tracking-wide text-white rounded-xl shadow-lg transition-all duration-200
            hover:opacity-95 disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-[#DF6229]/30"
            style={{
              background: "linear-gradient(90deg, #DF6229 0%, #EFA280 100%)",
            }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Forgot password?{" "}
            <span className="font-semibold text-[#DF6229] hover:text-[#EFA280] transition">
              Contact your administrator
            </span>
          </p>
        </form>

        {/* Footer */}
        <div className="text-center mt-10 text-xs text-gray-400">
          © {new Date().getFullYear()} <span className="font-semibold text-slate-500">Fizzy Admin</span> — All Rights Reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
