import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Loader2, CheckCircle2 } from 'lucide-react';

interface PDFExportProps {
  encounterData: {
    id: number;
    patientId: string;
    encounterType: string;
    date: string;
    transcriptionText?: string;
    summary?: {
      keyFindings: string[];
      diagnosis: string;
      differentialDiagnosis: Array<{
        condition: string;
        probability: number;
        reasoning: string;
      }>;
      reviewOfSystems: any;
      treatment: string;
    };
    emCoding?: {
      history: { level: number; description: string };
      exam: { level: number; description: string };
      mdm: { level: number; description: string };
      recommendedCode: string;
      confidence: number;
      rationale: string;
    };
    aiRecommendations?: string[];
    nextSteps?: string[];
    practitionerNotes?: string;
  };
  practitionerInfo?: {
    name: string;
    credentials: string;
    npi: string;
    facility: string;
  };
}

export default function PDFExport({ encounterData, practitionerInfo }: PDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create comprehensive patient summary document
      const pdfData = {
        encounter: encounterData,
        practitioner: practitionerInfo || {
          name: 'Dr. Healthcare Provider',
          credentials: 'MD',
          npi: '1234567890',
          facility: 'NexxusBridge Healthcare Center'
        },
        generatedAt: new Date().toISOString(),
        documentType: 'Clinical Encounter Summary',
        version: '1.0'
      };

      // Generate PDF using backend service
      const response = await fetch('/api/encounters/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `encounter-summary-${encounterData.patientId}-${encounterData.id}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      setLastGenerated(new Date());
      
    } catch (error) {
      // Handle error gracefully
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async () => {
    try {
      const response = await fetch('/api/encounters/preview-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          encounter: encounterData,
          practitioner: practitionerInfo
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      // Handle error gracefully
    }
  };

  const isDataComplete = () => {
    return !!(
      encounterData.transcriptionText && 
      encounterData.summary && 
      encounterData.emCoding
    );
  };

  const getCompletionPercentage = () => {
    let completed = 0;
    const total = 5;
    
    if (encounterData.transcriptionText) completed++;
    if (encounterData.summary) completed++;
    if (encounterData.emCoding) completed++;
    if (encounterData.aiRecommendations?.length) completed++;
    if (encounterData.nextSteps?.length) completed++;
    
    return Math.round((completed / total) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Patient Summary Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Status */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Document Completion</span>
            <span className="text-sm text-muted-foreground">
              {getCompletionPercentage()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant={encounterData.transcriptionText ? "default" : "secondary"}>
              Transcription
            </Badge>
            <Badge variant={encounterData.summary ? "default" : "secondary"}>
              Clinical Summary
            </Badge>
            <Badge variant={encounterData.emCoding ? "default" : "secondary"}>
              E/M Coding
            </Badge>
            <Badge variant={encounterData.aiRecommendations?.length ? "default" : "secondary"}>
              AI Recommendations
            </Badge>
            <Badge variant={encounterData.nextSteps?.length ? "default" : "secondary"}>
              Next Steps
            </Badge>
          </div>
        </div>

        {/* Document Preview Info */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Document Contents:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Patient ID:</span>
              <br />
              <span className="text-muted-foreground">{encounterData.patientId}</span>
            </div>
            <div>
              <span className="font-medium">Encounter Date:</span>
              <br />
              <span className="text-muted-foreground">{encounterData.date}</span>
            </div>
            <div>
              <span className="font-medium">Encounter Type:</span>
              <br />
              <span className="text-muted-foreground">{encounterData.encounterType}</span>
            </div>
            <div>
              <span className="font-medium">E/M Code:</span>
              <br />
              <span className="text-muted-foreground">
                {encounterData.emCoding?.recommendedCode || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Clinical Summary Preview */}
        {encounterData.summary && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Primary Diagnosis:</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
              {encounterData.summary.diagnosis}
            </p>
          </div>
        )}

        {/* ICD-10 and CPT Codes */}
        {encounterData.emCoding && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Medical Codes:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded">
                <span className="text-xs font-medium text-blue-700 dark:text-blue-300">CPT Code</span>
                <div className="text-sm font-mono">{encounterData.emCoding.recommendedCode}</div>
              </div>
              <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Confidence</span>
                <div className="text-sm">{encounterData.emCoding.confidence}%</div>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations Preview */}
        {encounterData.aiRecommendations && encounterData.aiRecommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Recommendations:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {encounterData.aiRecommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600" />
                  {rec}
                </li>
              ))}
              {encounterData.aiRecommendations.length > 3 && (
                <li className="text-xs text-muted-foreground">
                  +{encounterData.aiRecommendations.length - 3} more recommendations
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Export Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={previewPDF}
            variant="outline"
            className="flex-1"
            disabled={!isDataComplete()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Preview
          </Button>
          
          <Button
            onClick={generatePDF}
            disabled={isGenerating || !isDataComplete()}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>

        {/* Last Generated Info */}
        {lastGenerated && (
          <div className="text-xs text-muted-foreground text-center">
            Last generated: {lastGenerated.toLocaleString()}
          </div>
        )}

        {/* Incomplete Data Warning */}
        {!isDataComplete() && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">
                Complete the encounter to enable PDF export
              </span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Transcription, clinical summary, and E/M coding must be completed before generating the patient summary.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}