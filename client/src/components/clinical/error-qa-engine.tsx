// This module handles error detection and QA for demo purposes. Replace with advanced NLP when scaling.
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Info,
  Shield,
  FileText,
  Clock
} from 'lucide-react';

interface QAError {
  id: string;
  type: 'critical' | 'warning' | 'suggestion';
  category: 'missing_field' | 'terminology' | 'incomplete_data' | 'safety';
  title: string;
  description: string;
  field?: string;
  suggestion?: string;
  timestamp: Date;
}

interface ErrorQAEngineProps {
  transcriptionText?: string;
  chiefComplaint?: string;
  vitals?: Record<string, any>;
  allergies?: string;
  medications?: string;
  onErrorsDetected?: (errors: QAError[]) => void;
  showModal?: boolean;
}

// Mock medical terminology dictionary for demo
const MEDICAL_TERMS = [
  'hypertension', 'diabetes', 'copd', 'asthma', 'pneumonia',
  'myocardial', 'infarction', 'angina', 'dyspnea', 'tachycardia',
  'bradycardia', 'arrhythmia', 'syncope', 'edema', 'murmur'
];

function detectErrors(data: ErrorQAEngineProps): QAError[] {
  const errors: QAError[] = [];
  const text = String(data.transcriptionText || '').toLowerCase();
  const complaint = String(data.chiefComplaint || '').toLowerCase();

  // Critical: Missing allergies for certain complaints
  if ((complaint.includes('chest pain') || complaint.includes('shortness of breath')) && !data.allergies) {
    errors.push({
      id: 'missing-allergies',
      type: 'critical',
      category: 'missing_field',
      title: 'Missing Allergy Information',
      description: 'Allergy information is required for patients with cardiovascular symptoms',
      field: 'allergies',
      suggestion: 'Please document known allergies or mark as "NKDA" (No Known Drug Allergies)',
      timestamp: new Date()
    });
  }

  // Critical: Missing vital signs for chest pain
  if (complaint.includes('chest pain') && (!data.vitals || Object.keys(data.vitals).length === 0)) {
    errors.push({
      id: 'missing-vitals',
      type: 'critical',
      category: 'missing_field',
      title: 'Missing Vital Signs',
      description: 'Vital signs are mandatory for chest pain evaluation',
      field: 'vitals',
      suggestion: 'Document blood pressure, heart rate, respiratory rate, and oxygen saturation',
      timestamp: new Date()
    });
  }

  // Warning: Incomplete transcription
  if (text.includes('...') || text.includes('[inaudible]') || text.length < 50) {
    errors.push({
      id: 'incomplete-transcription',
      type: 'warning',
      category: 'incomplete_data',
      title: 'Incomplete Transcription',
      description: 'Transcription appears incomplete or contains unclear sections',
      suggestion: 'Review audio recording and complete missing information',
      timestamp: new Date()
    });
  }

  // Warning: Potential medication interaction (demo logic)
  if (data.medications && text.includes('warfarin') && text.includes('aspirin')) {
    errors.push({
      id: 'drug-interaction',
      type: 'warning',
      category: 'safety',
      title: 'Potential Drug Interaction',
      description: 'Possible interaction between warfarin and aspirin detected',
      suggestion: 'Verify dosages and consider bleeding risk assessment',
      timestamp: new Date()
    });
  }

  // Suggestion: Medical terminology check
  const words = text.split(/\s+/);
  const medicalTermsUsed = words.filter(word => MEDICAL_TERMS.some(term => 
    word.includes(term) && word !== term
  ));
  
  if (medicalTermsUsed.length > 0) {
    errors.push({
      id: 'terminology-check',
      type: 'suggestion',
      category: 'terminology',
      title: 'Medical Terminology Review',
      description: `Review medical terms for accuracy: ${medicalTermsUsed.slice(0, 3).join(', ')}`,
      suggestion: 'Verify spelling and usage of medical terminology',
      timestamp: new Date()
    });
  }

  // Warning: Missing follow-up plan for chronic conditions
  if ((text.includes('diabetes') || text.includes('hypertension')) && !text.includes('follow')) {
    errors.push({
      id: 'missing-followup',
      type: 'warning',
      category: 'missing_field',
      title: 'Missing Follow-up Plan',
      description: 'Chronic condition management requires documented follow-up plan',
      suggestion: 'Add follow-up schedule and monitoring recommendations',
      timestamp: new Date()
    });
  }

  return errors;
}

