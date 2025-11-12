import React from "react";

const FizzyLogo = ({ dark = false }) => {
  return (
    <div className="flex items-center justify-center select-none">
      {/* Animated dot */}
      <span
        className="w-3 h-3 rounded-full bg-[#DF6229] mr-2 animate-pulse"
        style={{
          animation: "pulse 1.6s infinite ease-in-out",
        }}
      ></span>

      {/* Brand text */}
      <span
        className={`font-bold text-[26px] tracking-wide ${
          dark ? "text-[#111]" : "text-white"
        }`}
        style={{ fontFamily: '"Inter", "Segoe UI", sans-serif' }}
      >
        fizzy
      </span>

      {/* Inline style for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(-2px); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default FizzyLogo;
