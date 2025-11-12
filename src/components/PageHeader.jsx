import React, { useState } from "react";
import { FileDown, Printer } from "lucide-react";

/**
 * Fizzy Admin — Reusable Page Header
 * 
 * Props:
 * - title: string
 * - description: string
 * - exportOptions: array of { label, value, icon (optional) }
 * - onExport: function(optionValue)
 * - gradientFrom, gradientTo: for custom brand gradients (default emerald theme)
 */

const PageHeader = ({
  title = "Page Title",
  description = "A brief description about this page’s purpose and insights.",
  exportOptions = [],
  onExport,
  gradientFrom = "emerald-600",
  gradientTo = "emerald-500",
}) => {
  const [open, setOpen] = useState(false);

  const handleExport = (value) => {
    setOpen(false);
    if (onExport) onExport(value);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12 relative">
      {/* Title + Description */}
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-slate-600 text-lg leading-relaxed">
          {description}
        </p>
      </div>

      {/* Export Button */}
      {exportOptions.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className={`flex items-center gap-2.5 bg-gradient-to-r from-${gradientFrom} to-${gradientTo} text-white px-6 py-3 rounded-xl shadow-lg shadow-${gradientTo}/25 hover:shadow-xl hover:shadow-${gradientTo}/30 hover:from-${gradientFrom} hover:to-${gradientTo} transition-all duration-200 font-medium`}
            >
              <FileDown size={18} />
              Export Reports
            </button>

            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-2xl z-20 overflow-hidden">
                {exportOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleExport(opt.value)}
                    className={`w-full text-left px-5 py-3 text-slate-700 font-medium transition-colors ${
                      i > 0 ? "border-t border-slate-100" : ""
                    } hover:bg-emerald-50`}
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon ? opt.icon : null}
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Overlay Click Outside */}
          {open && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
