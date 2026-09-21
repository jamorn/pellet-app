"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Sun, Moon, LogIn, LogOut, User } from "lucide-react";

export default function Navbar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            IRPC TIS System
          </span>
          <nav className="flex space-x-2">
            <button
              onClick={() => setActiveTab("view")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === "view"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              Data View
            </button>
            {session && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === "admin"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Admin CRUD
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {session ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-1 text-sm bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 dark:text-rose-400 px-3 py-1.5 rounded-lg transition"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="flex items-center space-x-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg shadow-sm font-medium transition"
            >
              <LogIn size={16} />
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
