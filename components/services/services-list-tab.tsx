"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllServices, deleteService, Service } from "@/lib/service-api";
import { ServiceFormModal } from "@/components/services/service-form-modal";

export function ServicesListTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>(
    undefined,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getAllServices();
      if (res.success) {
        setServices(res.data);
      } else {
        toast.error("Failed to fetch services");
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteService(deleteId);
      if (res.success) {
        toast.success("Service deleted successfully");
        fetchServices();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    } finally {
      setDeleteId(null);
    }
  };

  const startEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const filteredServices = services.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: services.length,
    active: services.filter((s) => s.status === "active").length,
    inactive: services.filter((s) => s.status === "inactive").length,
    avgPrice:
      services.length > 0
        ? (
            services.reduce((sum, s) => sum + s.basePricePerPage, 0) /
            services.length
          ).toFixed(2)
        : "0",
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Services</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <div className="h-4 w-4 bg-green-500 rounded-full" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <div className="h-4 w-4 bg-red-500 rounded-full" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
              <p className="text-xs text-muted-foreground">Inactive</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IndianRupee className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">₹{stats.avgPrice}</p>
              <p className="text-xs text-muted-foreground">Avg Base Price</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: "all" | "active" | "inactive") =>
              setStatusFilter(value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{filteredServices.length}</span>
            <span>of {services.length} services</span>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingService(undefined);
            setIsModalOpen(true);
          }}
          className="gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                    <div className="flex gap-1">
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                      <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-2xl border border-dashed border-border/50">
            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground text-lg">
              No services found. Create your first service!
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card
              key={service._id}
              className="overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="aspect-video relative overflow-hidden bg-muted">
                {service.image ? (
                  <Image
                    src={typeof service.image === "string" ? service.image : ""}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge
                    className={
                      service.status === "active"
                        ? "bg-green-500/90"
                        : "bg-red-500/90"
                    }
                  >
                    {service.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                    {service.name}
                  </h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:bg-blue-50"
                      onClick={() => startEdit(service)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                      onClick={() => setDeleteId(service._id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-3 mb-6 text-sm">
                  {service.customQuotation ? (
                    <div className="flex flex-col gap-3 py-2">
                      <Badge
                        variant="secondary"
                        className="w-fit gap-1.5 px-3 py-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Custom Quotation Service
                      </Badge>
                      <p className="text-muted-foreground text-xs italic">
                        This service collects leads instead of direct orders.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary/30 shrink-0" />
                        <span className="truncate">
                          <b>Print Types:</b>{" "}
                          {service.printTypes
                            ?.map((p) => {
                              const isPerCopy =
                                (p.pricePerCopy || 0) > 0 &&
                                (p.pricePerPage || 0) === 0;
                              const price = isPerCopy
                                ? p.pricePerCopy
                                : p.pricePerPage;
                              return `${p.value} (₹${price}/${isPerCopy ? "copy" : "page"})`;
                            })
                            .join(", ") || "None"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary/30 shrink-0" />
                        <span className="truncate">
                          <b>Paper Sizes:</b>{" "}
                          {service.paperSizes
                            ?.map((p) => {
                              const isPerCopy =
                                (p.pricePerCopy || 0) > 0 &&
                                (p.pricePerPage || 0) === 0;
                              const price = isPerCopy
                                ? p.pricePerCopy
                                : p.pricePerPage;
                              return price > 0
                                ? `${p.value} (+₹${price}/${isPerCopy ? "copy" : "page"})`
                                : p.value;
                            })
                            .join(", ") || "None"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary/30 shrink-0" />
                        <span className="truncate">
                          <b>Paper Types:</b> {service.paperTypes?.length || 0}{" "}
                          options • <b>GSM:</b>{" "}
                          {service.gsmOptions?.length || 0} options
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-primary bg-primary/5 p-3 rounded-xl border border-primary/10">
                        <IndianRupee className="h-4 w-4" />
                        <span className="text-sm">
                          Base Price: ₹{service.basePricePerPage}/page
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  {service.bindingOptions?.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-wider"
                    >
                      {opt.value}
                      {(opt.fixedPrice || 0) > 0 && ` (₹${opt.fixedPrice})`}
                      {(opt.minPages || 0) > 0
                        ? ` [From ${opt.minPages} pgs]`
                        : ""}
                    </Badge>
                  ))}
                  {service.bindingOptions?.length === 0 && (
                    <span className="text-[10px] text-muted-foreground italic">
                      No binding options
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <ServiceFormModal
          service={editingService}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchServices();
          }}
        />
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Service?"
        description="Are you sure you want to delete this service? This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
