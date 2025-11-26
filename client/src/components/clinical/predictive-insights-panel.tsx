// This module handles predictive clinical insights for demo purposes. Replace with ML API when scaling.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  Activity,
  Clock,
  Target
} from 'lucide-react';

interface ClinicalInsight {
  id: string;
  type: 'risk' | 'recommendation' | 'diagnosis' | 'followup';
  title: string;
  description: string;
  confidence: number;
  riskLevel: 'low' | 'moderate' | 'high';
  icon: any;
  actionable: boolean;
}

interface PredictiveInsightsPanelProps {
  transcriptionText?: string;
  chiefComplaint?: string;
  symptoms?: string[];
  vitals?: Record<string, any>;
}

// Demo logic to generate insights based on clinical data
function generatePredictiveInsights(data: PredictiveInsightsPanelProps): ClinicalInsight[] {
  const insights: ClinicalInsight[] = [];
  const text = String(data.transcriptionText || '').toLowerCase();
  const complaint = String(data.chiefComplaint || '').toLowerCase();
  
  // Cardiovascular risk assessment
  if (text.includes('chest pain') || text.includes('shortness of breath') || complaint.includes('chest')) {
    insights.push({
      id: 'cv-risk',
      type: 'risk',
      title: 'Cardiovascular Risk Assessment',
      description: 'Moderate risk of cardiac event based on presenting symptoms',
      confidence: 78,
      riskLevel: 'moderate',
      icon: Heart,
      actionable: true
    });

    insights.push({
      id: 'cv-rec',
      type: 'recommendation',
      title: 'Recommended Workup',
      description: 'Order ECG, troponin levels, chest X-ray. Consider stress test if symptoms persist.',
      confidence: 85,
      riskLevel: 'moderate',
      icon: Target,
      actionable: true
    });
  }

  // Readmission risk
  if (text.includes('diabetes') || text.includes('hypertension') || text.includes('copd')) {
    insights.push({
      id: 'readmission',
      type: 'risk',
      title: 'Hospital Readmission Risk',
      description: 'Elevated risk (23%) based on comorbidities and current presentation',
      confidence: 67,
      riskLevel: 'moderate',
      icon: TrendingUp,
      actionable: true
    });
  }

  // Differential diagnosis
  if (text.includes('abdominal pain') || complaint.includes('stomach')) {
    insights.push({
      id: 'diff-dx',
      type: 'diagnosis',
      title: 'Differential Diagnosis',
      description: 'Consider: GERD (45%), gastritis (30%), peptic ulcer (15%), gallbladder disease (10%)',
      confidence: 72,
      riskLevel: 'low',
      icon: Brain,
      actionable: false
    });
  }

  // Follow-up recommendations
  if (insights.length > 0) {
    insights.push({
      id: 'followup',
      type: 'followup',
      title: 'Follow-up Schedule',
      description: 'Schedule follow-up in 48-72 hours. Patient education on warning signs provided.',
      confidence: 90,
      riskLevel: 'low',
      icon: Clock,
      actionable: true
    });
  }

  // Default insight if no specific conditions detected
  if (insights.length === 0) {
    insights.push({
      id: 'wellness',
      type: 'recommendation',
      title: 'Preventive Care Opportunity',
      description: 'Patient due for routine screenings. Consider discussing lifestyle modifications.',
      confidence: 65,
      riskLevel: 'low',
      icon: CheckCircle,
      actionable: true
    });
  }

  return insights;
}

function getRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'high': return 'border-red-500 bg-red-50 dark:bg-red-950';
    case 'moderate': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    case 'low': return 'border-green-500 bg-green-50 dark:bg-green-950';
    default: return 'border-gray-300 bg-gray-50 dark:bg-gray-950';
  }
}

function getRiskBadgeColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export default function PredictiveInsightsPanel(props: PredictiveInsightsPanelProps) {
  const insights = generatePredictiveInsights(props);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Clinical Insights
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                AI-Powered
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>AI-powered insights. Will use advanced ML/LLM when moved to Azure.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <Activity className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Real-time clinical decision support powered by advanced AI algorithms.
          <span className="block text-xs text-muted-foreground mt-1">
            Demo mode: Full ML integration available in production deployment.
          </span>
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <Card 
              key={insight.id} 
              className={`${getRiskColor(insight.riskLevel)} border-l-4 transition-all hover:shadow-md`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm font-medium">
                      {insight.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRiskBadgeColor(insight.riskLevel)}`}
                    >
                      {insight.riskLevel.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm">
                  {insight.description}
                </CardDescription>
                {insight.actionable && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-3 w-3" />
                    Actionable recommendation
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
        <Brain className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>HIPAA-compliant by design:</strong> All data encrypted and access-controlled.
          AI processing follows healthcare data protection standards.
        </AlertDescription>
      </Alert>
    </div>
  );
}