// components/CountChartContainer.tsx
import CountChart from "./CountChart";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const CountChartContainer = async () => {
  const data = await prisma.student.groupBy({
    by: ["sex"],
    _count: true,
  });

  const boys = data.find((d) => d.sex === "MALE")?._count || 0;
  const girls = data.find((d) => d.sex === "FEMALE")?._count || 0;
  const total = boys + girls;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            Student Distribution
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        <CountChart boys={boys} girls={girls} />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2 text-center p-3 rounded-xl bg-blue-50/50">
            <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto"></div>
            <h3 className="font-bold text-lg text-blue-900">{boys}</h3>
            <p className="text-xs text-blue-700">
              Boys ({Math.round((boys / total) * 100)}%)
            </p>
          </div>
          <div className="space-y-2 text-center p-3 rounded-xl bg-pink-50/50">
            <div className="w-3 h-3 bg-pink-500 rounded-full mx-auto"></div>
            <h3 className="font-bold text-lg text-pink-900">{girls}</h3>
            <p className="text-xs text-pink-700">
              Girls ({Math.round((girls / total) * 100)}%)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountChartContainer;
