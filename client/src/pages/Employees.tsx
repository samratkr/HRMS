import { useEffect, useState } from "react";
import SidebarLayout from "@/components/layout/SidebarLayout";
import {
  useEmployees,
  useCreateEmployee,
  useDeleteEmployee,
  useUpdateEmployee,
} from "@/hooks/use-employees";
import {
  Plus,
  Search,
  Trash2,
  Mail,
  Briefcase,
  Building2,
  User,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema, type InsertEmployee } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Department = { id: number; name: string };
type JobTitle = { id: number; name: string };

export default function Employees() {
  const { data: employees, isLoading } = useEmployees();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<
    (InsertEmployee & { id: number }) | null
  >(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data));

    fetch("/api/job-titles")
      .then((res) => res.json())
      .then((data) => setJobTitles(data));
  }, []);

  const filteredEmployees = employees?.filter(
    (emp) =>
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      (emp.department?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SidebarLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Employees
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your team directory
            </p>
          </div>
          <CreateEmployeeDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            departments={departments}
            jobTitles={jobTitles}
          />
        </div>

        <div className="flex items-center py-4 bg-white p-4 rounded-xl border shadow-sm">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <Input
            placeholder="Search by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md border-none shadow-none focus-visible:ring-0 px-0 bg-transparent text-base"
          />
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[300px]">Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="h-6 w-40 bg-muted animate-pulse rounded" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredEmployees?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No employees found. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees?.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                            {employee.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {employee.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {employee.employeeId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {employee.department?.name || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {employee.jobTitle?.name || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {employee.email}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => setEditingEmployee(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteEmployeeAlert
                        id={employee.id}
                        name={employee.fullName}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {editingEmployee && (
          <EditEmployeeDialog
            employee={editingEmployee}
            onClose={() => setEditingEmployee(null)}
            departments={departments}
            jobTitles={jobTitles}
          />
        )}
      </div>
    </SidebarLayout>
  );
}

function CreateEmployeeDialog({
  open,
  onOpenChange,
  departments,
  jobTitles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  jobTitles: JobTitle[];
}) {
  const { mutate, isPending } = useCreateEmployee();

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      fullName: "",
      email: "",
      departmentId: departments[0]?.id || 0,
      jobTitleId: jobTitles[0]?.id || 0,
    },
  });

  useEffect(() => {
    if (departments[0]) form.setValue("departmentId", departments[0].id);
    if (jobTitles[0]) form.setValue("jobTitleId", jobTitles[0].id);
  }, [departments, jobTitles]);

  const onSubmit = (data: InsertEmployee) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-border/80 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details of the new staff member.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg rounded-md">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg rounded-md">
                        {jobTitles.map((j) => (
                          <SelectItem key={j.id} value={j.id.toString()}>
                            {j.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteEmployeeAlert({ id, name }: { id: number; name: string }) {
  const { mutate, isPending } = useDeleteEmployee();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{name}</strong>? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              mutate(id);
            }}
            disabled={isPending}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditEmployeeDialog({
  employee,
  onClose,
  departments,
  jobTitles,
}: {
  employee: InsertEmployee & { id: number };
  onClose: () => void;
  departments: { id: number; name: string }[];
  jobTitles: { id: number; name: string }[];
}) {
  const { mutate, isPending } = useUpdateEmployee();

  const form = useForm<InsertEmployee>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      fullName: employee.fullName,
      email: employee.email,
      departmentId: employee.departmentId || 0,
      jobTitleId: employee.jobTitleId || 0,
      employeeId: employee.employeeId,
    },
  });

  useEffect(() => {
    if (!form.getValues("departmentId") && departments[0]) {
      form.setValue("departmentId", departments[0].id);
    }
    if (!form.getValues("jobTitleId") && jobTitles[0]) {
      form.setValue("jobTitleId", jobTitles[0].id);
    }
  }, [departments, jobTitles, form]);

  const onSubmit = (data: InsertEmployee) => {
    mutate({ ...data, id: employee.id }, { onSuccess: onClose });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border/80 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the details of the employee.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="john@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg rounded-md">
                        {departments.map((d) => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(val) => field.onChange(Number(val))}
                      value={field.value?.toString() || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job title" />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg rounded-md">
                        {jobTitles.map((j) => (
                          <SelectItem key={j.id} value={j.id.toString()}>
                            {j.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
