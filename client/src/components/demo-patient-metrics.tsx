import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Brain,
  Stethoscope
} from 'lucide-react';

interface DemoPatientMetricsProps {
  selectedPatient?: any;
  selectedEncounter?: any;
}

export default function DemoPatientMetrics({ selectedPatient, selectedEncounter }: DemoPatientMetricsProps) {
  if (!selectedPatient || !selectedEncounter) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Patient Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Select a patient to view AI analysis metrics
          </p>
        </CardContent>
      </Card>
    );
  }

  const getAgeFromBirthDate = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = getAgeFromBirthDate(selectedPatient.dateOfBirth);
  const confidence = selectedEncounter.summary?.confidence || Math.floor(92 + Math.random() * 8);
  const processingTime = 1.2 + Math.random() * 1.5;
  
  const getComplexityScore = () => {
    const conditions = selectedPatient.medicalHistory.split(',').length;
    const medications = selectedPatient.currentMedications === 'None' ? 0 : 
                      selectedPatient.currentMedications.split(',').length;
    const allergyCount = selectedPatient.allergies === 'None known' || selectedPatient.allergies === 'NKDA' ? 0 : 
                        selectedPatient.allergies.split(',').length;
    
    const complexityScore = (conditions * 2) + medications + allergyCount;
    
    if (complexityScore <= 3) return { level: 'Simple', score: 25, color: 'green' };
    if (complexityScore <= 7) return { level: 'Moderate', score: 60, color: 'yellow' };
    return { level: 'Complex', score: 90, color: 'red' };
  };

  const complexity = getComplexityScore();
  
  const getSpecialtyFromEncounter = () => {
    const type = selectedEncounter.encounterType.toLowerCase();
    if (type.includes('mental') || type.includes('psych')) return 'Mental Health';
    if (type.includes('cardio')) return 'Cardiology';
    if (type.includes('asthma') || type.includes('pulm')) return 'Pulmonology';
    if (age < 18) return 'Pediatrics';
    if (age >= 65) return 'Geriatrics';
    if (type.includes('chronic')) return 'Primary Care';
    return 'Primary Care';
  };

  const specialty = getSpecialtyFromEncounter();

  const riskFactors = [];
  if (selectedPatient.medicalHistory.includes('diabetes')) riskFactors.push('Diabetes');
  if (selectedPatient.medicalHistory.includes('hypertension')) riskFactors.push('Hypertension');
  if (selectedPatient.medicalHistory.includes('heart')) riskFactors.push('Cardiac Risk');
  if (age >= 65) riskFactors.push('Advanced Age');
  if (selectedPatient.allergies !== 'None known' && selectedPatient.allergies !== 'NKDA') {
    riskFactors.push('Drug Allergies');
  }

  return (
    <div className="space-y-4">
      {/* Patient Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>{selectedPatient.firstName} {selectedPatient.lastName}</span>
            </div>
            <Badge variant="outline">{specialty}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Age:</span> {age} years
            </div>
            <div>
              <span className="font-medium">Encounter:</span> {selectedEncounter.encounterType}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Chief Complaint:</span> {selectedEncounter.chiefComplaint || 'Not specified'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Analysis Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Diagnostic Confidence</span>
              <span className="text-sm font-bold">{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Case Complexity</span>
              <span className="text-sm font-bold">{complexity.level}</span>
            </div>
            <Progress 
              value={complexity.score} 
              className={`h-2 ${
                complexity.color === 'green' ? 'bg-green-100' :
                complexity.color === 'yellow' ? 'bg-yellow-100' : 'bg-red-100'
              }`} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 mr-1" />
              </div>
              <div className="text-lg font-bold">{processingTime.toFixed(1)}s</div>
              <div className="text-xs text-muted-foreground">Processing Time</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Activity className="h-4 w-4 mr-1" />
              </div>
              <div className="text-lg font-bold">97%</div>
              <div className="text-xs text-muted-foreground">Accuracy Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Clinical Risk Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {riskFactors.length > 0 ? (
            <div className="space-y-2">
              <div className="text-sm font-medium mb-2">Identified Risk Factors:</div>
              <div className="flex flex-wrap gap-2">
                {riskFactors.map((risk, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {risk}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">No significant risk factors identified</span>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm">
              <div className="font-medium mb-1">Current Medications:</div>
              <div className="text-muted-foreground">{selectedPatient.currentMedications}</div>
            </div>
            <div className="text-sm mt-2">
              <div className="font-medium mb-1">Known Allergies:</div>
              <div className="text-muted-foreground">{selectedPatient.allergies}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5" />
            <span>AI Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {selectedEncounter.aiPrediction?.warnings?.length > 0 ? (
              selectedEncounter.aiPrediction.warnings.map((warning: string, index: number) => (
                <div key={index} className="flex items-start space-x-2 text-amber-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>{warning}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>No clinical warnings identified</span>
              </div>
            )}
            
            {age < 18 && (
              <div className="flex items-start space-x-2 text-blue-600 mt-2">
                <Activity className="h-4 w-4 mt-0.5" />
                <span>Pediatric dosing verification recommended</span>
              </div>
            )}
            
            {complexity.level === 'Complex' && (
              <div className="flex items-start space-x-2 text-purple-600 mt-2">
                <Brain className="h-4 w-4 mt-0.5" />
                <span>Complex case - consider specialist consultation</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}