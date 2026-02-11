import { Link, useLocation } from "wouter";
import {
  Users,
  CalendarCheck,
  LayoutDashboard,
  BriefcaseBusiness,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
];

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <BriefcaseBusiness className="h-6 w-6 text-primary mr-2" />
        <span className="font-display font-bold text-xl tracking-tight">
          HRMS Lite
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  "group flex gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 cursor-pointer items-center",
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                    "h-5 w-5 shrink-0 transition-colors",
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="text-xs font-medium text-muted-foreground">
            Logged in as
          </p>
          <p className="text-sm font-bold text-foreground">Administrator</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-white/50 backdrop-blur-xl">
          <NavContent />
        </div>
      </div>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-md">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-1 lg:pl-72">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
