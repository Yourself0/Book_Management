import { users, books, transactions, type User, type InsertUser, type Book, type InsertBook, type Transaction, type InsertTransaction } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Book methods
  getBooks(): Promise<Book[]>;
  getBooksByCategory(category: string): Promise<Book[]>;
  getBooksByUser(userId: number): Promise<Book[]>;
  getBookById(id: number): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Transaction methods
  getTransactionsBySeller(sellerId: number): Promise<Transaction[]>;
  getTransactionsByBuyer(buyerId: number): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Book methods
  async getBooks(): Promise<Book[]> {
    return await db.select().from(books).where(eq(books.published, true)).orderBy(desc(books.createdAt));
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return await db.select().from(books)
      .where(and(eq(books.published, true), eq(books.category, category)))
      .orderBy(desc(books.createdAt));
  }

  async getBooksByUser(userId: number): Promise<Book[]> {
    return await db.select().from(books)
      .where(eq(books.sellerId, userId))
      .orderBy(desc(books.createdAt));
  }

  async getBookById(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const [book] = await db
      .insert(books)
      .values(insertBook)
      .returning();
    return book;
  }

  async updateBook(id: number, bookData: Partial<InsertBook>): Promise<Book | undefined> {
    const updatedData = {
      ...bookData,
      updatedAt: new Date(),
    };
    
    const [book] = await db
      .update(books)
      .set(updatedData)
      .where(eq(books.id, id))
      .returning();
    
    return book;
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db
      .delete(books)
      .where(eq(books.id, id))
      .returning({ id: books.id });
    
    return result.length > 0;
  }

  // Transaction methods
  async getTransactionsBySeller(sellerId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.sellerId, sellerId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByBuyer(buyerId: number): Promise<Transaction[]> {
    return await db.select().from(transactions)
      .where(eq(transactions.buyerId, buyerId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async updateTransaction(id: number, transactionData: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const updatedData = {
      ...transactionData,
      updatedAt: new Date(),
    };
    
    const [transaction] = await db
      .update(transactions)
      .set(updatedData)
      .where(eq(transactions.id, id))
      .returning();
    
    return transaction;
  }
}

export const storage = new DatabaseStorage();
