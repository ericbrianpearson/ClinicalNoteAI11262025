import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  BarChart3, 
  CheckCircle2,
  AlertTriangle,
  Brain,
  FileText,
  Clock
} from 'lucide-react';

interface DemoAnalyticsSummaryProps {
  className?: string;
}

export default function DemoAnalyticsSummary({ className = '' }: DemoAnalyticsSummaryProps) {
  // Comprehensive demo analytics data
  const demoAnalytics = {
    patientDemographics: {
      total: 16,
      pediatric: 2,
      youngAdult: 2,
      adult: 8,
      elderly: 4
    },
    encounterMetrics: {
      total: 24,
      avgProcessingTime: 1.8,
      avgConfidence: 94.2,
      specialtiesRepresented: 14
    },
    clinicalCoverage: [
      { specialty: 'Primary Care', encounters: 6, coverage: 100 },
      { specialty: 'Cardiology', encounters: 3, coverage: 95 },
      { specialty: 'Mental Health', encounters: 3, coverage: 92 },
      { specialty: 'Pediatrics', encounters: 2, coverage: 98 },
      { specialty: 'Geriatrics', encounters: 2, coverage: 89 },
      { specialty: 'Pulmonology', encounters: 2, coverage: 96 },
      { specialty: 'Endocrinology', encounters: 2, coverage: 94 },
      { specialty: 'Neurology', encounters: 1, coverage: 91 },
      { specialty: 'Rheumatology', encounters: 1, coverage: 87 },
      { specialty: 'Oncology', encounters: 1, coverage: 93 },
      { specialty: 'Pain Management', encounters: 1, coverage: 88 }
    ],
    aiPerformance: {
      diagnosticAccuracy: 94.2,
      codingAccuracy: 96.8,
      processingSpeed: 1.8,
      errorDetection: 97.1
    },
    complexityDistribution: {
      simple: 6,
      moderate: 12,
      complex: 6
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Demo Dataset Analytics</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive clinical diversity and AI performance metrics
          </p>
        </CardHeader>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{demoAnalytics.patientDemographics.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clinical Encounters</p>
                <p className="text-2xl font-bold">{demoAnalytics.encounterMetrics.total}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg AI Confidence</p>
                <p className="text-2xl font-bold">{demoAnalytics.encounterMetrics.avgConfidence}%</p>
              </div>
              <Brain className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Processing Speed</p>
                <p className="text-2xl font-bold">{demoAnalytics.encounterMetrics.avgProcessingTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Patient Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {demoAnalytics.patientDemographics.pediatric}
              </div>
              <div className="text-sm text-muted-foreground">Pediatric (&lt;18)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {demoAnalytics.patientDemographics.youngAdult}
              </div>
              <div className="text-sm text-muted-foreground">Young Adult (18-29)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {demoAnalytics.patientDemographics.adult}
              </div>
              <div className="text-sm text-muted-foreground">Adult (30-64)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {demoAnalytics.patientDemographics.elderly}
              </div>
              <div className="text-sm text-muted-foreground">Elderly (65+)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialty Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clinical Specialty Coverage</CardTitle>
          <p className="text-sm text-muted-foreground">
            AI accuracy across {demoAnalytics.encounterMetrics.specialtiesRepresented} medical specialties
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoAnalytics.clinicalCoverage.map((specialty, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{specialty.specialty}</span>
                    <Badge variant="outline" className="text-xs">
                      {specialty.encounters} encounters
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{specialty.coverage}%</span>
                    {specialty.coverage >= 95 ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : specialty.coverage >= 90 ? (
                      <Activity className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </div>
                <Progress 
                  value={specialty.coverage} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Diagnostic Accuracy</span>
                  <span className="text-sm font-bold">{demoAnalytics.aiPerformance.diagnosticAccuracy}%</span>
                </div>
                <Progress value={demoAnalytics.aiPerformance.diagnosticAccuracy} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Coding Accuracy</span>
                  <span className="text-sm font-bold">{demoAnalytics.aiPerformance.codingAccuracy}%</span>
                </div>
                <Progress value={demoAnalytics.aiPerformance.codingAccuracy} className="h-2" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Error Detection</span>
                  <span className="text-sm font-bold">{demoAnalytics.aiPerformance.errorDetection}%</span>
                </div>
                <Progress value={demoAnalytics.aiPerformance.errorDetection} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Processing Speed</span>
                  <span className="text-sm font-bold">{demoAnalytics.aiPerformance.processingSpeed}s avg</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complexity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Case Complexity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {demoAnalytics.complexityDistribution.simple}
              </div>
              <div className="text-sm text-muted-foreground">Simple Cases</div>
              <Badge variant="outline" className="text-xs">Routine visits</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {demoAnalytics.complexityDistribution.moderate}
              </div>
              <div className="text-sm text-muted-foreground">Moderate Cases</div>
              <Badge variant="outline" className="text-xs">Standard management</Badge>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">
                {demoAnalytics.complexityDistribution.complex}
              </div>
              <div className="text-sm text-muted-foreground">Complex Cases</div>
              <Badge variant="outline" className="text-xs">Multi-morbidity</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}