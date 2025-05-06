import { apiRequest } from "@/lib/queryClient";
import { Book, InsertBook } from "@shared/schema";
import { updateBookWithImage, uploadBookImage } from "@/lib/google-drive";

export const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("/api/books", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchBooksByCategory = async (category: string): Promise<Book[]> => {
  const response = await fetch(`/api/books?category=${encodeURIComponent(category)}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch books: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchSellerBooks = async (): Promise<Book[]> => {
  const response = await fetch("/api/seller/books", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch your books: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchBookById = async (id: number): Promise<Book> => {
  const response = await fetch(`/api/books/${id}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch book: ${response.statusText}`);
  }

  return await response.json();
};

export const createBook = async (
  bookData: Omit<InsertBook, "sellerId" | "imageUrl" | "driveFileId">,
  imageFile: File | null
): Promise<Book> => {
  if (!imageFile) {
    const response = await apiRequest("POST", "/api/books", {
      ...bookData,
      imageUrl: "",
      driveFileId: "",
    });
    return await response.json();
  }

  return await uploadBookImage(imageFile, bookData);
};

export const updateBook = async (
  id: number,
  bookData: Partial<InsertBook>,
  imageFile: File | null
): Promise<Book> => {
  return await updateBookWithImage(id, imageFile, bookData);
};

export const deleteBook = async (id: number): Promise<void> => {
  await apiRequest("DELETE", `/api/books/${id}`);
};

export const purchaseBook = async (bookId: number): Promise<any> => {
  const response = await apiRequest("POST", "/api/transactions", { bookId });
  return await response.json();
};

export const fetchSellerTransactions = async (): Promise<any[]> => {
  const response = await fetch("/api/seller/transactions", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }

  return await response.json();
};

export const fetchBuyerTransactions = async (): Promise<any[]> => {
  const response = await fetch("/api/buyer/transactions", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch purchases: ${response.statusText}`);
  }

  return await response.json();
};
