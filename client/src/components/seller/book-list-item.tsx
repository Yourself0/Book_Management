import React from "react";
import { Book } from "@shared/schema";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

interface BookListItemProps {
  book: Book;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export const BookListItem: React.FC<BookListItemProps> = ({
  book,
  onEdit,
  onDelete,
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 flex-shrink-0">
            {book.imageUrl ? (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="h-10 w-10 rounded-md object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-slate-200 flex items-center justify-center text-slate-500">
                No img
              </div>
            )}
          </div>
          <div className="max-w-[200px]">
            <Link href={`/book/${book.id}`} className="font-medium text-slate-900 hover:text-primary-600">
              {book.title}
            </Link>
          </div>
        </div>
      </TableCell>
      <TableCell>{book.author}</TableCell>
      <TableCell>${book.price.toFixed(2)}</TableCell>
      <TableCell>{book.category}</TableCell>
      <TableCell>
        <Badge variant={book.published ? "default" : "secondary"}>
          {book.published ? "Published" : "Draft"}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-500">
        {formatDistanceToNow(new Date(book.updatedAt), { addSuffix: true })}
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href={`/book/${book.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(book)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(book)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
