import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";

type InsertAttendance = z.infer<typeof api.attendance.mark.input>;

export function useAttendance(date?: Date) {
  const dateStr = date ? date.toISOString() : undefined;

  return useQuery({
    queryKey: [api.attendance.list.path, dateStr],
    queryFn: async () => {
      const url = new URL(api.attendance.list.path, window.location.origin);
      if (dateStr) {
        url.searchParams.append("date", dateStr);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAttendance) => {
      const validated = api.attendance.mark.input.parse(data);
      const res = await fetch(api.attendance.mark.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.attendance.mark.responses[400].parse(
            await res.json(),
          );
          throw new Error(error.message);
        }
        throw new Error("Failed to mark attendance");
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      toast({
        variant: "success",
        title: "Success",
        description: `Attendance marked for ${format(new Date(variables.date), "MMM dd, yyyy")}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
