import { z } from "zod";

export const departmentSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const jobTitleSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const employeeSchema = z.object({
  id: z.number(),
  employeeId: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  departmentId: z.number(),
  jobTitleId: z.number(),
  createdAt: z.string().optional(),
  department: departmentSchema.optional(),
  jobTitle: jobTitleSchema.optional(),
});

export const insertEmployeeSchema = z.object({
  employeeId: z.string().optional(),
  fullName: z.string().min(1),
  email: z.string().email(),
  departmentId: z.number(),
  jobTitleId: z.number(),
});

export const attendanceSchema = z.object({
  id: z.number(),
  employeeId: z.number(),
  date: z.string(),
  present: z.boolean(),
});

export const insertAttendanceSchema = z.object({
  employeeId: z.number(),
  date: z.string(),
  present: z.boolean(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type Attendance = z.infer<typeof attendanceSchema>;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Department = z.infer<typeof departmentSchema>;
export type JobTitle = z.infer<typeof jobTitleSchema>;
