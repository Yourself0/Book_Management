import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { fetchSellerBooks, fetchSellerTransactions } from "@/lib/book-service";
import { Book } from "@shared/schema";
import { Navbar } from "@/components/ui/navbar";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { SalesChart } from "@/components/seller/sales-chart";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BookOpen, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Plus, 
  FileDown,
  Loader2 
} from "lucide-react";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    data: books = [],
    isLoading: isLoadingBooks,
  } = useQuery<Book[]>({
    queryKey: ["/api/seller/books"],
    queryFn: fetchSellerBooks,
  });

  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
  } = useQuery<any[]>({
    queryKey: ["/api/seller/transactions"],
    queryFn: fetchSellerTransactions,
  });

  // Calculate stats
  const totalBooks = books.length;
  const publishedBooks = books.filter(book => book.published).length;
  const totalSales = transactions.length;
  const totalRevenue = transactions.reduce((sum, transaction) => sum + transaction.price, 0);

  // Prepare chart data - last 6 months
  const getLastSixMonths = () => {
    const months = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        name: month.toLocaleString('default', { month: 'short' }),
        date: month
      });
    }
    
    return months;
  };

  const getMonthData = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    const salesInMonth = transactions.filter(transaction => {
      const date = new Date(transaction.createdAt);
      return date.getFullYear() === year && date.getMonth() === month;
    });
    
    return {
      sales: salesInMonth.length,
      revenue: salesInMonth.reduce((sum, transaction) => sum + transaction.price, 0)
    };
  };

  const months = getLastSixMonths();
  const salesData = months.map(month => ({
    name: month.name,
    ...getMonthData(month.date)
  }));

  // Get recent transactions for activity feed
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Seller Dashboard
              </h1>
              <p className="mt-1 text-slate-600">
                Welcome back, {user?.firstName}! Here's an overview of your book sales.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="w-full sm:w-auto">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button className="w-full sm:w-auto" asChild>
                <Link href="/seller/add-book">
                  <Plus className="mr-2 h-4 w-4" />
                  New Book
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          {isLoadingBooks || isLoadingTransactions ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Books */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-md mr-4">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Books</p>
                        <div className="flex items-baseline">
                          <p className="text-2xl font-semibold text-slate-900">{totalBooks}</p>
                          <p className="ml-2 text-xs text-green-600">
                            {publishedBooks} published
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Views */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-md mr-4">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Views</p>
                        <div className="flex items-baseline">
                          <p className="text-2xl font-semibold text-slate-900">2,856</p>
                          <p className="ml-2 text-xs text-green-600">
                            +12% from last month
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Sales */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-md mr-4">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Sales</p>
                        <div className="flex items-baseline">
                          <p className="text-2xl font-semibold text-slate-900">{totalSales}</p>
                          <p className="ml-2 text-xs text-green-600">
                            {transactions.length > 0 ? "+1 today" : "No sales today"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Revenue */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-md mr-4">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                        <div className="flex items-baseline">
                          <p className="text-2xl font-semibold text-slate-900">${totalRevenue.toFixed(2)}</p>
                          <p className="ml-2 text-xs text-green-600">
                            USD
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales chart */}
                <SalesChart data={salesData} title="Monthly Sales Performance" />

                {/* Top Books */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle>Top Books</CardTitle>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/seller/book-listings">View All</Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {books.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>No books listed yet</p>
                        <Button variant="link" asChild className="mt-2">
                          <Link href="/seller/add-book">Add your first book</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {books.slice(0, 5).map((book) => (
                          <div key={book.id} className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-slate-200 rounded-md overflow-hidden mr-3">
                              {book.imageUrl && (
                                <img
                                  src={book.imageUrl}
                                  alt={book.title}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {book.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {book.author}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">
                                ${book.price.toFixed(2)}
                              </p>
                              <div className="text-xs text-slate-500">
                                {book.published ? "Published" : "Draft"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest sales and updates from your book store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p>No recent transactions</p>
                    </div>
                  ) : (
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {recentTransactions.map((transaction, idx) => (
                          <li key={transaction.id}>
                            <div className="relative pb-8">
                              {idx !== recentTransactions.length - 1 && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                                  aria-hidden="true"
                                />
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                                    <DollarSign className="h-4 w-4 text-white" />
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                  <div>
                                    <p className="text-sm text-slate-800">
                                      New sale: <span className="font-medium">{transaction.book?.title || "Book"}</span>
                                    </p>
                                  </div>
                                  <div className="text-right text-sm whitespace-nowrap text-slate-500">
                                    <time dateTime={transaction.createdAt}>
                                      {new Date(transaction.createdAt).toLocaleDateString()}
                                    </time>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
