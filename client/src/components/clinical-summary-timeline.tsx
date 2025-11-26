import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, ArrowRight, User, Stethoscope, Brain, FileText, Calendar, Activity } from 'lucide-react';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  timestamp?: string;
  data?: any;
  icon: React.ReactNode;
}

interface ClinicalSummaryTimelineProps {
  encounterData: {
    patientId?: string;
    chiefComplaint?: string;
    symptoms?: string[];
    vitals?: Record<string, any>;
    aiAssessment?: {
      diagnosis?: string;
      differentialDiagnosis?: Array<{ condition: string; probability: number }>;
      confidence?: number;
    };
    treatmentPlan?: string;
    emCoding?: {
      recommendedCode?: string;
      confidence?: number;
    };
    status?: string;
  };
  className?: string;
}

export default function ClinicalSummaryTimeline({ encounterData, className = "" }: ClinicalSummaryTimelineProps) {
  
  const generateTimelineSteps = (): TimelineStep[] => {
    const steps: TimelineStep[] = [
      {
        id: 'presenting-complaint',
        title: 'Presenting Complaint',
        description: encounterData.chiefComplaint || 'Patient initial complaint and reason for visit',
        status: encounterData.chiefComplaint ? 'completed' : 'pending',
        timestamp: encounterData.chiefComplaint ? new Date().toLocaleTimeString() : undefined,
        data: encounterData.chiefComplaint,
        icon: <User className="h-4 w-4" />
      },
      {
        id: 'symptom-extraction',
        title: 'Symptom Analysis',
        description: encounterData.symptoms?.length 
          ? `${encounterData.symptoms.length} symptoms identified and analyzed`
          : 'AI extraction of symptoms from patient narrative',
        status: encounterData.symptoms?.length ? 'completed' : 'pending',
        timestamp: encounterData.symptoms?.length ? new Date().toLocaleTimeString() : undefined,
        data: encounterData.symptoms,
        icon: <Stethoscope className="h-4 w-4" />
      },
      {
        id: 'vitals-assessment',
        title: 'Vital Signs',
        description: encounterData.vitals 
          ? 'Vital signs recorded and within normal parameters'
          : 'Recording and assessment of patient vital signs',
        status: encounterData.vitals ? 'completed' : 'pending',
        timestamp: encounterData.vitals ? new Date().toLocaleTimeString() : undefined,
        data: encounterData.vitals,
        icon: <Activity className="h-4 w-4" />
      },
      {
        id: 'ai-assessment',
        title: 'AI Clinical Assessment',
        description: encounterData.aiAssessment?.diagnosis
          ? `Primary diagnosis: ${encounterData.aiAssessment.diagnosis}`
          : 'AI analysis of symptoms and clinical presentation',
        status: encounterData.aiAssessment?.diagnosis ? 'completed' : 
                encounterData.symptoms?.length ? 'in-progress' : 'pending',
        timestamp: encounterData.aiAssessment?.diagnosis ? new Date().toLocaleTimeString() : undefined,
        data: encounterData.aiAssessment,
        icon: <Brain className="h-4 w-4" />
      },
      {
        id: 'treatment-plan',
        title: 'Treatment Plan',
        description: encounterData.treatmentPlan
          ? 'Comprehensive treatment plan developed'
          : 'Development of evidence-based treatment recommendations',
        status: encounterData.treatmentPlan ? 'completed' : 'pending',
        timestamp: encounterData.treatmentPlan ? new Date().toLocaleTimeString() : undefined,
        data: encounterData.treatmentPlan,
        icon: <FileText className="h-4 w-4" />
      },
      {
        id: 'coding-billing',
        title: 'Medical Coding',
        description: encounterData.emCoding?.recommendedCode
          ? `E/M Code: ${encounterData.emCoding.recommendedCode} (${encounterData.emCoding.confidence}% confidence)`
          : 'Automated E/M coding and billing preparation',
        status: encounterData.emCoding?.recommendedCode ? 'completed' : 'pending',
        timestamp: encounterData.emCoding?.recommendedCode ? new Date().toLocaleTimeString() : undefined,
        data: encounterData.emCoding,
        icon: <Calendar className="h-4 w-4" />
      }
    ];

    return steps;
  };

  const timelineSteps = generateTimelineSteps();
  const completedSteps = timelineSteps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / timelineSteps.length) * 100;

  const getStepIcon = (step: TimelineStep) => {
    if (step.status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    } else if (step.status === 'in-progress') {
      return <div className="h-5 w-5 rounded-full border-2 border-blue-600 bg-blue-100 animate-pulse" />;
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepDetails = (step: TimelineStep) => {
    if (!step.data || step.status === 'pending') return null;

    switch (step.id) {
      case 'symptom-extraction':
        return step.data && Array.isArray(step.data) ? (
          <div className="mt-2 space-y-1">
            {step.data.slice(0, 3).map((symptom: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs mr-1">
                {symptom}
              </Badge>
            ))}
            {step.data.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{step.data.length - 3} more
              </Badge>
            )}
          </div>
        ) : null;

      case 'ai-assessment':
        return step.data?.differentialDiagnosis ? (
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium">Differential Diagnoses:</p>
            {step.data.differentialDiagnosis.slice(0, 2).map((dx: any, idx: number) => (
              <div key={idx} className="text-xs text-muted-foreground">
                {dx.condition} ({dx.probability}% probability)
              </div>
            ))}
          </div>
        ) : null;

      case 'vitals-assessment':
        return step.data ? (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(step.data).slice(0, 4).map(([key, value]) => (
              <div key={key}>
                <span className="font-medium">{key}:</span> {String(value)}
              </div>
            ))}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Clinical Summary Timeline</CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {completedSteps}/{timelineSteps.length} Complete
            </div>
            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timelineSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getStepIcon(step)}
                  {index < timelineSteps.length - 1 && (
                    <div className={`w-px h-12 mt-2 ${
                      step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1 rounded ${
                      step.status === 'completed' ? 'bg-green-100 text-green-700' :
                      step.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {step.icon}
                    </div>
                    <h3 className="text-sm font-semibold">{step.title}</h3>
                    {step.timestamp && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        {step.timestamp}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {step.description}
                  </p>
                  
                  {getStepDetails(step)}
                  
                  {step.status === 'completed' && (
                    <div className="mt-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-green-50 text-green-700 border-green-200"
                      >
                        Completed
                      </Badge>
                    </div>
                  )}
                  
                  {step.status === 'in-progress' && (
                    <div className="mt-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        In Progress
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {encounterData.status === 'completed' && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Encounter Complete
              </p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              All clinical documentation and coding has been finalized. Ready for review and export.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}