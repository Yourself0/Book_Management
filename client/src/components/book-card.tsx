import React from "react";
import { Link } from "wouter";
import { Book, User } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/hooks/use-auth";
import { purchaseBook } from "@/lib/book-service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart } from "lucide-react";

interface BookCardProps {
  book: Book;
  showSellerActions?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  showSellerActions = false,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const purchaseMutation = useMutation({
    mutationFn: purchaseBook,
    onSuccess: () => {
      toast({
        title: "Purchase successful!",
        description: `You have successfully purchased "${book.title}"`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/buyer/transactions"] });
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
    
    purchaseMutation.mutate(book.id);
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <Link href={`/book/${book.id}`}>
        <div className="cursor-pointer">
          <AspectRatio ratio={3/4}>
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <p className="text-slate-500">No Image</p>
              </div>
            )}
          </AspectRatio>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link href={`/book/${book.id}`}>
          <h3 className="font-bold text-lg line-clamp-1 cursor-pointer hover:text-primary-600 transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-500">{book.author}</p>
        <div className="mt-2">
          <span className="text-lg font-semibold">${book.price.toFixed(2)}</span>
          <span className="text-xs text-slate-500 ml-1">USD</span>
        </div>
        <p className="mt-2 text-sm line-clamp-2 text-slate-700">
          {book.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        {showSellerActions ? (
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit && onEdit(book)}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete && onDelete(book)}
            >
              Delete
            </Button>
          </>
        ) : user?.userType === "buyer" ? (
          <>
            <Button
              className="flex-1"
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Buy Now
            </Button>
            <Button variant="outline" size="icon">
              <Heart className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button className="flex-1" asChild>
            <Link href={`/book/${book.id}`}>View Details</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
