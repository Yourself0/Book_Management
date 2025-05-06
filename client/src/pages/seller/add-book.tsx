import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBook } from "@/lib/book-service";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { BookForm, BookFormValues } from "@/components/seller/book-form";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddBookPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: ({ data, imageFile }: { data: BookFormValues; imageFile: File | null }) => {
      return createBook(data, imageFile);
    },
    onSuccess: () => {
      toast({
        title: "Book created",
        description: "Your book has been successfully added to your listings.",
      });
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
    createMutation.mutate({ data, imageFile });
  };

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
            <h1 className="text-3xl font-bold text-slate-900">Add New Book</h1>
            <p className="mt-1 text-slate-600">
              Create a new book listing to sell on the marketplace
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <BookForm
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
