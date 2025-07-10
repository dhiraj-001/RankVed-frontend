import { useState } from 'react';
import { Save, Plus, Edit, Trash2, GitBranch, MessageSquare, HelpCircle, FileText, RotateCcw, Building2, ShoppingCart, Heart, Home, Play, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/app-context';
import { useUpdateChatbot } from '@/hooks/use-chatbots';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuestionNode {
  id: string;
  type: 'statement' | 'multiple-choice' | 'contact-form' | 'open-ended';
  question: string;
  options?: { text: string; nextId?: string; action?: 'continue' | 'collect-lead' | 'end-chat' }[];
  nextId?: string;
  collectVariable?: string;
  aiHandling?: boolean;
}

const defaultFlow: QuestionNode[] = [
  {
    id: 'start',
    type: 'statement',
    question: 'Welcome! How can we help you today?',
    nextId: 'main-menu'
  },
  {
    id: 'main-menu',
    type: 'multiple-choice',
    question: 'What can I help you with?',
    options: [
      { text: 'Product Information', nextId: 'product-info' },
      { text: 'Support', nextId: 'support' },
      { text: 'Contact Sales', action: 'collect-lead' }
    ]
  },
  {
    id: 'product-info',
    type: 'open-ended',
    question: 'What would you like to know about our products?',
    collectVariable: 'product_inquiry',
    aiHandling: true
  },
  {
    id: 'support',
    type: 'multiple-choice',
    question: 'What type of support do you need?',
    options: [
      { text: 'Technical Issue', nextId: 'tech-support' },
      { text: 'Account Help', nextId: 'account-help' },
      { text: 'Other', nextId: 'general-support' }
    ]
  },
  {
    id: 'tech-support',
    type: 'open-ended',
    question: 'Please describe your technical issue.',
    collectVariable: 'tech_issue',
    aiHandling: true
  },
  {
    id: 'account-help',
    type: 'contact-form',
    question: 'Please provide your contact information and we\'ll help with your account.',
  },
  {
    id: 'general-support',
    type: 'open-ended',
    question: 'How can we help you?',
    collectVariable: 'general_inquiry',
    aiHandling: true
  }
];

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
  const [showNodeDialog, setShowNodeDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
const [showDeleteDialog, setShowDeleteDialog] = useState<{ open: boolean; nodeId?: string }>({ open: false });

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
      const response = await fetch(`/api/sample-flows/${businessType}`);
      const template = await response.json();
      
      // Convert template to nodes format
      const templateNodes: QuestionNode[] = template.nodes.map((node: any) => ({
        ...node,
        id: node.id || generateId()
      }));
      
      setQuestionFlow(templateNodes);
      setShowTemplatesDialog(false);
      
      toast({
        title: "Template loaded",
        description: `${template.name || businessType} template has been applied to your chatbot.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load template. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!activeChatbot) {
      toast({
        title: 'Error',
        description: 'No active chatbot selected.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          questionFlow: questionFlow as any,
          questionFlowEnabled: activeChatbot.questionFlowEnabled,
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
    if (!activeChatbot) return;

    try {
      await updateChatbot.mutateAsync({
        id: activeChatbot.id,
        data: {
          questionFlowEnabled: enabled,
        },
      });
      
      toast({
        title: enabled ? 'Question flow enabled' : 'Question flow disabled',
        description: enabled 
          ? 'Question suggestions will appear as hints at the bottom of the chat.'
          : 'Question suggestions are now disabled.',
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
  const confirmResetToDefault = () => {
    setQuestionFlow(defaultFlow);
    toast({
      title: 'Flow reset',
      description: 'Question flow has been reset to default template.',
    });
    setShowResetDialog(false);
  };

  const handleCreateNode = () => {
    setNodeForm({
      id: generateId(),
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
    if (isEditing) {
      setQuestionFlow(prev => prev.map(node => 
        node.id === nodeForm.id ? nodeForm : node
      ));
    } else {
      setQuestionFlow(prev => [...prev, nodeForm]);
    }
    setShowNodeDialog(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    setShowDeleteDialog({ open: true, nodeId });
  };
  const confirmDeleteNode = () => {
    if (showDeleteDialog.nodeId) {
      setQuestionFlow(prev => prev.filter(node => node.id !== showDeleteDialog.nodeId));
    }
    setShowDeleteDialog({ open: false });
  };

  const addOption = () => {
    setNodeForm(prev => ({
      ...prev,
      options: [...(prev.options || []), { text: '', action: 'continue' }]
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
      case 'statement': return 'border-blue-200';
      case 'multiple-choice': return 'border-green-200';
      case 'contact-form': return 'border-purple-200';
      case 'open-ended': return 'border-orange-200';
      default: return 'border-gray-200';
    }
  };

  if (!activeChatbot) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Active Chatbot</h3>
          <p className="text-slate-500">Select a chatbot from the sidebar to manage its question flow.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        {/* Sticky Glassmorphism Header */}
        <header className="backdrop-blur-md bg-white/80 border-b border-slate-200 px-6 py-5 sticky top-0 z-20 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between max-w-7xl mx-auto gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Question Flow</h2>
              <p className="text-slate-500 mt-1 text-base font-normal">
                Design the conversation logic for <span className="font-semibold">{activeChatbot.name}</span>
              </p>
              <div className="flex items-center gap-3 mt-3">
                <Switch
                  id="question-flow-enabled"
                  checked={activeChatbot.questionFlowEnabled || false}
                  onCheckedChange={handleToggleQuestionFlow}
                />
                <Label htmlFor="question-flow-enabled" className="flex items-center gap-2">
                  <span>Enable Suggestions</span>
                  <Badge variant={activeChatbot.questionFlowEnabled ? "default" : "secondary"}>
                    {activeChatbot.questionFlowEnabled ? "Active" : "Disabled"}
                  </Badge>
                </Label>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {questionFlow.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={startFlowTest} className="rounded-full p-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 shadow">
                      <Play className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Test Flow</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={() => setShowTemplatesDialog(true)} className="rounded-full p-2">
                    <Building2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Load Template</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={handleResetToDefault} className="rounded-full p-2">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" onClick={handleCreateNode} className="rounded-full p-2">
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add Question</TooltipContent>
              </Tooltip>
              <Button onClick={handleSave} disabled={updateChatbot.isPending} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md">
                <Save className="h-5 w-5 mr-2" />
                {updateChatbot.isPending ? 'Saving...' : 'Save Flow'}
              </Button>
            </div>
          </div>
        </header>

        {/* Floating Add Button (mobile) */}
        <Button onClick={handleCreateNode} className="fixed bottom-8 right-8 z-30 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 lg:hidden">
          <Plus className="h-6 w-6" />
        </Button>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Flow Visualization */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <GitBranch className="h-6 w-6" /> Conversation Flow
                </CardTitle>
                <p className="text-base text-slate-500">Visual representation of your chatbot's question flow</p>
              </CardHeader>
              <CardContent>
                {questionFlow.length === 0 ? (
                  <div className="text-center py-16">
                    <GitBranch className="h-14 w-14 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No Question Flow</h3>
                    <p className="text-slate-500 mb-4">Create your first question to get started.</p>
                    <div className="space-x-2">
                      <Button onClick={handleCreateNode}>
                        <Plus className="h-5 w-5 mr-2" /> Create First Question
                      </Button>
                      <Button variant="outline" onClick={handleResetToDefault}>
                        Use Default Template
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {questionFlow.map((node, index) => {
                      const Icon = getNodeIcon(node.type);
                      return (
                        <div key={node.id} className="relative group transition-transform duration-200 hover:scale-[1.01]">
                          <div className={`p-6 rounded-2xl border-2 shadow-lg flex flex-col gap-2 bg-gradient-to-br from-white to-slate-50 ${getNodeColor(node.type)} transition-all duration-200 group-hover:shadow-xl group-hover:border-blue-300`}> 
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4 flex-1">
                                <Icon className="h-6 w-6 mt-0.5 opacity-80" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <Badge variant="secondary" className="text-xs font-semibold">
                                      {node.type.replace('-', ' ').toUpperCase()}
                                    </Badge>
                                    <span className="text-xs text-slate-400">ID: {node.id}</span>
                                  </div>
                                  <p className="font-semibold text-lg mb-2 leading-snug">{node.question}</p>
                                  {node.options && (
                                    <div className="space-y-1">
                                      {node.options.map((option, optIndex) => (
                                        <div key={optIndex} className="text-xs bg-white/80 rounded px-3 py-1 flex items-center gap-2 shadow-sm">
                                          <span className="font-medium">→ {option.text}</span>
                                          {option.nextId && <span className="text-slate-400">(→ {option.nextId})</span>}
                                          {option.action && option.action !== 'continue' && (
                                            <Badge variant="outline" className="ml-2 text-xs">
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
                              <div className="flex items-center gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditNode(node)} title="Edit" className="rounded-full">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteNode(node.id)} title="Delete" className="rounded-full">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
                          {index < questionFlow.length - 1 && (
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
          {/* Right Column: Collapsible Help/Guide, Best Practices, Flow Tester, etc. */}
          <div className="space-y-8">
            {/* Collapsible Help/Guide Panel */}
            <Card className="shadow border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <HelpCircle className="h-5 w-5 text-blue-600" /> Question Types
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Statement</p>
                      <p className="text-xs text-slate-600">Bot says something, continues to next question</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Multiple Choice</p>
                      <p className="text-xs text-slate-600">User picks from predefined options</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Contact Form</p>
                      <p className="text-xs text-slate-600">Collects name, phone, and consent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Edit className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Open Ended</p>
                      <p className="text-xs text-slate-600">User types free text, can trigger AI</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Best Practices */}
            <Card className="shadow border-0 bg-white/90">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-bold">
                  <Heart className="h-5 w-5 text-pink-500" /> Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Keep questions short and clear</li>
                  <li>• Limit multiple choice to 3-4 options</li>
                  <li>• Use statements for important information</li>
                  <li>• Test your flow from start to finish</li>
                  <li>• Always provide a way to contact humans</li>
                </ul>
              </CardContent>
            </Card>
            {/* Flow Tester (if previously present, restore here) */}
            {/* ...restore flow tester component and any dialogs/modals as before, styled to match the new look... */}
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
                  <p className="font-medium text-blue-900 mb-1">💬 Chat Interface</p>
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
                    {questionFlow.map((node, index) => (
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
    </TooltipProvider>
  );
}
