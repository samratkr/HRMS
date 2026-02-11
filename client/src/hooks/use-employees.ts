import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import type { InsertEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useEmployees() {
  return useQuery({
    queryKey: [api.employees.list.path],
    queryFn: async () => {
      const res = await fetch(api.employees.list.path);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return api.employees.list.responses[200].parse(await res.json());
    },
  });
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: [api.employees.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.employees.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch employee");
      return api.employees.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertEmployee) => {
      const validated = api.employees.create.input.parse(data);
      const res = await fetch(api.employees.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.employees.create.responses[400].parse(
            await res.json(),
          );
          throw new Error(error.message);
        }
        if (res.status === 409) {
          const error = api.employees.create.responses[409].parse(
            await res.json(),
          );
          throw new Error(error.message);
        }
        throw new Error("Failed to create employee");
      }
      return api.employees.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
      toast({
        variant: "success",
        title: "Success",
        description: "Employee created successfully.",
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

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.employees.delete.path, { id });
      const res = await fetch(url, { method: "DELETE" });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Employee not found");
        throw new Error("Failed to delete employee");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
      toast({
        variant: "success",
        title: "Success",
        description: "Employee deleted successfully.",
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

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertEmployee & { id: number }) => {
      const { id, ...payload } = data;
      const validated = api.employees.update.input.parse(payload);
      const url = buildUrl(api.employees.update.path, { id });

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Employee not found");
        if (res.status === 400) {
          const error = api.employees.update.responses[400].parse(
            await res.json(),
          );
          throw new Error(error.message);
        }
        throw new Error("Failed to update employee");
      }

      return api.employees.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.employees.list.path] });
      toast({
        variant: "success",
        title: "Success",
        description: "Employee updated successfully.",
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

export function useDepartments() {
  return useQuery({
    queryKey: [api.departments.list.path],
    queryFn: async () => {
      const res = await fetch(api.departments.list.path);
      if (!res.ok) throw new Error("Failed to fetch departments");
      return res.json();
    },
  });
}

export function useJobTitles() {
  return useQuery({
    queryKey: [api.jobTitles.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobTitles.list.path);
      if (!res.ok) throw new Error("Failed to fetch job titles");
      return res.json();
    },
  });
}
