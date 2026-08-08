"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Activity,
  Bell,
  FileStack,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Plus,
  User,
  Users,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/requests", label: "Requests", icon: FileText },
  { href: "/templates", label: "Templates", icon: FileStack },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/profile", label: "Profile", icon: User },
];

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/dashboard" tone="sans" />
      </div>

      <div className="px-3 pb-4">
        <Link
          href="/requests/new"
          onClick={onNavigate}
          className={cn(buttonVariants(), "w-full justify-center")}
        >
          <Plus className="size-4" />
          New request
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 pb-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Workspace
        </p>
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-2.5 rounded-[calc(var(--radius)-2px)] px-3 py-2 text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {active ? (
                <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-primary" />
              ) : null}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border px-3 py-4">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={() => {
            onNavigate?.();
            void signOut({ callbackUrl: "/login" });
          }}
        >
          <LogOut data-icon="inline-start" />
          Log out
        </Button>
      </div>
    </div>
  );
}

export function AppSidebar({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 border-r border-border bg-sidebar lg:block">
        <NavContent />
      </aside>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[280px] p-0" showCloseButton>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <NavContent onNavigate={() => onOpenChange?.(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
