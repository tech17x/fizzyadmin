import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const AdminLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fizzy-layout">
      <Header
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="fizzy-main-content">
        <Outlet />
      </main>
      

       {/* Footer */}
      <footer className="py-14 text-center text-sm text-[#777] border-t border-[#eee] tracking-wide">
        © {new Date().getFullYear()} Fizzy Admin — Crafted with Simplicity & Precision.
      </footer>

    </div>
  );
};

export default AdminLayout;
