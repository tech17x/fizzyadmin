// src/hooks/useTheme.js
import { useEffect, useState } from "react";

export const useTheme = () => {
  const [theme, setTheme] = useState(
    typeof window !== "undefined" ? (localStorage.getItem("theme") || "light") : "light"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return { theme, toggleTheme, setTheme };
};
