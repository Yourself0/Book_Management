import { apiRequest } from "@/lib/queryClient";

export type UploadResponse = {
  fileId: string;
  imageUrl: string;
};

export const uploadBookImage = async (
  file: File,
  bookData: any
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("bookData", JSON.stringify(bookData));

  const response = await fetch("/api/books", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return await response.json();
};

export const updateBookWithImage = async (
  bookId: number,
  file: File | null,
  bookData: any
): Promise<any> => {
  const formData = new FormData();
  formData.append("bookData", JSON.stringify(bookData));
  
  if (file) {
    formData.append("image", file);
  }

  const response = await fetch(`/api/books/${bookId}`, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Update failed: ${response.statusText}`);
  }

  return await response.json();
};
