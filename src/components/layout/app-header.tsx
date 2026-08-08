"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, Search, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [search, setSearch] = useState("");

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/clients?search=${encodeURIComponent(q)}` : "/clients");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md supports-backdrop-filter:bg-card/80 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <form onSubmit={handleSearch} className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients by name, email, phone..."
          className="h-10 bg-background pl-9 shadow-none"
        />
      </form>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-10 gap-2 border-border bg-card px-2.5 shadow-soft"
            )}
          >
            <Avatar className="size-7">
              <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[140px] truncate text-[13px] font-medium text-foreground sm:inline">
              {session?.user?.name || "Account"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-ink">
                  {session?.user?.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {session?.user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              style={{ cursor: "pointer" }}
              onClick={() => router.push("/profile")}
            >
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              style={{ cursor: "pointer" }}
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
       
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
