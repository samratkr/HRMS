import { z } from "zod";
import {
  insertEmployeeSchema,
  insertAttendanceSchema,
  employeeSchema,
  attendanceSchema,
  departmentSchema,
  jobTitleSchema,
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  conflict: z.object({
    message: z.string(),
  }),
};

export const api = {
  departments: {
    list: {
      method: "GET" as const,
      path: "/api/departments" as const,
      responses: { 200: z.array(departmentSchema) },
    },
  },

  jobTitles: {
    list: {
      method: "GET" as const,
      path: "/api/job-titles" as const,
      responses: { 200: z.array(jobTitleSchema) },
    },
  },

  employees: {
    list: {
      method: "GET" as const,
      path: "/api/employees" as const,
      responses: {
        200: z.array(employeeSchema),
      },
    },

    get: {
      method: "GET" as const,
      path: "/api/employees/:id" as const,
      responses: {
        200: employeeSchema,
        404: errorSchemas.notFound,
      },
    },

    create: {
      method: "POST" as const,
      path: "/api/employees" as const,
      input: insertEmployeeSchema,
      responses: {
        201: employeeSchema,
        400: errorSchemas.validation,
        409: errorSchemas.conflict,
      },
    },

    update: {
      method: "PUT" as const,
      path: "/api/employees/:id" as const,
      input: insertEmployeeSchema,
      responses: {
        200: employeeSchema,
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        409: errorSchemas.conflict,
      },
    },

    delete: {
      method: "DELETE" as const,
      path: "/api/employees/:id" as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  attendance: {
    list: {
      method: "GET" as const,
      path: "/api/attendance" as const,
      input: z
        .object({
          employeeId: z.coerce.number().optional(),
          date: z.string().optional(),
        })
        .optional(),
      responses: {
        200: z.array(attendanceSchema),
      },
    },

    mark: {
      method: "POST" as const,
      path: "/api/attendance" as const,
      input: insertAttendanceSchema,
      responses: {
        200: attendanceSchema,
        201: attendanceSchema,
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(
  path: string,
  params?: Record<string, string | number | undefined>,
): string {
  let url = path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
        delete params[key];
      }
    });

    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [
        string,
        string,
      ][],
    ).toString();

    if (query) url += `?${query}`;
  }

  return url;
}
