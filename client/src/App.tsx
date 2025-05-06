import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import SellerDashboard from "@/pages/seller/dashboard";
import BookListingsPage from "@/pages/seller/book-listings";
import AddBookPage from "@/pages/seller/add-book";
import EditBookPage from "@/pages/seller/edit-book";
import BrowseBooksPage from "@/pages/buyer/browse";
import BookDetailsPage from "@/pages/book-details";
import PurchasesPage from "@/pages/buyer/purchases";
import FavoritesPage from "@/pages/buyer/favorites";
import ProfilePage from "@/pages/profile";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/book/:id" component={BookDetailsPage} />
      
      {/* Protected seller routes */}
      <ProtectedRoute path="/seller/dashboard" component={SellerDashboard} />
      <ProtectedRoute path="/seller/book-listings" component={BookListingsPage} />
      <ProtectedRoute path="/seller/add-book" component={AddBookPage} />
      <ProtectedRoute path="/seller/edit-book/:id" component={EditBookPage} />
      
      {/* Protected buyer routes */}
      <ProtectedRoute path="/buyer/browse" component={BrowseBooksPage} />
      <ProtectedRoute path="/buyer/purchases" component={PurchasesPage} />
      <ProtectedRoute path="/buyer/favorites" component={FavoritesPage} />
      
      {/* Common protected routes */}
      <ProtectedRoute path="/profile" component={ProfilePage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
