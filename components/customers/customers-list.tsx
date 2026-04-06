"use client";

import { useState, useEffect } from "react";
import {
  Search,
  User,
  Mail,
  Phone,
  Package,
  IndianRupee,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAllCustomers, Customer } from "@/lib/customer-api";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

export function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await getAllCustomers({
        search,
        page,
        limit: 10,
      });
      if (res.success) {
        setCustomers(res.customers);
        setTotalPages(res.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {customers.length * totalPages}
              </p>
              <p className="text-xs text-muted-foreground">
                Approx. Total Customers
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Package className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {customers.reduce((sum, c) => sum + c.orderCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                Orders (Current Page)
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ₹
                {customers
                  .reduce((sum, c) => sum + c.totalSpent, 0)
                  .toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Revenue (Current Page)
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-10"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="h-10 w-40 animate-pulse bg-muted rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-10 animate-pulse bg-muted rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-20 animate-pulse bg-muted rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-24 animate-pulse bg-muted rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 w-24 animate-pulse bg-muted rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 animate-pulse bg-muted rounded ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <User className="h-12 w-12 opacity-20" />
                      <p>No customers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={customer.image} />
                          <AvatarFallback>
                            {customer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Package className="h-3 w-3" />
                        {customer.orderCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold">
                        <IndianRupee className="h-3 w-3" />
                        {customer.totalSpent.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm">
                          {format(
                            new Date(customer.lastOrderDate),
                            "MMM dd, yyyy",
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {format(new Date(customer.lastOrderDate), "hh:mm a")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">
                          {format(new Date(customer.createdAt), "MMM yyyy")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/customers/${customer.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <span>Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
