"use client";

import React, { useState, useEffect } from "react";
import { 
  getLeads, 
  updateLead, 
  deleteLead 
} from "@/lib/lead-api";
import { Lead } from "@/lib/lead-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare, 
  Trash2, 
  MoreVertical, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  User,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LeadsTab() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await getLeads({
        search,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: 10
      });
      if (response.success) {
        setLeads(response.leads);
        setTotalPages(response.pagination.pages);
      }
    } catch (error) {
      console.error("Fetch leads error:", error);
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
  };

  const handleStatusUpdate = async (id: string, status: Lead["status"]) => {
    try {
      const response = await updateLead(id, { status });
      if (response.success) {
        toast.success("Status updated");
        setLeads(leads.map(l => l._id === id ? { ...l, status } : l));
        if (selectedLead?._id === id) {
          setSelectedLead({ ...selectedLead, status });
        }
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteLead = async () => {
    if (!deleteConfirmId) return;
    try {
      const response = await deleteLead(deleteConfirmId);
      if (response.success) {
        toast.success("Lead deleted");
        setLeads(leads.filter(l => l._id !== deleteConfirmId));
      }
    } catch (error) {
      toast.error("Failed to delete lead");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const getStatusBadge = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">New</Badge>;
      case "contacted":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">Contacted</Badge>;
      case "qualified":
        return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Qualified</Badge>;
      case "lost":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200">Lost</Badge>;
      case "converted":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">Converted</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground">Track and manage your contact form submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50/50 border-blue-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
          </div>
        </Card>
        {/* Add more stats here if needed */}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or subject..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-lg font-medium">No leads found</h3>
            <p className="text-muted-foreground text-sm">New leads from the contact form will appear here</p>
          </Card>
        ) : (
          leads.map((lead) => (
            <Card key={lead._id} className="hover:shadow-md transition-shadow group">
              <div className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg">{lead.name}</h3>
                    {getStatusBadge(lead.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {lead.email}
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {lead.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-medium line-clamp-1">{lead.subject}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{lead.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
                  <Select 
                    value={lead.status} 
                    onValueChange={(val: Lead["status"]) => handleStatusUpdate(lead._id, val)}
                  >
                    <SelectTrigger className="w-[130px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedLead(lead)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteConfirmId(lead._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <Button 
            variant="outline" 
            size="icon" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">Page {page} of {totalPages}</span>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedLead(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
                  <p className="text-muted-foreground">Submitted on {new Date(selectedLead.createdAt).toLocaleString()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                  <XCircle className="w-6 h-6" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Mail className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
                      <p className="font-medium">{selectedLead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Phone className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Phone</p>
                      <p className="font-medium">{selectedLead.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><Clock className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedLead.status)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg"><AlertCircle className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Source</p>
                      <p className="font-medium capitalize">{selectedLead.source.replace("_", " ")}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Subject</p>
                <div className="p-3 bg-muted rounded-lg font-bold">{selectedLead.subject}</div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Message</p>
                <div className="p-4 bg-muted rounded-xl text-sm leading-relaxed whitespace-pre-wrap italic">
                  "{selectedLead.message}"
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setSelectedLead(null)}>Close</Button>
                <a href={`mailto:${selectedLead.email}`}>
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" /> Reply via Email
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}

      <ConfirmationModal 
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDeleteLead}
        title="Delete Lead"
        description="Are you sure you want to delete this lead? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
