import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, Sparkles, Target, Zap, Users, ShoppingCart, Headphones, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useApp } from '@/contexts/app-context';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 0,
    title: 'Welcome to RankVed AI',
    description: 'Let\'s personalize your chatbot experience',
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    id: 1,
    title: 'Tell us about your business',
    description: 'Help us understand your industry and needs',
    icon: <Target className="h-6 w-6" />
  },
  {
    id: 2,
    title: 'Define your goals',
    description: 'What do you want to achieve with your chatbot?',
    icon: <Zap className="h-6 w-6" />
  },
  {
    id: 3,
    title: 'AI Recommendations',
    description: 'Based on your answers, here are our suggestions',
    icon: <BarChart3 className="h-6 w-6" />
  }
];

const businessTypes = [
  { value: 'ecommerce', label: 'E-commerce & Retail', icon: <ShoppingCart className="h-4 w-4" /> },
  { value: 'service', label: 'Service Business', icon: <Headphones className="h-4 w-4" /> },
  { value: 'saas', label: 'SaaS & Technology', icon: <Zap className="h-4 w-4" /> },
  { value: 'healthcare', label: 'Healthcare', icon: <Users className="h-4 w-4" /> },
  { value: 'education', label: 'Education', icon: <Target className="h-4 w-4" /> },
  { value: 'finance', label: 'Finance & Banking', icon: <BarChart3 className="h-4 w-4" /> },
  { value: 'nonprofit', label: 'Non-profit', icon: <Sparkles className="h-4 w-4" /> },
  { value: 'other', label: 'Other', icon: <Target className="h-4 w-4" /> }
];

const goals = [
  { id: 'lead_generation', label: 'Generate leads', description: 'Capture visitor information and convert them into leads' },
  { id: 'customer_support', label: 'Customer support', description: 'Provide instant help and answer common questions' },
  { id: 'sales_assistance', label: 'Sales assistance', description: 'Guide customers through purchasing decisions' },
  { id: 'appointment_booking', label: 'Appointment booking', description: 'Schedule meetings and appointments automatically' },
  { id: 'product_recommendations', label: 'Product recommendations', description: 'Suggest products based on customer needs' },
  { id: 'feedback_collection', label: 'Feedback collection', description: 'Gather customer feedback and reviews' }
];

export default function Onboarding() {
  const { user, setUser } = useApp();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    businessType: '',
    businessDescription: '',
    primaryGoals: [] as string[],
    companySize: '',
    currentChallenges: ''
  });
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);

  // Initialize from user data if available
  useEffect(() => {
    if (user) {
      setCurrentStep(user.onboardingStep || 0);
      setFormData(prev => ({
        ...prev,
        businessType: user.businessType || '',
        primaryGoals: user.primaryGoals || []
      }));
    }
  }, [user]);

  const generateAIRecommendations = async () => {
    setIsGeneratingRecommendations(true);
    try {
      const response = await fetch('/api/onboarding/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const recommendations = await response.json();
        setAiRecommendations(recommendations);
      }
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleNext = async () => {
    // Save current step data
    if (user) {
      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onboardingStep: currentStep + 1,
            businessType: formData.businessType,
            primaryGoals: formData.primaryGoals
          })
        });
      } catch (error) {
        console.error('Failed to save onboarding progress:', error);
      }
    }

    if (currentStep === 3) {
      // Generate AI recommendations before moving to final step
      await generateAIRecommendations();
    }

    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (user) {
      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            onboardingCompleted: true,
            onboardingStep: onboardingSteps.length,
            personalizedRecommendations: aiRecommendations
          })
        });
        
        setUser({ ...user, onboardingCompleted: true });
        
        toast({
          title: 'Welcome aboard!',
          description: 'Your personalized chatbot experience is ready.',
        });
        
        setLocation('/dashboard');
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to complete onboarding. Please try again.',
          variant: 'destructive'
        });
      }
    }
  };

  const handleGoalToggle = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      primaryGoals: prev.primaryGoals.includes(goalId)
        ? prev.primaryGoals.filter(g => g !== goalId)
        : [...prev.primaryGoals, goalId]
    }));
  };

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to RankVed AI!</h2>
              <p className="text-slate-600 max-w-md mx-auto">
                We'll help you create the perfect chatbot experience tailored to your business needs. 
                This quick setup will take just 2-3 minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 border rounded-lg">
                <Target className="h-6 w-6 text-blue-500 mb-2" />
                <h3 className="font-medium mb-1">Personalized Setup</h3>
                <p className="text-sm text-slate-600">Tailored to your industry and goals</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Zap className="h-6 w-6 text-green-500 mb-2" />
                <h3 className="font-medium mb-1">AI Recommendations</h3>
                <p className="text-sm text-slate-600">Smart suggestions based on your needs</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Users className="h-6 w-6 text-purple-500 mb-2" />
                <h3 className="font-medium mb-1">Expert Guidance</h3>
                <p className="text-sm text-slate-600">Best practices from industry experts</p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Tell us about your business</h2>
              <p className="text-slate-600">This helps us understand your specific needs and industry requirements.</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>What type of business do you run?</Label>
                <Select value={formData.businessType} onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Briefly describe your business</Label>
                <Textarea
                  placeholder="e.g., We sell eco-friendly home products online and focus on sustainable living..."
                  value={formData.businessDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label>Company size</Label>
                <Select value={formData.companySize} onValueChange={(value) => setFormData(prev => ({ ...prev, companySize: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Just me (1)</SelectItem>
                    <SelectItem value="small">Small team (2-10)</SelectItem>
                    <SelectItem value="medium">Medium business (11-50)</SelectItem>
                    <SelectItem value="large">Large business (51+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">What are your primary goals?</h2>
              <p className="text-slate-600">Select all that apply. We'll optimize your chatbot for these objectives.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map(goal => (
                <Card 
                  key={goal.id} 
                  className={`cursor-pointer transition-all ${
                    formData.primaryGoals.includes(goal.id) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleGoalToggle(goal.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        checked={formData.primaryGoals.includes(goal.id)}
                        onChange={() => handleGoalToggle(goal.id)}
                      />
                      <div>
                        <h3 className="font-medium">{goal.label}</h3>
                        <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Your Personalized Recommendations</h2>
              <p className="text-slate-600">Based on your answers, here's what we suggest to get you started.</p>
            </div>
            
            {isGeneratingRecommendations ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Generating your personalized recommendations...</p>
              </div>
            ) : aiRecommendations ? (
              <div className="space-y-4">
                {aiRecommendations.suggestions?.map((suggestion: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        {suggestion.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-3">{suggestion.description}</p>
                      {suggestion.actionItems && (
                        <ul className="space-y-2">
                          {suggestion.actionItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600">Click next to generate your recommendations!</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.businessType && formData.businessDescription;
      case 2:
        return formData.primaryGoals.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStep + 1} of {onboardingSteps.length}
            </span>
            <span className="text-sm text-slate-600">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {onboardingSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index <= currentStep 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-slate-300 text-slate-300'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < onboardingSteps.length - 1 && (
                  <ChevronRight className={`h-4 w-4 mx-2 ${
                    index < currentStep ? 'text-blue-500' : 'text-slate-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="max-w-3xl mx-auto">
          <CardContent className="p-8">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isGeneratingRecommendations}
                className="flex items-center gap-2"
              >
                {currentStep === onboardingSteps.length - 1 ? 'Complete Setup' : 'Next'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}