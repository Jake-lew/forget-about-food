"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", emoji: "🏠" },
  { href: "/meal-plan", label: "Meal Plan", emoji: "📅" },
  { href: "/shopping-list", label: "Shopping List", emoji: "🛒" },
  { href: "/pantry", label: "Pantry", emoji: "🫙" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FFFDF9]/95 backdrop-blur-sm border-b border-[#F0E4D7] shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-[#D96B3D] flex items-center justify-center shadow-sm group-hover:shadow-warm transition-shadow">
            <span className="text-lg">🍽️</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-[#3C271A] font-serif text-lg leading-none">
              Forget About
            </span>
            <span className="block text-xs text-[#D96B3D] font-medium leading-none">
              Food
            </span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-[#FAE5DB] text-[#9E4226]"
                  : "text-[#72492C] hover:bg-[#FAF0DE] hover:text-[#3C271A]"
              )}
            >
              <span>{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className={cn(
              "p-2 rounded-xl transition-all duration-150 text-[#72492C]",
              pathname === "/settings"
                ? "bg-[#FAE5DB] text-[#9E4226]"
                : "hover:bg-[#FAF0DE]"
            )}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          <button
            onClick={handleSignOut}
            className="px-3 py-2 rounded-xl text-sm font-medium text-[#72492C] hover:bg-[#FAE5DB] hover:text-[#9E4226] transition-all duration-150"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFDF9]/95 backdrop-blur-sm border-t border-[#F0E4D7] px-4 pb-safe">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all",
                  active ? "text-[#D96B3D]" : "text-[#AD7B54]"
                )}
              >
                <span className="text-xl">{item.emoji}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {active && (
                  <div className="w-1 h-1 rounded-full bg-[#D96B3D]" />
                )}
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all",
              pathname === "/settings" ? "text-[#D96B3D]" : "text-[#AD7B54]"
            )}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-xs font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
