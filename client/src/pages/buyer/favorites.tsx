import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { fetchBooks } from "@/lib/book-service";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, RefreshCw, Heart } from "lucide-react";

// This is a placeholder component - in a real app, you would have a backend API
// to store and fetch user favorites
export default function FavoritesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // This would normally be a separate API endpoint for favorites
  // For now, we're just using the same books endpoint as a placeholder
  const {
    data: books = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Book[]>({
    queryKey: ["/api/books"],
    queryFn: fetchBooks,
  });

  // Filter books based on search term
  const filteredBooks = books.filter((book) =>
    searchTerm
      ? book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // For demo purposes, let's just show a subset of books as "favorites"
  // In a real app, this would come from a database
  const favoriteBooks = filteredBooks.slice(0, Math.min(3, filteredBooks.length));

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>
              <p className="mt-1 text-slate-600">
                Books you've marked as favorites
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search in your favorites..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Books Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-500 mb-4">
                Error loading your favorites. Please try again.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : favoriteBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <Heart className="mx-auto h-16 w-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium text-slate-800 mb-2">No favorite books yet</p>
              <p className="text-slate-600 mb-6">
                Browse books and click the heart icon to add them to your favorites
              </p>
              <Button asChild>
                <a href="/buyer/browse">Browse Books</a>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {favoriteBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}