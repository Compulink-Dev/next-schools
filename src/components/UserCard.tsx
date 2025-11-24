// components/UserCard.tsx
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const config = {
    admin: {
      gradient: "from-purple-500 to-purple-600",
      light: "bg-purple-50",
      icon: "👨‍💼",
      trend: "+12%",
    },
    teacher: {
      gradient: "from-blue-500 to-blue-600",
      light: "bg-blue-50",
      icon: "👩‍🏫",
      trend: "+8%",
    },
    student: {
      gradient: "from-green-500 to-green-600",
      light: "bg-green-50",
      icon: "🎓",
      trend: "+15%",
    },
    parent: {
      gradient: "from-orange-500 to-orange-600",
      light: "bg-orange-50",
      icon: "👨‍👩‍👧‍👦",
      trend: "+5%",
    },
  };

  try {
    const data = await modelMap[type].count();
    const currentConfig = config[type];

    return (
      <Card className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-0">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-90",
            currentConfig.gradient
          )}
        />

        <CardHeader className="relative z-10 p-4 pb-2">
          <div className="flex justify-between items-start">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-0 text-xs"
            >
              2025/26
            </Badge>
            <div className="text-2xl opacity-80">{currentConfig.icon}</div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-end justify-between">
              <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                {data.toLocaleString()}
              </h1>
              <span className="text-xs text-white/80 bg-white/20 px-2 py-1 rounded-full">
                {currentConfig.trend}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-white/90 capitalize tracking-wide">
              {type}s
            </h2>
          </div>
        </CardContent>

        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute -right-4 -top-4 w-8 h-8 bg-white/10 rounded-full"></div>
          <div className="absolute -right-2 -bottom-2 w-4 h-4 bg-white/10 rounded-full"></div>
        </div>
      </Card>
    );
  } catch (error) {
    console.error(`Error counting ${type}:`, error);
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-gray-400 to-gray-500">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">0</h1>
            <h2 className="text-sm font-semibold text-white/90 capitalize">
              {type}s
            </h2>
          </div>
        </CardContent>
      </Card>
    );
  }
};

export default UserCard;
