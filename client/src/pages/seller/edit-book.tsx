import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBookById, updateBook } from "@/lib/book-service";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { BookForm, BookFormValues } from "@/components/seller/book-form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function EditBookPage() {
  const { id: bookIdParam } = useParams();
  const bookId = parseInt(bookIdParam || "0", 10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    data: book,
    isLoading,
    error,
  } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
    queryFn: () => fetchBookById(bookId),
    enabled: !!bookId,
  });

  // Check if the book belongs to the authenticated seller
  useEffect(() => {
    if (book && user && book.sellerId !== user.id) {
      toast({
        title: "Access denied",
        description: "You can only edit your own books",
        variant: "destructive",
      });
      navigate("/seller/book-listings");
    }
  }, [book, user, navigate, toast]);

  const updateMutation = useMutation({
    mutationFn: ({ data, imageFile }: { data: BookFormValues; imageFile: File | null }) => {
      return updateBook(bookId, data, imageFile);
    },
    onSuccess: () => {
      toast({
        title: "Book updated",
        description: "Your book has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/books/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/seller/books"] });
      navigate("/seller/book-listings");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: BookFormValues, imageFile: File | null) => {
    updateMutation.mutate({ data, imageFile });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error loading book details</p>
        <Button onClick={() => navigate("/seller/book-listings")}>
          Back to Book Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate("/seller/book-listings")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Book Listings
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">Edit Book</h1>
            <p className="mt-1 text-slate-600">
              Update the details for "{book.title}"
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <BookForm
              book={book}
              onSubmit={handleSubmit}
              isLoading={updateMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
