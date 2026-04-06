"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export function EmployeesTab() {
  interface Employee {
    _id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    banned: boolean;
    role: string;
    createdAt: string;
    lastLogin?: string;
    verificationToken?: string;
  }

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "" });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get("/api/employees");

      if (response.data.success) {
        setEmployees(response.data.employees);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load employees";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmployee.name || !newEmployee.email) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsCreating(true);
      const response = await axiosInstance.post("/api/employees", newEmployee);

      if (response.data.success) {
        toast.success("Employee created! Verification email sent.");
        setIsCreateDialogOpen(false);
        setNewEmployee({ name: "", email: "" });
        fetchEmployees();
      }
    } catch (err) {
      console.error("Failed to create employee:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create employee";
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await axiosInstance.put(`/api/employees/${id}/status`, {
        banned: !currentStatus,
      });

      if (response.data.success) {
        toast.success(
          `Employee ${!currentStatus ? "deactivated" : "activated"} successfully`,
        );
        fetchEmployees();
      }
    } catch (err) {
      console.error("Failed to update employee status:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update employee status";
      toast.error(errorMessage);
    }
  };

  const resendVerification = async (id: string) => {
    try {
      const response = await axiosInstance.post(
        `/api/employees/${id}/resend-verification`,
        {},
      );

      if (response.data.success) {
        toast.success("Verification email sent successfully");
      }
    } catch (err) {
      console.error("Failed to resend verification:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to resend verification";
      toast.error(errorMessage);
    }
  };

  const deleteEmployee = async (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await axiosInstance.delete(
        `/api/employees/${deleteConfirm.id}`,
      );

      if (response.data.success) {
        toast.success("Employee deleted successfully");
        fetchEmployees();
      }
    } catch (err) {
      console.error("Failed to delete employee:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete employee";
      toast.error(errorMessage);
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Employees</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchEmployees}>Try Again</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Employee Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage employee accounts and permissions
              </p>
            </div>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Employee Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={createEmployee} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  A verification email will be sent to activate the account.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Employee"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Employees List */}
      {employees.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Employees Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first employee account to get started
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <Card
              key={employee._id}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {employee.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {employee.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {employee.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      employee.emailVerified
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                    )}
                  >
                    {employee.emailVerified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </>
                    )}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      employee.banned
                        ? "bg-destructive/10 text-destructive"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                    )}
                  >
                    {employee.banned ? "Inactive" : "Active"}
                  </span>
                </div>

                {/* Additional Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">
                      {employee.role || "employee"}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {employee.lastLogin && (
                    <div className="flex justify-between p-2 bg-muted/50 rounded">
                      <span className="text-muted-foreground">Last Login</span>
                      <span className="font-medium">
                        {new Date(employee.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {employee.verificationToken && !employee.emailVerified && (
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-yellow-800 dark:text-yellow-200">
                        Verification pending
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {!employee.emailVerified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => resendVerification(employee._id)}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    toggleEmployeeStatus(employee._id, employee.banned)
                  }
                  className="flex-1"
                >
                  {employee.banned ? "Activate" : "Deactivate"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteEmployee(employee._id, employee.name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Employee"
        description={`Are you sure you want to delete ${deleteConfirm?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteEmployee}
        variant="destructive"
      />
    </div>
  );
}
