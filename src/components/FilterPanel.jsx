import React, { useState } from "react";
import { Search } from "lucide-react";
import dayjs from "dayjs";

/**
 * Fizzy Admin — Reusable Filter Panel
 * 
 * Props:
 * - title: string
 * - subtitle: string
 * - brands: array
 * - outlets: array
 * - filteredOutlets: array
 * - selectedBrand, setSelectedBrand
 * - selectedOutlet, setSelectedOutlet
 * - dateRange, setDateRange ([start, end])
 * - quickRanges: array
 * - searchTerm, setSearchTerm
 */
const FilterPanel = ({
  title = "Filters & Search",
  subtitle = "Refine your data with smart filters and quick date ranges",
  brands = [],
  outlets = [],
  filteredOutlets = [],
  selectedBrand,
  setSelectedBrand,
  selectedOutlet,
  setSelectedOutlet,
  dateRange,
  setDateRange,
  quickRanges,
  searchTerm,
  setSearchTerm,
}) => {
  const [showQuickRanges, setShowQuickRanges] = useState(true);

  return (
    <div className="relative rounded-3xl p-10 mb-12 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
      {/* Soft Glows */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-blue-500/15 rounded-full blur-[100px]" />

      {/* Header */}
      <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            {title}
          </h2>
          <p className="text-slate-400 text-base">{subtitle}</p>
        </div>

        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search staff, orders, payroll..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3.5 pl-12 bg-slate-800/60 text-slate-100 rounded-xl border border-slate-700/50
               shadow-inner backdrop-blur-sm focus:border-emerald-500/50
               focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-800/80
               placeholder:text-slate-500 transition-all duration-200 outline-none text-base"
          />
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-4" />
        </div>
      </div>

      {/* Quick Ranges */}
      {showQuickRanges && (
        <>
          <p className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider relative">
            Quick Date Ranges
          </p>
          <div className="flex flex-wrap gap-3 mb-12 relative">
            {quickRanges.map((q) => (
              <button
                key={q.label}
                onClick={() => setDateRange(q.range)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800/60
                   text-slate-300 border border-slate-700/50 hover:bg-emerald-500/20
                   hover:text-emerald-300 hover:border-emerald-500/50
                   focus:ring-2 focus:ring-emerald-500/30 focus:outline-none
                   transition-all duration-200 shadow-sm backdrop-blur-sm"
              >
                {q.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Filter Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-100 relative">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange[0].format("YYYY-MM-DD")}
            onChange={(e) =>
              setDateRange([dayjs(e.target.value), dateRange[1]])
            }
            className="w-full px-4 py-3 rounded-xl text-base bg-slate-800/60 text-slate-100 border border-slate-700/50
               focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-800/80
               outline-none transition-all duration-200 backdrop-blur-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
            End Date
          </label>
          <input
            type="date"
            value={dateRange[1].format("YYYY-MM-DD")}
            onChange={(e) =>
              setDateRange([dateRange[0], dayjs(e.target.value)])
            }
            className="w-full px-4 py-3 rounded-xl text-base bg-slate-800/60 text-slate-100 border border-slate-700/50
               focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:bg-slate-800/80
               outline-none transition-all duration-200 backdrop-blur-sm"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
            Brand
          </label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-base bg-slate-800/60 text-slate-100 border border-slate-700/50
               focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 backdrop-blur-sm"
          >
            <option value="" className="text-slate-400 bg-slate-800">
              Select Brand
            </option>
            {brands.map((b) => (
              <option
                key={b._id}
                value={b._id}
                className="bg-slate-800 text-slate-100"
              >
                {b.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* Outlet */}
        <div>
          <label className="block text-sm font-bold text-slate-300 mb-3 tracking-wide">
            Outlet
          </label>
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-base bg-slate-800/60 text-slate-100 border border-slate-700/50
               focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-200 backdrop-blur-sm"
          >
            <option value="" className="text-slate-400 bg-slate-800">
              Select Outlet
            </option>
            {filteredOutlets.map((o) => (
              <option
                key={o._id}
                value={o._id}
                className="bg-slate-800 text-slate-100"
              >
                {o.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date and Context Info */}
      <p className="text-sm text-slate-400 mt-10 relative">
        Showing data from{" "}
        <span className="text-slate-200 font-semibold">
          {dateRange[0].format("DD MMM YYYY")}
        </span>{" "}
        to{" "}
        <span className="text-slate-200 font-semibold">
          {dateRange[1].format("DD MMM YYYY")}
        </span>
        {selectedBrand && (
          <>
            {" "}•{" "}
            <span className="text-slate-200 font-semibold">
              {brands.find((b) => b._id === selectedBrand)?.full_name}
            </span>
          </>
        )}
        {selectedOutlet && (
          <>
            {" "}•{" "}
            <span className="text-slate-200 font-semibold">
              {filteredOutlets.find((o) => o._id === selectedOutlet)?.name}
            </span>
          </>
        )}
      </p>
    </div>
  );
};

export default FilterPanel;
