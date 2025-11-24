// components/FinanceChart.tsx
"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";

const data = [
  { name: "Jan", income: 4200, expense: 2800 },
  { name: "Feb", income: 3800, expense: 3200 },
  { name: "Mar", income: 5100, expense: 2900 },
  { name: "Apr", income: 4800, expense: 3100 },
  { name: "May", income: 4500, expense: 3400 },
  { name: "Jun", income: 5200, expense: 3600 },
  { name: "Jul", income: 4900, expense: 3300 },
  { name: "Aug", income: 5300, expense: 3500 },
  { name: "Sep", income: 5600, expense: 3700 },
  { name: "Oct", income: 5800, expense: 3900 },
  { name: "Nov", income: 6100, expense: 4100 },
  { name: "Dec", income: 6500, expense: 4300 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Income:{" "}
            <span className="font-semibold text-blue-600">
              ${payload[0].value}
            </span>
          </p>
          <p className="text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Expense:{" "}
            <span className="font-semibold text-green-600">
              ${payload[1].value}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const FinanceChart = () => {
  const totalIncome = data.reduce((sum, month) => sum + month.income, 0);
  const totalExpense = data.reduce((sum, month) => sum + month.expense, 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Financial Overview
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-emerald-600">
                <TrendingUp className="h-4 w-4" />
                <span className="font-semibold">
                  ${netProfit.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500">Net Profit</p>
            </div>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2 }}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinanceChart;
