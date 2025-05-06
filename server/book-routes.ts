import express from 'express';
import multer from 'multer';
import { storage } from './storage';
import { insertBookSchema } from '@shared/schema';
import { uploadFileToDrive, deleteFileFromDrive } from './drive-service';
import { z } from 'zod';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

export function setupBookRoutes(app: express.Express) {
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'You must be logged in to perform this action' });
  };

  // Middleware to check if user is a seller
  const isSeller = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.isAuthenticated() && req.user.userType === 'seller') {
      return next();
    }
    res.status(403).json({ message: 'Only sellers can perform this action' });
  };

  // Get all books
  app.get('/api/books', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let books;
      if (category) {
        books = await storage.getBooksByCategory(category);
      } else {
        books = await storage.getBooks();
      }
      
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ message: 'Failed to fetch books' });
    }
  });

  // Get a specific book
  app.get('/api/books/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      const book = await storage.getBookById(bookId);
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json(book);
    } catch (error) {
      console.error('Error fetching book:', error);
      res.status(500).json({ message: 'Failed to fetch book details' });
    }
  });

  // Get books for the authenticated seller
  app.get('/api/seller/books', isAuthenticated, isSeller, async (req, res) => {
    try {
      const books = await storage.getBooksByUser(req.user.id);
      res.json(books);
    } catch (error) {
      console.error('Error fetching seller books:', error);
      res.status(500).json({ message: 'Failed to fetch your books' });
    }
  });

  // Create a new book
  app.post('/api/books', isAuthenticated, isSeller, upload.single('image'), async (req, res) => {
    try {
      // Parse the JSON string from the form data
      const bookData = JSON.parse(req.body.bookData);
      
      // Validate book data
      const validatedData = insertBookSchema.parse({
        ...bookData,
        sellerId: req.user.id
      });

      let imageUrl = '';
      let driveFileId = '';

      // If an image was uploaded, save it to Google Drive
      if (req.file) {
        const result = await uploadFileToDrive(
          req.file.buffer,
          req.file.mimetype,
          `book_${Date.now()}_${req.file.originalname}`
        );
        
        imageUrl = result.webContentLink;
        driveFileId = result.fileId;
      }

      // Create the book with the image URL
      const book = await storage.createBook({
        ...validatedData,
        imageUrl,
        driveFileId
      });

      res.status(201).json(book);
    } catch (error) {
      console.error('Error creating book:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: 'Failed to create book' });
    }
  });

  // Update a book
  app.put('/api/books/:id', isAuthenticated, isSeller, upload.single('image'), async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      
      // Get the existing book to check ownership
      const existingBook = await storage.getBookById(bookId);
      
      if (!existingBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Check if the authenticated user is the owner of this book
      if (existingBook.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only update your own books' });
      }

      // Parse the JSON string from the form data
      const bookData = JSON.parse(req.body.bookData);
      
      let updateData: any = { ...bookData };

      // If an image was uploaded, update the image
      if (req.file) {
        // Delete the old image if it exists
        if (existingBook.driveFileId) {
          await deleteFileFromDrive(existingBook.driveFileId);
        }
        
        // Upload the new image
        const result = await uploadFileToDrive(
          req.file.buffer,
          req.file.mimetype,
          `book_${Date.now()}_${req.file.originalname}`
        );
        
        updateData.imageUrl = result.webContentLink;
        updateData.driveFileId = result.fileId;
      }

      // Update the book
      const updatedBook = await storage.updateBook(bookId, updateData);
      
      if (!updatedBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      res.json(updatedBook);
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Failed to update book' });
    }
  });

  // Delete a book
  app.delete('/api/books/:id', isAuthenticated, isSeller, async (req, res) => {
    try {
      const bookId = parseInt(req.params.id, 10);
      
      // Get the existing book to check ownership and get the drive file ID
      const existingBook = await storage.getBookById(bookId);
      
      if (!existingBook) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Check if the authenticated user is the owner of this book
      if (existingBook.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'You can only delete your own books' });
      }

      // Delete the image from Google Drive if it exists
      if (existingBook.driveFileId) {
        await deleteFileFromDrive(existingBook.driveFileId);
      }
      
      // Delete the book from the database
      const success = await storage.deleteBook(bookId);
      
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete book' });
      }
      
      res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ message: 'Failed to delete book' });
    }
  });

  // Create a new transaction (purchase a book)
  app.post('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const { bookId } = req.body;
      
      if (!bookId) {
        return res.status(400).json({ message: 'Book ID is required' });
      }
      
      // Get the book to check if it exists and get the price and seller ID
      const book = await storage.getBookById(parseInt(bookId, 10));
      
      if (!book) {
        return res.status(404).json({ message: 'Book not found' });
      }
      
      // Create the transaction
      const transaction = await storage.createTransaction({
        bookId: book.id,
        buyerId: req.user.id,
        sellerId: book.sellerId,
        price: book.price,
        status: 'completed'
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ message: 'Failed to process purchase' });
    }
  });

  // Get transactions for the authenticated seller
  app.get('/api/seller/transactions', isAuthenticated, isSeller, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsBySeller(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching seller transactions:', error);
      res.status(500).json({ message: 'Failed to fetch your transactions' });
    }
  });

  // Get transactions for the authenticated buyer
  app.get('/api/buyer/transactions', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByBuyer(req.user.id);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching buyer transactions:', error);
      res.status(500).json({ message: 'Failed to fetch your purchases' });
    }
  });
}
