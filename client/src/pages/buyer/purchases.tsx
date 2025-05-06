import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBuyerTransactions } from "@/lib/book-service";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Download, ArrowRight } from "lucide-react";

export default function PurchasesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    data: transactions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/buyer/transactions"],
    queryFn: fetchBuyerTransactions,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Purchases</h1>
              <p className="mt-1 text-slate-600">
                View all the books you've purchased
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button variant="outline" asChild>
                <Link href="/buyer/browse">
                  Browse More Books
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Purchase history */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-red-500 mb-4">
                Error loading your purchases. Please try again.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Purchases Yet</CardTitle>
                <CardDescription>
                  You haven't purchased any books yet. Start by browsing our collection.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-6">
                    Your purchase history will appear here
                  </p>
                  <Button asChild>
                    <Link href="/buyer/browse">Browse Books</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>
                  A record of all your book purchases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Your book purchase history</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <Link href={`/book/${transaction.bookId}`} className="hover:text-primary-600 hover:underline">
                            {transaction.book?.title || `Book #${transaction.bookId}`}
                          </Link>
                        </TableCell>
                        <TableCell>${transaction.price.toFixed(2)}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {transaction.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/book/${transaction.bookId}`}>
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!transaction.book?.driveFileId}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
