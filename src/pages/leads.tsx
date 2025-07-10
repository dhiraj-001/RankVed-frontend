import { useState } from 'react';
import { Download, Filter, Search, Users, Phone, Mail, Calendar, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeads } from '@/hooks/use-leads';
import { useChatbots } from '@/hooks/use-chatbots';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChatbot, setSelectedChatbot] = useState<string>('all');
  const [exporting, setExporting] = useState(false);
  const [expandedContext, setExpandedContext] = useState<string | null>(null);

  useEffect(() => {
    if (exporting) {
      const timer = setTimeout(() => setExporting(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [exporting]);
  
  const { data: leads, isLoading } = useLeads(selectedChatbot === 'all' ? undefined : selectedChatbot);
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

  return (
    <TooltipProvider>
      {/* Sticky Glassmorphism Header */}
      <header className="backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Leads</h2>
          <p className="text-slate-600 mt-1 text-base font-normal">Manage and view leads collected through your chatbots</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={exportLeads} disabled={!filteredLeads.length || exporting} className="rounded-full p-3 bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all">
              <Download className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Leads</TooltipContent>
        </Tooltip>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
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
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center">
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
          <CardHeader className="sticky top-[180px] z-10 bg-white/90 backdrop-blur-md rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Users className="h-5 w-5 text-blue-600" /> Lead Details
            </CardTitle>
            <p className="text-sm text-slate-600">{filteredLeads.length} leads found</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-white/80 sticky top-0 z-10">
                    <th className="text-left p-4 font-medium text-slate-600">Contact</th>
                    <th className="text-left p-4 font-medium text-slate-600">Phone</th>
                    <th className="text-left p-4 font-medium text-slate-600">Email</th>
                    <th className="text-left p-4 font-medium text-slate-600">Consent</th>
                    <th className="text-left p-4 font-medium text-slate-600">Source</th>
                    <th className="text-left p-4 font-medium text-slate-600">Date</th>
                    <th className="text-left p-4 font-medium text-slate-600">Context</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-36" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-28" /></td>
                        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  ) : filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center">
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
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-pointer underline decoration-dotted" tabIndex={0}>{formatDateTime(lead.createdAt)}</span>
                              </TooltipTrigger>
                              <TooltipContent>{formatTimeAgo(lead.createdAt)}</TooltipContent>
                            </Tooltip>
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" onClick={() => setExpandedContext(expandedContext === lead.id ? null : lead.id)}>
                              {expandedContext === lead.id ? 'Hide' : 'View'}
                            </Button>
                            {expandedContext === lead.id && (
                              <div className="mt-2 max-w-xs text-xs bg-slate-50 border rounded p-2 overflow-x-auto">
                                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(lead.conversationContext, null, 2)}</pre>
                              </div>
                            )}
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
