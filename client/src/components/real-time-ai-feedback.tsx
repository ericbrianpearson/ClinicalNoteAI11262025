import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Heart, Thermometer, Activity, Brain, Eye } from 'lucide-react';

interface ExtractedInsight {
  type: 'symptom' | 'vital' | 'condition' | 'diagnosis' | 'medication' | 'allergy';
  text: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface RealTimeAIFeedbackProps {
  transcriptionText: string;
  isActive: boolean;
}

export default function RealTimeAIFeedback({ transcriptionText, isActive }: RealTimeAIFeedbackProps) {
  const [extractedInsights, setExtractedInsights] = useState<ExtractedInsight[]>([]);
  const [processingStatus, setProcessingStatus] = useState<'idle' | 'processing' | 'complete'>('idle');

  // Medical keyword patterns for real-time extraction
  const medicalPatterns = {
    symptoms: [
      /\b(pain|ache|hurt|sore|discomfort|burning|throbbing|sharp|dull)\b/gi,
      /\b(fever|chills|hot|cold|sweating|night sweats)\b/gi,
      /\b(nausea|vomiting|diarrhea|constipation|bloating)\b/gi,
      /\b(headache|migraine|dizziness|vertigo|lightheaded)\b/gi,
      /\b(cough|wheeze|shortness of breath|chest tightness|dyspnea)\b/gi,
      /\b(fatigue|tired|exhausted|weakness|malaise)\b/gi,
      /\b(rash|itching|swelling|bruising|bleeding)\b/gi
    ],
    vitals: [
      /\b(blood pressure|BP|systolic|diastolic)\s+(\d+\/\d+|\d+)\b/gi,
      /\b(heart rate|pulse|HR)\s+(\d+)\b/gi,
      /\b(temperature|temp)\s+(\d+\.?\d*)\s*(degrees?|F|C)?\b/gi,
      /\b(oxygen saturation|O2 sat|SpO2)\s+(\d+)%?\b/gi,
      /\b(respiratory rate|RR)\s+(\d+)\b/gi,
      /\b(weight)\s+(\d+)\s*(lbs?|kg|pounds?)\b/gi
    ],
    conditions: [
      /\b(diabetes|diabetic|hyperglycemia|hypoglycemia)\b/gi,
      /\b(hypertension|high blood pressure|HTN)\b/gi,
      /\b(asthma|COPD|emphysema|bronchitis)\b/gi,
      /\b(depression|anxiety|panic|PTSD)\b/gi,
      /\b(arthritis|joint pain|inflammation)\b/gi,
      /\b(infection|bacterial|viral|fungal)\b/gi
    ],
    medications: [
      /\b(taking|prescribed|medication|drug|pill|tablet|capsule)\b/gi,
      /\b(ibuprofen|acetaminophen|aspirin|tylenol|advil)\b/gi,
      /\b(metformin|insulin|lisinopril|atorvastatin)\b/gi,
      /\b(albuterol|inhaler|nebulizer)\b/gi
    ]
  };

  // Extract insights from transcription text
  const extractInsights = (text: string): ExtractedInsight[] => {
    const insights: ExtractedInsight[] = [];
    const timestamp = Date.now();

    // Extract symptoms
    medicalPatterns.symptoms.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          insights.push({
            type: 'symptom',
            text: match.toLowerCase(),
            confidence: 0.85,
            priority: 'medium',
            timestamp
          });
        });
      }
    });

    // Extract vitals with higher confidence
    medicalPatterns.vitals.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          insights.push({
            type: 'vital',
            text: match,
            confidence: 0.95,
            priority: 'high',
            timestamp
          });
        });
      }
    });

    // Extract conditions
    medicalPatterns.conditions.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          insights.push({
            type: 'condition',
            text: match.toLowerCase(),
            confidence: 0.80,
            priority: 'high',
            timestamp
          });
        });
      }
    });

    // Extract medications
    medicalPatterns.medications.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          insights.push({
            type: 'medication',
            text: match.toLowerCase(),
            confidence: 0.75,
            priority: 'medium',
            timestamp
          });
        });
      }
    });

    return insights;
  };

  // Process transcription text in real-time
  useEffect(() => {
    if (!transcriptionText || !isActive) return;

    setProcessingStatus('processing');
    
    // Debounce processing to avoid excessive updates
    const timeoutId = setTimeout(() => {
      const newInsights = extractInsights(transcriptionText);
      
      // Merge with existing insights, avoiding duplicates
      setExtractedInsights(prev => {
        const combined = [...prev, ...newInsights];
        const unique = combined.filter((insight, index, arr) => 
          arr.findIndex(i => i.text === insight.text && i.type === insight.type) === index
        );
        return unique.slice(-20); // Keep last 20 insights
      });
      
      setProcessingStatus('complete');
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [transcriptionText, isActive]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'vital': return <Heart className="h-4 w-4" />;
      case 'symptom': return <Activity className="h-4 w-4" />;
      case 'condition': return <AlertTriangle className="h-4 w-4" />;
      case 'medication': return <Brain className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getInsightColor = (type: string, priority: string) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  };

  if (!isActive) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">Real-Time AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Start recording to see live AI insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Real-Time AI Analysis
          {processingStatus === 'processing' && (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full"></div>
              <span className="text-xs text-muted-foreground">Processing...</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {extractedInsights.length === 0 ? (
          <p className="text-sm text-muted-foreground">Listening for medical terms...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Symptoms:</span> {extractedInsights.filter(i => i.type === 'symptom').length}
              </div>
              <div>
                <span className="font-medium">Vitals:</span> {extractedInsights.filter(i => i.type === 'vital').length}
              </div>
              <div>
                <span className="font-medium">Conditions:</span> {extractedInsights.filter(i => i.type === 'condition').length}
              </div>
              <div>
                <span className="font-medium">Medications:</span> {extractedInsights.filter(i => i.type === 'medication').length}
              </div>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {extractedInsights
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10)
                .map((insight, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div className={`p-1 rounded ${getInsightColor(insight.type, insight.priority)}`}>
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{insight.text}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs h-5">
                          {insight.type}
                        </Badge>
                        <Progress value={insight.confidence * 100} className="h-1 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}