import { useEmployees } from "@/hooks/use-employees";
import { useAttendance } from "@/hooks/use-attendance";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  CalendarCheck,
} from "lucide-react";
import { startOfDay } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function Dashboard() {
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const today = startOfDay(new Date());
  const { data: attendance, isLoading: loadingAttendance } =
    useAttendance(today);

  const totalEmployees = employees?.length || 0;

  const presentCount = attendance?.filter((a) => a.present).length || 0;

  const markedAbsentCount = attendance?.filter((a) => !a.present).length || 0;

  const recordedIds = new Set(attendance?.map((a) => a.employeeId));
  const unmarkedCount =
    employees?.filter((e) => !recordedIds.has(e.id)).length || 0;

  const attendanceRate =
    totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  const chartData = [
    { name: "Present", value: presentCount, color: "#059669" },
    { name: "Absent", value: markedAbsentCount, color: "#ef4444" },
    { name: "Unmarked", value: unmarkedCount, color: "#e2e8f0" },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your organization for today.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={totalEmployees}
            icon={Users}
            loading={loadingEmployees}
            description="Active staff members"
          />
          <StatCard
            title="Present Today"
            value={presentCount}
            icon={UserCheck}
            loading={loadingAttendance}
            description="Checked in on time"
            className="bg-green-50/50 border-green-100"
          />
          <StatCard
            title="Absent Today"
            value={markedAbsentCount}
            icon={UserX}
            loading={loadingAttendance}
            description="On leave or sick"
            className="bg-red-50/50 border-red-100"
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={TrendingUp}
            loading={loadingAttendance || loadingEmployees}
            description="Daily participation"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold mb-4">Attendance Overview</h3>
            <div className="h-[300px] w-full">
              {loadingEmployees || loadingAttendance ? (
                <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-lg">
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6 bg-gradient-to-br from-primary to-primary text-white">
            <h3 className="font-semibold mb-4 text-white">Quick Actions</h3>
            <div className="space-y-4">
              <p className="text-white/70 text-sm">
                Manage your workforce efficiently. Navigate to specific sections
                to handle daily operations.
              </p>
              <div className="grid grid-cols-1 gap-3">
                <a href="/employees" className="block w-full">
                  <div className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer border border-white/10 flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Add New Employee
                    </span>
                    <Users className="w-4 h-4 opacity-70" />
                  </div>
                </a>
                <a href="/attendance" className="block w-full">
                  <div className="p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer border border-white/10 flex items-center justify-between">
                    <span className="font-medium text-sm">
                      Mark Today's Attendance
                    </span>
                    <CalendarCheck className="w-4 h-4 opacity-70" />
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
