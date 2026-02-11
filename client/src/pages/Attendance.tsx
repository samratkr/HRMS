import { useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import { useEmployees } from "@/hooks/use-employees";
import { useAttendance, useMarkAttendance } from "@/hooks/use-attendance";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function Attendance() {
  const [date, setDate] = useState<Date>(startOfDay(new Date()));
  const { data: employees, isLoading: loadingEmployees } = useEmployees();
  const { data: attendanceRecords, isLoading: loadingAttendance } =
    useAttendance(date);
  const { mutate: markAttendance } = useMarkAttendance();

  const handleAttendanceChange = (employeeId: number, isPresent: boolean) => {
    markAttendance({
      employeeId,
      date: date.toISOString(),
      present: isPresent,
    });
  };

  const getStatus = (employeeId: number) => {
    const record = attendanceRecords?.find((r) => r.employeeId === employeeId);
    return record ? (record.present ? "Present" : "Absent") : "Not Marked";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-green-100 text-green-700 border-green-200";
      case "Absent":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-primary/5 p-6 rounded-2xl border border-primary/10">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Attendance
            </h1>
            <p className="text-muted-foreground mt-1">
              Track daily presence of your workforce
            </p>
          </div>

          <div className="flex items-center gap-3 bg-background p-1.5 rounded-xl border shadow-sm">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal border-none shadow-none hover:bg-transparent",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(startOfDay(d))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loadingEmployees || loadingAttendance ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 w-full bg-muted animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : (
            employees?.map((employee) => {
              const status = getStatus(employee.id);
              const isPresent = status === "Present";

              return (
                <Card
                  key={employee.id}
                  className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-primary/30 transition-colors border-border/60"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Avatar className="h-10 w-10 border">
                      <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                        {employee.fullName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {employee.fullName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {employee.jobTitle?.name} • {employee.department?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge
                      variant="outline"
                      className={cn(
                        "px-3 py-1 text-xs font-semibold",
                        getStatusColor(status),
                      )}
                    >
                      {status}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          !isPresent ? "text-red-600" : "text-muted-foreground",
                        )}
                      >
                        Absent
                      </span>
                      <Switch
                        checked={isPresent}
                        onCheckedChange={(checked) =>
                          handleAttendanceChange(employee.id, checked)
                        }
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-500"
                      />
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isPresent
                            ? "text-green-600"
                            : "text-muted-foreground",
                        )}
                      >
                        Present
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}

          {!loadingEmployees && employees?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No employees found. Add employees to start tracking attendance.
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
