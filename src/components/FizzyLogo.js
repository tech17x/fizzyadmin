import React from "react";

const FizzyLogo = ({ style = null }) => {
  return (
    <>
      <style>{`
        .logo-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo {
          display: flex;
          align-items: center;
          font-family: "Inter", "Segoe UI", sans-serif;
          font-weight: 700;
          font-size: 26px;
          gap: 10px;
        }

        /* Fizzy text */
        .brand {
          letter-spacing: 1.5px;
          color: var(--text-primary);
          transition: color 0.3s ease;
        }

        /* Accent "Admin" */
        .brand .accent {
          color: var(--text-accent);
          margin-left: 6px;
          font-weight: 600;
          transition: color 0.3s ease, text-shadow 0.3s ease;
        }

        /* Dot */
        .dot {
          width: 12px;
          height: 12px;
          background-color: var(--brand-dot, #df6229);
          border-radius: 50%;
          animation: bubble 1.6s infinite ease-in-out;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
        }

        /* Dark mode overrides */
        [data-theme="dark"] .brand {
          color: #ffffff;
        }

        [data-theme="dark"] .brand .accent {
          color: #f97316; /* same as dot */
        }

        [data-theme="dark"] .dot {
          background-color: #f97316; /* glowing orange */
          box-shadow: 0 0 8px rgba(249, 115, 22, 0.7);
        }

        /* Bubble animation */
        @keyframes bubble {
          0%, 100% {
            transform: translateY(0px);
            opacity: 1;
          }
          50% {
            transform: translateY(-6px);
            opacity: 0.8;
          }
        }
      `}</style>

      <div className="logo-wrapper" style={style}>
        <div className="logo">
          <span className="dot"></span>
          <span className="brand">
            fizzy<span className="accent">admin</span>
          </span>
        </div>
      </div>
    </>
  );
};

export default FizzyLogo;
