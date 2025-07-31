import { useState } from 'react';
import { Download, Search, Users, Phone, Mail, Calendar, Bot, Trash2, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/hooks/use-leads';
import { useChatbots } from '@/hooks/use-chatbots';
import { formatDateTime } from '@/lib/utils';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatbot, setSelectedChatbot] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [expandedContext, setExpandedContext] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (exporting) {
      const timer = setTimeout(() => setExporting(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [exporting]);
  
  const { data: leads, isLoading, refetch } = useLeads(selectedChatbot === 'all' ? undefined : selectedChatbot);
  const { data: chatbots } = useChatbots();

  const filteredLeads = leads?.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const exportLeads = () => {
    if (!filteredLeads.length) return;
    setExporting(true);
    
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Consent', 'Source', 'Date', 'Context'].join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.phone || '',
        lead.email || '',
        lead.consentGiven ? 'Yes' : 'No',
        chatbots?.find(c => c.id === lead.chatbotId)?.name || 'Unknown',
        formatDateTime(lead.createdAt),
        JSON.stringify(lead.conversationContext || {}).replace(/,/g, ';')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast({ title: 'Exported', description: 'Leads exported as CSV', variant: 'default' });
  };

  // Delete functions
  const handleDeleteLead = async (leadId: number) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Lead deleted successfully', variant: 'default' });
        refetch();
        setSelectedLeads(prev => prev.filter(id => id !== leadId));
      } else {
        const error = await response.json();
        toast({ title: 'Error', description: error.message || 'Failed to delete lead', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete lead', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setLeadToDelete(null);
    }
  };

  const handleDeleteMultipleLeads = async () => {
    if (selectedLeads.length === 0) return;
    
    setIsDeleting(true);
    try {
      const deletePromises = selectedLeads.map(leadId =>
        fetch(`${import.meta.env.VITE_API_URL}/api/leads/${leadId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const responses = await Promise.all(deletePromises);
      const failedDeletes = responses.filter(response => !response.ok);

      if (failedDeletes.length === 0) {
        toast({ 
          title: 'Success', 
          description: `${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} deleted successfully`, 
          variant: 'default' 
        });
        refetch();
        setSelectedLeads([]);
      } else {
        toast({ 
          title: 'Partial Success', 
          description: `${selectedLeads.length - failedDeletes.length} leads deleted, ${failedDeletes.length} failed`, 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete leads', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => Number(lead.id)));
    }
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  return (
    <TooltipProvider>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              {leadToDelete ? 'Delete Lead' : 'Delete Multiple Leads'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {leadToDelete ? (
              <p>Are you sure you want to delete <strong>{leadToDelete.name}</strong>? This action cannot be undone.</p>
            ) : (
              <p>Are you sure you want to delete <strong>{selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''}</strong>? This action cannot be undone.</p>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => leadToDelete ? handleDeleteLead(leadToDelete.id) : handleDeleteMultipleLeads()}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="hidden sm:block backdrop-blur-md bg-gradient-to-br from-blue-50 via-white to-white border-b border-blue-50 px-4 sm:px-6 py-2 sm:py-4 sticky top-0 z-20 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-7xl mx-auto gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl text-slate-900 font-bold">Leads</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {selectedLeads.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={() => setShowDeleteDialog(true)} 
                    disabled={isDeleting}
                    variant="destructive" 
                    className="px-3 py-1.5"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedLeads.length})
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete Selected ({selectedLeads.length})</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={exportLeads} disabled={!filteredLeads.length || exporting} className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3 py-1.5">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export Leads</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <div className="sm:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Leads</h2>
          <div className="flex items-center gap-2">
            {selectedLeads.length > 0 && (
              <Button 
                onClick={() => setShowDeleteDialog(true)} 
                disabled={isDeleting}
                variant="destructive" 
                size="sm"
                className="px-3 py-1.5"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
            <Button onClick={exportLeads} disabled={!filteredLeads.length || exporting} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto bg-gradient-to-br from-blue-50 to-white min-h-screen flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg bg-gradient-to-br from-blue-50 to-white border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-blue-100 rounded-xl p-3"><Users className="h-7 w-7 text-blue-600" /></div>
              <div>
                <p className="text-3xl font-bold text-slate-900 animate-pulse">{isLoading ? <Skeleton className="h-8 w-12" /> : leads?.length || 0}</p>
                <p className="text-sm text-slate-600">Total Leads</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-gradient-to-br from-green-50 to-white border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-100 rounded-xl p-3"><Phone className="h-7 w-7 text-green-600" /></div>
              <div>
                <p className="text-3xl font-bold text-slate-900 animate-pulse">{isLoading ? <Skeleton className="h-8 w-12" /> : leads?.filter(l => l.phone).length || 0}</p>
                <p className="text-sm text-slate-600">With Phone</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-white border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-100 rounded-xl p-3"><Mail className="h-7 w-7 text-purple-600" /></div>
              <div>
                <p className="text-3xl font-bold text-slate-900 animate-pulse">{isLoading ? <Skeleton className="h-8 w-12" /> : leads?.filter(l => l.email).length || 0}</p>
                <p className="text-sm text-slate-600">With Email</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-gradient-to-br from-orange-50 to-white border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-orange-100 rounded-xl p-3"><Calendar className="h-7 w-7 text-orange-600" /></div>
              <div>
                <p className="text-3xl font-bold text-slate-900 animate-pulse">{isLoading ? <Skeleton className="h-8 w-12" /> : leads?.filter(l => {
                  const today = new Date();
                  const leadDate = new Date(l.createdAt);
                  return leadDate.toDateString() === today.toDateString();
                }).length || 0}</p>
                <p className="text-sm text-slate-600">Today</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow bg-white/80 border-0 sticky top-[90px] z-10">
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center bg-white rounded-xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 animate-bounce" />
              <Input
                placeholder="Search leads by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl shadow-sm"
              />
              {searchTerm && (
                <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchTerm('')}>Clear</Button>
              )}
            </div>
            <Select value={selectedChatbot} onValueChange={setSelectedChatbot}>
              <SelectTrigger className="w-full sm:w-48 rounded-xl shadow-sm">
                <SelectValue placeholder="Filter by chatbot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chatbots</SelectItem>
                {chatbots?.map((chatbot) => (
                  <SelectItem key={chatbot.id} value={chatbot.id}>
                    <Bot className="inline h-4 w-4 mr-1 text-blue-500" /> {chatbot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card className="shadow-lg rounded-2xl border-0">
          <CardHeader className="top-[180px] z-10 bg-white/90 backdrop-blur-md rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <Users className="h-5 w-5 text-blue-600" /> Lead Details
                </CardTitle>
                <p className="text-sm text-slate-600">{filteredLeads.length} leads found</p>
              </div>
              {filteredLeads.length > 0 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="flex items-center gap-2"
                  >
                    {selectedLeads.length === filteredLeads.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedLeads.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  {selectedLeads.length > 0 && (
                    <Badge variant="destructive" className="px-2 py-1">
                      {selectedLeads.length} selected
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-white/80 sticky top-0 z-10">
                    <th className="text-left p-4 font-medium text-slate-600">
                      <Checkbox
                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="mr-2"
                      />
                    </th>
                    <th className="text-left p-4 font-medium text-slate-600">Contact</th>
                    <th className="text-left p-4 font-medium text-slate-600">Phone</th>
                    <th className="text-left p-4 font-medium text-slate-600">Email</th>
                    <th className="text-left p-4 font-medium text-slate-600">Consent</th>
                    <th className="text-left p-4 font-medium text-slate-600">Source</th>
                    <th className="text-left p-4 font-medium text-slate-600">Date</th>
                    <th className="text-left p-4 font-medium text-slate-600">Context</th>
                    <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="p-4"><Skeleton className="h-4 w-6" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-36" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                      </tr>
                    ))
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No leads found</h3>
                        <p className="text-slate-500">
                          {searchTerm || selectedChatbot !== 'all' 
                            ? 'No leads match your current filters.' 
                            : 'Leads will appear here as users interact with your chatbots.'
                          }
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => {
                      const sourceChatbot = chatbots?.find(c => c.id === lead.chatbotId);
                      return (
                        <tr key={lead.id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedLeads.includes(Number(lead.id))}
                              onCheckedChange={() => handleSelectLead(Number(lead.id))}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{lead.name}</p>
                                <p className="text-xs text-slate-500">ID: {lead.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {lead.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{lead.phone}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">No phone</span>
                            )}
                          </td>
                          <td className="p-4">
                            {lead.email ? (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-purple-500" />
                                <span className="text-sm">{lead.email}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm">No email</span>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge variant={lead.consentGiven ? "default" : "secondary"} className={lead.consentGiven ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}>
                              {lead.consentGiven ? 'Yes' : 'No'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                              <Bot className="h-4 w-4" /> {sourceChatbot?.name || 'Unknown'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm text-slate-600">
                              {formatDateTime(lead.createdAt)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" onClick={() => setExpandedContext(expandedContext === lead.id ? null : lead.id)}>
                              {expandedContext === lead.id ? 'Hide' : 'View'}
                            </Button>
                            <div
                              className={`transition-all duration-700 ease-in-out overflow-hidden ${expandedContext === lead.id ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}
                              style={{ minWidth: 220 }}
                            >
                              {expandedContext === lead.id && (
                                <div className="relative bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-xl shadow-lg p-4 text-xs font-mono text-slate-800 break-all">
                                  <button
                                    className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    onClick={() => navigator.clipboard.writeText(JSON.stringify(lead.conversationContext, null, 2))}
                                    title="Copy context"
                                  >
                                    Copy
                                  </button>
                                  <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lead.conversationContext, null, 2)}</pre>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setLeadToDelete({ id: Number(lead.id), name: lead.name });
                                      setShowDeleteDialog(true);
                                    }}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-8 w-8"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Lead</TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
