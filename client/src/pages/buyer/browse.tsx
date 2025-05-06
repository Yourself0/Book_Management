import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { fetchBooks, fetchBooksByCategory } from "@/lib/book-service";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { BookCard } from "@/components/book-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Loader2, RefreshCw } from "lucide-react";

export default function BrowseBooksPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Query for books data
  const {
    data: books = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Book[]>({
    queryKey: [selectedCategory && selectedCategory !== "all" ? `/api/books?category=${selectedCategory}` : "/api/books"],
    queryFn: () => selectedCategory && selectedCategory !== "all" ? fetchBooksByCategory(selectedCategory) : fetchBooks(),
  });

  // Filter books based on search term
  const filteredBooks = books.filter((book) =>
    searchTerm
      ? book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Get unique categories from the books
  const categories = Array.from(new Set(books.map((book) => book.category))).sort();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Browse Books</h1>
              <p className="mt-1 text-slate-600">
                Discover books from sellers around the world
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title or author..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                Error loading books. Please try again.
              </p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-lg text-slate-600">
                {searchTerm || selectedCategory
                  ? "No books match your search criteria"
                  : "No books available at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