function getErrorIcon(type: string) {
  switch (type) {
    case 'critical': return XCircle;
    case 'warning': return AlertTriangle;
    case 'suggestion': return Info;
    default: return Info;
  }
}

function getErrorColor(type: string): string {
  switch (type) {
    case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950';
    case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
    case 'suggestion': return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
    default: return 'border-gray-300 bg-gray-50 dark:bg-gray-950';
  }
}

function getBadgeColor(type: string): string {
  switch (type) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'suggestion': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export default function ErrorQAEngine(props: ErrorQAEngineProps) {
  const [errors, setErrors] = useState<QAError[]>([]);
  const [auditTrail, setAuditTrail] = useState<QAError[]>([]);

  useEffect(() => {
    const detectedErrors = detectErrors(props);
    setErrors(detectedErrors);
    setAuditTrail(prev => [...prev, ...detectedErrors]);
    
    if (props.onErrorsDetected) {
      props.onErrorsDetected(detectedErrors);
    }
  }, [props.transcriptionText, props.chiefComplaint, props.vitals, props.allergies, props.medications]);

  const criticalErrors = errors.filter(e => e.type === 'critical');
  const warnings = errors.filter(e => e.type === 'warning');
  const suggestions = errors.filter(e => e.type === 'suggestion');

  const resolveError = (errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Quality Assurance
        </h3>
        <div className="flex items-center gap-2">
          {criticalErrors.length === 0 && warnings.length === 0 ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Passed QA
            </Badge>
          ) : (
            <Badge variant="destructive">
              {criticalErrors.length + warnings.length} Issues
            </Badge>
          )}
        </div>
      </div>

      {criticalErrors.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical errors detected:</strong> These must be resolved before finalizing the encounter.
          </AlertDescription>
        </Alert>
      )}

      {/* Critical Errors */}
      {criticalErrors.map((error) => {
        const IconComponent = getErrorIcon(error.type);
        return (
          <Card key={error.id} className={`${getErrorColor(error.type)} border-l-4`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">
                    {error.title}
                  </CardTitle>
                </div>
                <Badge className={getBadgeColor(error.type)}>
                  {error.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-3">
                {error.description}
              </CardDescription>
              {error.suggestion && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                  <strong>Suggestion:</strong> {error.suggestion}
                </div>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => resolveError(error.id)}
                className="text-xs"
              >
                Mark as Resolved
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Warnings and Suggestions */}
      {[...warnings, ...suggestions].map((error) => {
        const IconComponent = getErrorIcon(error.type);
        return (
          <Card key={error.id} className={`${getErrorColor(error.type)} border-l-4`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <CardTitle className="text-sm font-medium">
                    {error.title}
                  </CardTitle>
                </div>
                <Badge className={getBadgeColor(error.type)}>
                  {error.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-sm mb-3">
                {error.description}
              </CardDescription>
              {error.suggestion && (
                <div className="text-xs text-muted-foreground mb-3">
                  <strong>Suggestion:</strong> {error.suggestion}
                </div>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => resolveError(error.id)}
                className="text-xs"
              >
                Acknowledge
              </Button>
            </CardContent>
          </Card>
        );
      })}

      {errors.length === 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Quality check passed</span>
            </div>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">
              No errors detected. Encounter is ready for finalization.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail Summary */}
      {auditTrail.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              QA Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3 w-3" />
                Total checks performed: {auditTrail.length}
              </div>
              <div>Last check: {new Date().toLocaleTimeString()}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}