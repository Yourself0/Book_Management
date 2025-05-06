import React from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Book, Bell } from "lucide-react";
import { UserDropdown } from "./user-dropdown";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";

type NavbarProps = {
  setSidebarOpen: (open: boolean) => void;
};

export const Navbar: React.FC<NavbarProps> = ({ setSidebarOpen }) => {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Logo & Mobile Menu */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-600 hover:text-primary-600 lg:hidden mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center">
              <Book className="h-6 w-6 text-primary-600 mr-2" />
              <span className="text-xl font-semibold text-slate-800">BookMarket</span>
            </Link>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center space-x-3">
            {/* User type indicator when logged in */}
            {user && (
              <span className="hidden md:flex items-center px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                {user.userType === "seller" ? "Seller Dashboard" : "Buyer View"}
              </span>
            )}

            {/* Notifications - only when logged in */}
            {user && (
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </Button>
            )}

            {/* User Menu */}
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
