import React from 'react';

const SalesChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxSales = Math.max(...data.map(d => d.total));

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
      <svg viewBox="0 0 100 60" className="w-full h-48">
        {data.map((item, index) => {
          const barHeight = (item.total / maxSales) * 45;
          const x = index * (100 / data.length) + 5;
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={60 - barHeight}
                width="10"
                height={barHeight}
                fill="#3b82f6"
              />
              {/* Label */}
              <text
                x={x + 5}
                y="59"
                fontSize="3"
                textAnchor="middle"
                fill="#6b7280"
              >
                {item.label.slice(0, 3)}
              </text>
              {/* Value Tooltip (optional) */}
              <title>{`$${item.total.toFixed(2)}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SalesChart;
