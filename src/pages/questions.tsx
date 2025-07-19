import { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, GitBranch, MessageSquare, HelpCircle, FileText, RotateCcw, Building2, ShoppingCart, Heart, Home, Play, ArrowRight, Loader2, Sparkles, Target, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';

interface QuestionNode {
  id: string;
  type: 'statement' | 'multiple-choice' | 'contact-form' | 'open-ended';
  question: string;
  options?: { text: string; nextId?: string; action?: 'continue' | 'collect-lead' | 'end-chat' }[];
  nextId?: string;
  collectVariable?: string;
  aiHandling?: boolean;
}


export default function Questions() {
  const { activeChatbot } = useApp();
  const updateChatbot = useUpdateChatbot();
  const { toast } = useToast();

  const [questionFlow, setQuestionFlow] = useState<QuestionNode[]>(() => {
    if (!activeChatbot?.questionFlow) return [];
    
    // Handle both array and object formats
    if (Array.isArray(activeChatbot.questionFlow)) {
      return activeChatbot.questionFlow as QuestionNode[];
    }
    
    // If it's an object with nodes property, extract the nodes
    if (typeof activeChatbot.questionFlow === 'object' && activeChatbot.questionFlow.nodes) {
      return (activeChatbot.questionFlow as any).nodes as QuestionNode[];
    }
    
    return [];
  });
  // Sync questionFlow with activeChatbot changes
  useEffect(() => {
    if (!activeChatbot?.questionFlow) {
      setQuestionFlow([]);
      return;
    }
    if (Array.isArray(activeChatbot.questionFlow)) {
      setQuestionFlow(activeChatbot.questionFlow as QuestionNode[]);
    } else if (typeof activeChatbot.questionFlow === 'object' && activeChatbot.questionFlow.nodes) {
      setQuestionFlow((activeChatbot.questionFlow as any).nodes as QuestionNode[]);
    }
  }, [activeChatbot]);

  // Add local state for questionFlowEnabled
  const [questionFlowEnabled, setQuestionFlowEnabled] = useState(activeChatbot?.questionFlowEnabled ?? false);
  // Sync local state with activeChatbot
  useEffect(() => {
    setQuestionFlowEnabled(activeChatbot?.questionFlowEnabled ?? false);
  }, [activeChatbot?.questionFlowEnabled]);
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState<{ open: boolean; nodeId?: string }>({ open: false });
  const [showAddTemplateDialog, setShowAddTemplateDialog] = useState(false);
  const [templateJson, setTemplateJson] = useState('');
  const [addTemplateLoading, setAddTemplateLoading] = useState(false);
  const [showExampleDialog, setShowExampleDialog] = useState(false);

  // Add state for minimizing action buttons
  const [showActionButtons, setShowActionButtons] = useState(true);

  const [nodeForm, setNodeForm] = useState<QuestionNode>({
    id: '',
    type: 'statement',
    question: '',
    options: [],
    nextId: '',
    collectVariable: '',
    aiHandling: false
  });

  // Flow tester state
  const [showFlowTester, setShowFlowTester] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [flowTestMessages, setFlowTestMessages] = useState<Array<{
    id: string;
    content: string;
    sender: 'bot' | 'user';
    timestamp: Date;
    options?: { text: string; nextId?: string; action?: string }[];
  }>>([]);
  const [userInput, setUserInput] = useState('');

  // Flow tester functions
  const startFlowTest = () => {
    setShowFlowTester(true);
    setCurrentNodeId('start');
    setFlowTestMessages([]);
    setUserInput('');
    
    // Show first node
    const startNode = questionFlow.find(node => node.id === 'start') || questionFlow[0];
    if (startNode) {
      addBotMessage(startNode);
    }
  };

  const addBotMessage = (node: QuestionNode) => {
    const message = {
      id: generateId(),
      content: node.question,
      sender: 'bot' as const,
      timestamp: new Date(),
      options: node.options || []
    };
    
    setFlowTestMessages(prev => [...prev, message]);
  };

  const addUserMessage = (content: string) => {
    const message = {
      id: generateId(),
      content,
      sender: 'user' as const,
      timestamp: new Date()
    };
    
    setFlowTestMessages(prev => [...prev, message]);
  };

  const handleOptionClick = (option: { text: string; nextId?: string; action?: string }) => {
    addUserMessage(option.text);
    
    if (option.action === 'collect-lead') {
      const leadMessage = {
        id: generateId(),
        content: 'Thank you! Please provide your contact information so we can help you better.',
        sender: 'bot' as const,
        timestamp: new Date(),
        options: []
      };
      setFlowTestMessages(prev => [...prev, leadMessage]);
      return;
    }
    
    if (option.action === 'end-chat') {
      const endMessage = {
        id: generateId(),
        content: 'Thank you for using our service! Have a great day!',
        sender: 'bot' as const,
        timestamp: new Date(),
        options: []
      };
      setFlowTestMessages(prev => [...prev, endMessage]);
      return;
    }
    
    if (option.nextId) {
      const nextNode = questionFlow.find(node => node.id === option.nextId);
      if (nextNode) {
        setCurrentNodeId(option.nextId);
        setTimeout(() => addBotMessage(nextNode), 500);
      }
    }
  };

  const handleTextInput = () => {
    if (!userInput.trim()) return;
    
    addUserMessage(userInput);
    
    const currentNode = questionFlow.find(node => node.id === currentNodeId);
    if (currentNode?.aiHandling) {
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: generateId(),
          content: `I understand you're asking about: "${userInput}". Let me help you with that. Is there anything specific you'd like to know more about?`,
          sender: 'bot' as const,
          timestamp: new Date(),
          options: [
            { text: 'Tell me more', nextId: currentNode.nextId },
            { text: 'Contact support', action: 'collect-lead' },
            { text: 'End chat', action: 'end-chat' }
          ]
        };
        setFlowTestMessages(prev => [...prev, aiResponse]);
      }, 1000);
    } else if (currentNode?.nextId) {
      const nextNode = questionFlow.find(node => node.id === currentNode.nextId);
      if (nextNode) {
        setCurrentNodeId(currentNode.nextId);
        setTimeout(() => addBotMessage(nextNode), 500);
      }
    }
    
    setUserInput('');
  };

  const resetFlowTest = () => {
    setCurrentNodeId('start');
    setFlowTestMessages([]);
    setUserInput('');
    
    const startNode = questionFlow.find(node => node.id === 'start') || questionFlow[0];
    if (startNode) {
      addBotMessage(startNode);
    }
  };

  const businessTemplates = [
    {
      id: 'healthcare',
      name: 'Healthcare',
      description: 'Medical appointments, insurance, and health information',
      icon: Heart,
      color: 'bg-red-100 text-red-700'
    },
    {
      id: 'ecommerce',
      name: 'E-commerce',
      description: 'Product recommendations, orders, and customer support',
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'realestate',
      name: 'Real Estate',
      description: 'Property buying, selling, and rental inquiries',
      icon: Home,
      color: 'bg-green-100 text-green-700'
    },
    {
      id: 'general',
      name: 'General Business',
      description: 'Universal flow for any business type',
      icon: Building2,
      color: 'bg-purple-100 text-purple-700'
    }
  ];

  const loadTemplate = async (businessType: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/sample-flows/${businessType}`);
      if (response.ok) {
        const template = await response.json();
        setQuestionFlow(template.nodes || template);
        setQuestionFlowEnabled(true);
        toast({
          title: 'Template loaded',
          description: `${businessType} template has been loaded successfully.`,
        });
        setShowTemplatesDialog(false);
      } else {
        throw new Error('Failed to load template');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!activeChatbot) {
      toast({
        title: 'No chatbot selected',
        description: 'Please select a chatbot to save the question flow.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          questionFlow: { nodes: questionFlow },
          questionFlowEnabled: questionFlowEnabled,
        },
      });

      toast({
        title: 'Question flow saved',
        description: 'Your question flow has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save question flow. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleQuestionFlow = async (enabled: boolean) => {
    if (!activeChatbot) {
      toast({
        title: 'No chatbot selected',
        description: 'Please select a chatbot to configure question flow.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          questionFlowEnabled: enabled,
        },
      });

      setQuestionFlowEnabled(enabled);
      toast({
        title: enabled ? 'Question flow enabled' : 'Question flow disabled',
        description: enabled 
          ? 'Your chatbot will now use the question flow for conversations.' 
          : 'Your chatbot will now use AI responses instead of the question flow.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update question flow settings.',
        variant: 'destructive',
      });
    }
  };

  const handleResetToDefault = () => {
    setShowResetDialog(true);
  };

  const confirmResetToDefault = async () => {
    try {
      const defaultFlow: QuestionNode[] = [
        { id: 'start', type: 'statement', question: 'Hello! How can I help you today?', nextId: 'end' },
        { id: 'end', type: 'statement', question: 'Thank you for using our service!' }
      ];
      setQuestionFlow(defaultFlow);
      setQuestionFlowEnabled(true);
      setShowResetDialog(false);
      toast({
        title: 'Reset to default',
        description: 'Question flow has been reset to default template.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset question flow.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNode = () => {
    setNodeForm({
      id: '',
      type: 'statement',
      question: '',
      options: [],
      nextId: '',
      collectVariable: '',
      aiHandling: false
    });
    setIsEditing(false);
    setShowNodeDialog(true);
  };

  const handleEditNode = (node: QuestionNode) => {
    setNodeForm({ ...node });
    setIsEditing(true);
    setShowNodeDialog(true);
  };

  const handleSaveNode = () => {
    if (!nodeForm.id || !nodeForm.question) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (isEditing) {
      setQuestionFlow(prev => prev.map(node => node.id === nodeForm.id ? nodeForm : node));
    } else {
      setQuestionFlow(prev => [...prev, nodeForm]);
    }

    setShowNodeDialog(false);
    toast({
      title: isEditing ? 'Node updated' : 'Node created',
      description: `Question node has been ${isEditing ? 'updated' : 'created'} successfully.`,
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setShowDeleteDialog({ open: true, nodeId });
  };

  const confirmDeleteNode = () => {
    if (showDeleteDialog.nodeId) {
      setQuestionFlow(prev => prev.filter(node => node.id !== showDeleteDialog.nodeId));
      setShowDeleteDialog({ open: false });
      toast({
        title: 'Node deleted',
        description: 'Question node has been deleted successfully.',
      });
    }
  };

  const addOption = () => {
    setNodeForm(prev => ({
      ...prev,
      options: [...(prev.options || []), { text: '', nextId: '', action: 'continue' }]
    }));
  };

  const updateOption = (index: number, field: string, value: string) => {
    setNodeForm(prev => ({
      ...prev,
      options: prev.options?.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const removeOption = (index: number) => {
    setNodeForm(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index)
    }));
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'statement': return MessageSquare;
      case 'multiple-choice': return HelpCircle;
      case 'contact-form': return FileText;
      case 'open-ended': return Edit;
      default: return MessageSquare;
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'statement': return 'border-blue-200 hover:border-blue-300';
      case 'multiple-choice': return 'border-green-200 hover:border-green-300';
      case 'contact-form': return 'border-purple-200 hover:border-purple-300';
      case 'open-ended': return 'border-orange-200 hover:border-orange-300';
      default: return 'border-gray-200 hover:border-gray-300';
    }
  };

  const handleUseDefaultTemplate = async () => {
    await loadTemplate('general');
  };

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white min-h-screen">
        <div className="text-center px-4">
          <GitBranch className="h-16 w-16 text-indigo-200 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Chatbot</h3>
          <p className="text-slate-500 mb-4">Select a chatbot from the sidebar to manage its question flow.</p>
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
            <a href="/chatbots">Go to Chatbots</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 bg-gradient-to-br from-indigo-50 to-white min-h-screen">
        {/* Sticky Glassmorphism Header */}
        <header className="backdrop-blur-md bg-gradient-to-br from-indigo-50 to-white/80 border-b border-slate-200 px-4 sm:px-6 py-5 sticky top-0 z-20 shadow-lg">
          <div className="flex flex-col gap-4 max-w-7xl mx-auto">
            {/* Main Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <GitBranch className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Question Flow</h2>
                  <p className="text-slate-600 mt-1 text-sm sm:text-base">
                    Design the conversation logic for <span className="font-semibold">{activeChatbot.name}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <Button
                      id="question-flow-enabled-toggle"
                      type="button"
                      onClick={() => handleToggleQuestionFlow(!questionFlowEnabled)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                        questionFlowEnabled 
                          ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {questionFlowEnabled ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          <span className="hidden sm:inline">Question Flow Enabled</span>
                          <span className="sm:hidden">Enabled</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                          <span className="hidden sm:inline">Question Flow Disabled</span>
                          <span className="sm:hidden">Disabled</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowActionButtons(!showActionButtons)}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  {showActionButtons ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Hide Actions</span>
                      <span className="sm:hidden">Hide</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Show Actions</span>
                      <span className="sm:hidden">Show</span>
                    </>
                  )}
                </Button>
                
                <Button onClick={handleSave} disabled={updateChatbot.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {updateChatbot.isPending ? 'Saving...' : 'Save Flow'}
                </Button>
              </div>
            </div>

            {/* Collapsible Action Buttons */}
            {showActionButtons && (
              <div className="flex flex-wrap items-center gap-2 animate-in slide-in-from-top-2 duration-200">
                {questionFlow.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" onClick={startFlowTest} className="border-green-200 text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200">
                        <Play className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Test Flow</span>
                        <span className="sm:hidden">Test</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Test Flow</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setShowTemplatesDialog(true)} className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Templates</span>
                      <span className="sm:hidden">Templates</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Load Template</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleResetToDefault} className="border-orange-200 text-orange-700 hover:bg-orange-50 rounded-lg transition-all duration-200">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Reset</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={handleCreateNode} className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Question</span>
                      <span className="sm:hidden">Add</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Question</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setShowAddTemplateDialog(true)} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Add Custom Flow (JSON)</span>
                      <span className="sm:hidden">Custom JSON</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Paste custom question flow JSON</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" onClick={() => setShowExampleDialog(true)} className="border-gray-300 text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <Copy className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Show Example Format</span>
                      <span className="sm:hidden">Example</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show example JSON format</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </header>

        {/* Floating Add Button (mobile) */}
        <Button onClick={handleCreateNode} className="fixed bottom-8 right-8 z-30 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg p-4 lg:hidden">
          <Plus className="h-6 w-6" />
        </Button>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-10">
            {/* Flow Visualization */}
            <div className="xl:col-span-3">
              <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-white/80 via-white/90 to-white/80 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-400 rounded-l-2xl" />
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                    <GitBranch className="h-5 w-5 text-indigo-600" />
                    <span>Conversation Flow</span>
                  </CardTitle>
                  <p className="text-slate-600 text-sm">Visual representation of your chatbot's question flow</p>
                </CardHeader>
                <CardContent>
                  {questionFlow.length === 0 ? (
                    <div className="text-center py-16">
                      <GitBranch className="h-14 w-14 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No Question Flow</h3>
                      <p className="text-slate-500 mb-4">Create your first question to get started.</p>
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button onClick={handleCreateNode} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                          <Plus className="h-4 w-4 mr-2" /> Create First Question
                        </Button>
                        <Button variant="outline" onClick={handleUseDefaultTemplate} className="border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition-all duration-200">
                          Use Default Template
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {questionFlow.map((node) => {
                        const Icon = getNodeIcon(node.type);
                        return (
                          <div key={node.id} className="relative group transition-all duration-200 hover:scale-[1.01]">
                            <div className={`p-4 sm:p-6 rounded-2xl border-2 shadow-lg flex flex-col gap-2 bg-gradient-to-br from-white to-slate-50 ${getNodeColor(node.type)} transition-all duration-200 group-hover:shadow-xl`}> 
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 mt-0.5 opacity-80 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                      <Badge variant="secondary" className="text-xs font-semibold w-fit">
                                        {node.type.replace('-', ' ').toUpperCase()}
                                      </Badge>
                                      <span className="text-xs text-slate-400">ID: {node.id}</span>
                                    </div>
                                    <p className="font-semibold text-base sm:text-lg mb-2 leading-snug break-words">{node.question}</p>
                                    {node.options && (
                                      <div className="space-y-1">
                                        {node.options.map((option, optIndex) => (
                                          <div key={optIndex} className="text-xs bg-white/80 rounded-lg px-2 sm:px-3 py-1 sm:py-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 shadow-sm border border-slate-200">
                                            <span className="font-medium break-words">→ {option.text}</span>
                                            {option.nextId && <span className="text-slate-400 text-xs">(→ {option.nextId})</span>}
                                            {option.action && option.action !== 'continue' && (
                                              <Badge variant="outline" className="text-xs w-fit">
                                                {option.action}
                                              </Badge>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {node.nextId && !node.options && (
                                      <div className="text-xs text-slate-400">Next: {node.nextId}</div>
                                    )}
                                    {node.aiHandling && (
                                      <Badge variant="outline" className="mt-2 text-xs">AI Handling Enabled</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => handleEditNode(node)} title="Edit" className="rounded-lg hover:bg-slate-100 transition-all duration-200 p-1 sm:p-2">
                                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Edit</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNode(node.id)} title="Delete" className="rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-all duration-200 p-1 sm:p-2">
                                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete</TooltipContent>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                            {questionFlow.length - 1 > questionFlow.indexOf(node) && (
                              <div className="flex justify-center">
                                <ArrowRight className="h-6 w-6 text-slate-300 my-2" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column: Help/Guide, Best Practices */}
            <div className="space-y-6">
              {/* Question Types Guide */}
              <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-blue-50/60 via-white/80 to-blue-100/60 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-400 rounded-l-2xl" />
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    <span>Question Types</span>
                  </CardTitle>
                  <p className="text-slate-600 text-sm">Different types of questions you can create</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-blue-200">
                      <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900">Statement</p>
                        <p className="text-xs text-slate-600">Bot says something, continues to next question</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-green-200">
                      <HelpCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900">Multiple Choice</p>
                        <p className="text-xs text-slate-600">User picks from predefined options</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-purple-200">
                      <FileText className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900">Contact Form</p>
                        <p className="text-xs text-slate-600">Collects name, phone, and consent</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-orange-200">
                      <Edit className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900">Open Ended</p>
                        <p className="text-xs text-slate-600">User types free text, can trigger AI</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-green-50/60 via-white/80 to-green-100/60 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-400 rounded-l-2xl" />
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <span>Best Practices</span>
                  </CardTitle>
                  <p className="text-slate-600 text-sm">Tips for creating effective question flows</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900">Keep questions short and clear</p>
                        <p className="text-xs text-slate-600">Users prefer concise, easy-to-understand questions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900">Limit multiple choice to 3-4 options</p>
                        <p className="text-xs text-slate-600">Too many options can overwhelm users</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900">Use statements for important information</p>
                        <p className="text-xs text-slate-600">Highlight key details with statement nodes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-900">Always provide a way to contact humans</p>
                        <p className="text-xs text-slate-600">Include lead collection or support options</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flow Statistics */}
              <Card className="shadow-xl rounded-2xl border-0 bg-gradient-to-br from-purple-50/60 via-white/80 to-purple-100/60 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-400 rounded-l-2xl" />
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-slate-900 font-semibold text-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span>Flow Statistics</span>
                  </CardTitle>
                  <p className="text-slate-600 text-sm">Overview of your question flow</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm font-medium text-slate-900">Total Questions</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">{questionFlow.length}</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-slate-900">Flow Status</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {questionFlowEnabled ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-slate-900">Question Types</span>
                      </div>
                      <p className="text-sm text-slate-600">
                        {Array.from(new Set(questionFlow.map(node => node.type))).length} different types
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Node Creation/Edit Dialog */}
      <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Question Node' : 'Create Question Node'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nodeId">Node ID</Label>
                <Input
                  id="nodeId"
                  value={nodeForm.id}
                  onChange={(e) => setNodeForm(prev => ({ ...prev, id: e.target.value }))}
                  placeholder="unique-node-id"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nodeType">Question Type</Label>
                <Select
                  value={nodeForm.type}
                  onValueChange={(value: any) => setNodeForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="statement">Statement</SelectItem>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="contact-form">Contact Form</SelectItem>
                    <SelectItem value="open-ended">Open Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="question">Question/Message</Label>
              <Textarea
                id="question"
                value={nodeForm.question}
                onChange={(e) => setNodeForm(prev => ({ ...prev, question: e.target.value }))}
                placeholder="What message should the bot display?"
                rows={3}
              />
            </div>
            
            {nodeForm.type === 'multiple-choice' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Answer Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {nodeForm.options?.map((option, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Option {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Input
                        value={option.text}
                        onChange={(e) => updateOption(index, 'text', e.target.value)}
                        placeholder="Option text"
                      />
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Action</Label>
                          <Select
                            value={option.action || 'continue'}
                            onValueChange={(value) => updateOption(index, 'action', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="continue">Continue</SelectItem>
                              <SelectItem value="collect-lead">Collect Lead</SelectItem>
                              <SelectItem value="end-chat">End Chat</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {option.action === 'continue' && (
                          <div className="space-y-1">
                            <Label className="text-xs">Next Node ID</Label>
                            <Input
                              value={option.nextId || ''}
                              onChange={(e) => updateOption(index, 'nextId', e.target.value)}
                              placeholder="node-id"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(nodeForm.type === 'statement' || nodeForm.type === 'open-ended') && (
              <div className="space-y-2">
                <Label htmlFor="nextId">Next Node ID</Label>
                <Input
                  id="nextId"
                  value={nodeForm.nextId || ''}
                  onChange={(e) => setNodeForm(prev => ({ ...prev, nextId: e.target.value }))}
                  placeholder="Leave empty to end conversation"
                />
              </div>
            )}
            
            {nodeForm.type === 'open-ended' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="collectVariable">Variable Name (Optional)</Label>
                  <Input
                    id="collectVariable"
                    value={nodeForm.collectVariable || ''}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, collectVariable: e.target.value }))}
                    placeholder="e.g., user_inquiry"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="aiHandling"
                    checked={nodeForm.aiHandling || false}
                    onChange={(e) => setNodeForm(prev => ({ ...prev, aiHandling: e.target.checked }))}
                  />
                  <Label htmlFor="aiHandling">Enable AI response handling</Label>
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowNodeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNode}
              disabled={!nodeForm.id || !nodeForm.question}
            >
              {isEditing ? 'Update Node' : 'Create Node'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose a Business Template</DialogTitle>
            <p className="text-sm text-slate-600">
              Select a pre-built question flow designed for your business type
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {businessTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => loadTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${template.color}`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{template.name}</h3>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowTemplatesDialog(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Flow Tester Dialog */}
      <Dialog open={showFlowTester} onOpenChange={setShowFlowTester}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <span>Question Flow Tester</span>
            </DialogTitle>
            <p className="text-sm text-slate-600">
              Test how your question flow works in practice. This simulates the actual chat experience.
            </p>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mt-3 text-sm text-yellow-800">
              <strong>Note:</strong> AI responses cannot be generated in this flow tester. To check AI-powered responses, use the Chatbot Preview in the Appearance tab.
            </div>
          </DialogHeader>
          
          <div className="flex-1 flex min-h-0">
            {/* Chat Interface */}
            <div className="flex-1 flex flex-col border rounded-lg bg-gray-50">
              {/* Chat Header */}
              <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{activeChatbot?.name || 'Chatbot'}</h4>
                    <p className="text-xs text-slate-500">Testing Mode</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={resetFlowTest}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {flowTestMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border text-slate-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.options && message.options.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleOptionClick(option)}
                              className="block w-full text-left px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-slate-700 transition-colors"
                            >
                              {option.text}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="border-t bg-white p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTextInput()}
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <Button onClick={handleTextInput} disabled={!userInput.trim()}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Instructions Panel */}
            <div className="w-80 bg-white border-l p-4 overflow-y-auto">
              <h4 className="font-medium text-slate-900 mb-3">How to Test</h4>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900 mb-1">�� Chat Interface</p>
                  <p>This simulates exactly how users will interact with your chatbot on your website.</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-900 mb-1">🔘 Button Options</p>
                  <p>Click the buttons to follow predefined paths through your question flow.</p>
                </div>
                
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-900 mb-1">⌨️ Text Input</p>
                  <p>Type messages for open-ended questions or AI-handled responses.</p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-orange-900 mb-1">🔄 Reset</p>
                  <p>Use the Reset button to start the flow from the beginning.</p>
                </div>

                <div className="pt-3 border-t">
                  <h5 className="font-medium text-slate-900 mb-2">Current Flow</h5>
                  <div className="space-y-1">
                    {questionFlow.map((node) => (
                      <div key={node.id} className="text-xs p-2 bg-gray-50 rounded flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          node.id === currentNodeId ? 'bg-green-500' : 'bg-gray-300'
                        }`}></span>
                        <span className="truncate">{node.question}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-[425px] transition-all duration-300">
          <DialogHeader>
            <DialogTitle>Reset Question Flow</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-700">Are you sure you want to reset to the default question flow? This will replace your current flow.</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmResetToDefault}>Reset</Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog.open} onOpenChange={open => setShowDeleteDialog(s => ({ ...s, open }))}>
        <DialogContent className="sm:max-w-[425px] transition-all duration-300">
          <DialogHeader>
            <DialogTitle>Delete Question Node</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-slate-700">Are you sure you want to delete this question node?</div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog({ open: false })}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteNode}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Custom Template Dialog */}
      <Dialog open={showAddTemplateDialog} onOpenChange={setShowAddTemplateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Template (Paste JSON)</DialogTitle>
          </DialogHeader>
          <Textarea
            value={templateJson}
            onChange={e => setTemplateJson(e.target.value)}
            placeholder={`{
  "name": "My Custom Support Flow",
  "nodes": [
    {
      "id": "start",
      "type": "statement",
      "question": "Welcome! How can I help you today?",
      "nextId": "main-menu"
    },
    {
      "id": "main-menu",
      "type": "multiple-choice",
      "question": "Choose an option:",
      "options": [
        { "text": "Product Info", "nextId": "product-info" },
        { "text": "Contact Support", "nextId": "support" }
      ]
    },
    {
      "id": "product-info",
      "type": "open-ended",
      "question": "What would you like to know about our products?",
      "aiHandling": true
    },
    {
      "id": "support",
      "type": "contact-form",
      "question": "Please provide your contact information."
    }
  ]
}`}
            rows={10}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddTemplateDialog(false)}>Cancel</Button>
            <Button
              disabled={addTemplateLoading}
              onClick={async () => {
                setAddTemplateLoading(true);
                try {
                  const parsed = JSON.parse(templateJson);
                  if (!parsed.name || !Array.isArray(parsed.nodes)) {
                    toast({ title: 'Invalid template', description: 'Template must have a name and nodes array.', variant: 'destructive' });
                    setAddTemplateLoading(false);
                    return;
                  }
                  const response = await apiRequest('POST', '/api/question-templates', parsed);
                  if (response.ok) {
                    toast({ title: 'Template added', description: `Template "${parsed.name}" added successfully.` });
                    setShowAddTemplateDialog(false);
                    setTemplateJson('');
                    // Apply the template to the current chatbot
                    if (activeChatbot) {
                      await updateChatbot.mutateAsync({
                        id: activeChatbot.id,
                        data: {
                          questionFlow: parsed.nodes,
                          questionFlowEnabled: true,
                        },
                      });
                      toast({ title: 'Applied to chatbot', description: 'This template is now active for your chatbot.' });
                    }
                  } else {
                    const data = await response.json();
                    toast({ title: 'Error', description: data.message || 'Failed to add template.', variant: 'destructive' });
                  }
                } catch (err) {
                  toast({ title: 'Invalid JSON', description: 'Could not parse JSON.', variant: 'destructive' });
                } finally {
                  setAddTemplateLoading(false);
                }
              }}
            >
              {addTemplateLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Example Format Dialog */}
      <Dialog open={showExampleDialog} onOpenChange={setShowExampleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Custom Question Flow Example Format</DialogTitle>
          </DialogHeader>
          <div className="mb-4 text-slate-600 text-sm">
            Copy and modify this template to create your own custom flow.
          </div>
          <div className="relative bg-slate-100 rounded-lg p-4 font-mono text-xs text-slate-800 overflow-x-auto">
            <button
              className="absolute top-2 right-2 text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => navigator.clipboard.writeText(`{
  "name": "My Custom Flow",
  "welcome": "Welcome to my chatbot! How can I help you?",
  "nodes": [
    {
      "id": "start",
      "type": "multiple-choice",
      "question": "What would you like to do?",
      "options": [
        { "text": "Option 1", "nextId": "node2" },
        { "text": "Option 2", "nextId": "node3" }
      ]
    },
    {
      "id": "node2",
      "type": "statement",
      "question": "You chose option 1!",
      "nextId": "end"
    },
    {
      "id": "node3",
      "type": "open-ended",
      "question": "Please type your question.",
      "aiHandling": true,
      "nextId": "end"
    },
    {
      "id": "end",
      "type": "statement",
      "question": "Thank you for chatting!"
    }
  ]
}`)}
              title="Copy example JSON"
            >
              Copy
            </button>
            <pre className="whitespace-pre-wrap break-all">{`
{
  "name": "My Custom Flow",
  "welcome": "Welcome to my chatbot! How can I help you?",
  "nodes": [
    {
      "id": "start",
      "type": "multiple-choice",
      "question": "What would you like to do?",
      "options": [
        { "text": "Option 1", "nextId": "node2" },
        { "text": "Option 2", "nextId": "node3" }
      ]
    },
    {
      "id": "node2",
      "type": "statement",
      "question": "You chose option 1!",
      "nextId": "end"
    },
    {
      "id": "node3",
      "type": "open-ended",
      "question": "Please type your question.",
      "aiHandling": true,
      "nextId": "end"
    },
    {
      "id": "end",
      "type": "statement",
      "question": "Thank you for chatting!"
    }
  ]
}
`}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
