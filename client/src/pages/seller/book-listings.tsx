import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { fetchSellerBooks, deleteBook } from "@/lib/book-service";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { BookListItem } from "@/components/seller/book-list-item";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Search, Loader2 } from "lucide-react";

export default function BookListingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const {
    data: books = [],
    isLoading,
    error,
  } = useQuery<Book[]>({
    queryKey: ["/api/seller/books"],
    queryFn: fetchSellerBooks,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => {
      toast({
        title: "Book deleted",
        description: "The book has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/books"] });
      setBookToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (book: Book) => {
    navigate(`/seller/edit-book/${book.id}`);
  };

  const handleDelete = (book: Book) => {
    setBookToDelete(book);
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete.id);
    }
  };

  // Filter books based on search and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch = searchTerm
      ? book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = categoryFilter && categoryFilter !== "all"
      ? book.category === categoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(books.map((book) => book.category))).sort();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Book Listings</h1>
              <p className="mt-1 text-slate-600">
                Manage your book inventory and listings
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <a href="/seller/add-book">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Book
                </a>
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
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
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
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

          {/* Books table */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-red-500">Error loading books</p>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/seller/books"] })}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-lg font-medium text-slate-900 mb-4">No books found</p>
              <p className="text-slate-600 mb-6">
                {searchTerm || categoryFilter
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't added any books yet. Get started by adding your first book!"}
              </p>
              {!searchTerm && !categoryFilter && (
                <Button asChild>
                  <a href="/seller/add-book">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Book
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableCaption>A list of your books</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBooks.map((book) => (
                    <BookListItem
                      key={book.id}
                      book={book}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the book{" "}
              <span className="font-semibold">{bookToDelete?.title}</span> and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
