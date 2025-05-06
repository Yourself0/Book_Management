import React from "react";
import { Link, useLocation } from "wouter";
import { X, Book, LayoutDashboard, BookOpen, Plus, ShoppingCart, Heart, User, HelpCircle, Settings, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./button";

type SidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [location] = useLocation();
  const { user } = useAuth();

  const isSeller = user?.userType === "seller";
  const isBuyer = user?.userType === "buyer";

  const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => {
    const isActive = location === href;
    
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start",
            isActive && "bg-primary-100 text-primary-700 hover:bg-primary-100 hover:text-primary-700"
          )}
          onClick={() => setSidebarOpen(false)}
        >
          {React.cloneElement(icon as React.ReactElement, { 
            className: cn("mr-2 h-5 w-5", isActive ? "text-primary-600" : "text-slate-500")
          })}
          {children}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 transform transition-opacity duration-300 lg:z-0 lg:opacity-100 lg:static lg:translate-x-0",
        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none -translate-x-full",
      )}
    >
      <div className="flex h-full">
        <div className="relative flex flex-col flex-1 min-h-0 max-w-xs w-full pt-5 pb-4 bg-white border-r border-slate-200">
          {/* Close button - mobile only */}
          <div className="absolute top-0 right-0 p-2 lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo */}
          <div className="flex items-center px-4">
            <Book className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-xl font-semibold text-slate-800">BookMarket</span>
          </div>

          {/* Navigation */}
          <div className="mt-6 h-0 flex-1 flex flex-col overflow-y-auto">
            {/* Seller Navigation */}
            {isSeller && (
              <nav className="px-2 space-y-1">
                <NavLink href="/seller/dashboard" icon={<LayoutDashboard />}>
                  Dashboard
                </NavLink>
                <NavLink href="/seller/book-listings" icon={<BookOpen />}>
                  Book Listings
                </NavLink>
                <NavLink href="/seller/add-book" icon={<Plus />}>
                  Add New Book
                </NavLink>
              </nav>
            )}

            {/* Buyer Navigation */}
            {isBuyer && (
              <nav className="px-2 space-y-1">
                <NavLink href="/buyer/browse" icon={<BookOpen />}>
                  Browse Books
                </NavLink>
                <NavLink href="/buyer/purchases" icon={<ShoppingCart />}>
                  My Purchases
                </NavLink>
                <NavLink href="/buyer/favorites" icon={<Heart />}>
                  Favorites
                </NavLink>
              </nav>
            )}

            {/* Non-logged in Navigation */}
            {!user && (
              <nav className="px-2 space-y-1">
                <NavLink href="/auth" icon={<User />}>
                  Login / Register
                </NavLink>
              </nav>
            )}

            {/* Quick Links */}
            <div className="mt-auto px-4 py-4 border-t border-slate-200">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Links
              </h3>
              <div className="mt-2 flex items-center space-x-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <HelpCircle className="h-5 w-5 text-slate-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Settings className="h-5 w-5 text-slate-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Mail className="h-5 w-5 text-slate-600" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
