// components/CountChart.tsx
"use client";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Users } from "lucide-react";

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      count: boys + girls,
      fill: "#f0f0f0",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#ec4899",
    },
    {
      name: "Boys",
      count: boys,
      fill: "#3b82f6",
    },
  ];

  return (
    <div className="relative w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="90%"
          barSize={16}
          data={data}
        >
          <RadialBar background dataKey="count" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <span className="text-2xl font-bold text-gray-800">{boys + girls}</span>
        <p className="text-xs text-gray-600">Total</p>
      </div>
    </div>
  );
};

export default CountChart;
