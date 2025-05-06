import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link as WouterLink } from "wouter";
import { fetchBookById, purchaseBook } from "@/lib/book-service";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Loader2,
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  BookOpen,
  Edit,
} from "lucide-react";

export default function BookDetailsPage() {
  const { id: bookIdParam } = useParams();
  const bookId = parseInt(bookIdParam || "0", 10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: book,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/books/${bookId}`],
    queryFn: () => fetchBookById(bookId),
    enabled: !!bookId,
  });

  const purchaseMutation = useMutation({
    mutationFn: purchaseBook,
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: `You have successfully purchased "${book?.title}"`,
      });
    },
    onError: (error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase books",
        variant: "destructive",
      });
      return;
    }
    
    purchaseMutation.mutate(bookId);
  };

  const isOwner = user && book && user.id === book.sellerId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar setSidebarOpen={setSidebarOpen} />
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-red-500 mb-4">
                Error loading book details. The book may have been removed or is unavailable.
              </p>
              <Button asChild>
                <WouterLink href="/">Go back to homepage</WouterLink>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            className="mb-6"
            asChild
          >
            <WouterLink href={user?.userType === "seller" ? "/seller/book-listings" : "/buyer/browse"}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {user?.userType === "seller" ? "Book Listings" : "Browse"}
            </WouterLink>
          </Button>
          
          {/* Breadcrumbs */}
          <nav className="mb-6 flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <WouterLink href="/" className="text-sm text-slate-500 hover:text-primary-600 flex items-center">
                  Home
                </WouterLink>
              </li>
              <li>
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <WouterLink 
                    href={user?.userType === "seller" ? "/seller/book-listings" : "/buyer/browse"} 
                    className="ml-1 text-sm text-slate-500 hover:text-primary-600"
                  >
                    {user?.userType === "seller" ? "Book Listings" : "Browse Books"}
                  </WouterLink>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                  <span className="ml-1 text-sm font-medium text-slate-700 truncate max-w-[200px]">
                    {book.title}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Book Image */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-auto aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full h-auto aspect-[3/4] bg-slate-200 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-400" />
                  </div>
                )}
              </div>
              
              {/* Actions for mobile */}
              <div className="mt-4 block md:hidden">
                <div className="flex flex-col space-y-3">
                  {user?.userType === "buyer" ? (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={handlePurchase}
                        disabled={purchaseMutation.isPending}
                      >
                        {purchaseMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="mr-2 h-4 w-4" />
                        )}
                        Buy Now - ${book.price.toFixed(2)}
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Heart className="mr-2 h-4 w-4" />
                        Add to Favorites
                      </Button>
                    </>
                  ) : isOwner ? (
                    <Button asChild className="w-full">
                      <WouterLink href={`/seller/edit-book/${book.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Book
                      </WouterLink>
                    </Button>
                  ) : null}
                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Book Details */}
            <div className="md:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className="mb-2">{book.category}</Badge>
                      <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {book.title}
                      </h1>
                      <p className="text-lg text-slate-600 mb-4">by {book.author}</p>
                    </div>
                    <div className="text-2xl font-bold text-primary-600">
                      ${book.price.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="my-6 border-t border-b border-slate-200 py-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-slate-700 whitespace-pre-line">{book.description}</p>
                  </div>
                  
                  {/* Actions for desktop */}
                  <div className="hidden md:block mt-8">
                    <div className="flex space-x-4">
                      {user?.userType === "buyer" ? (
                        <>
                          <Button 
                            className="flex-1" 
                            onClick={handlePurchase}
                            disabled={purchaseMutation.isPending}
                          >
                            {purchaseMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ShoppingCart className="mr-2 h-4 w-4" />
                            )}
                            Buy Now
                          </Button>
                          <Button variant="outline">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </>
                      ) : isOwner ? (
                        <Button asChild className="flex-1">
                          <WouterLink href={`/seller/edit-book/${book.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Book
                          </WouterLink>
                        </Button>
                      ) : null}
                      <Button variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
