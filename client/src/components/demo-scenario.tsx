import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, User, Clock, FileText } from "lucide-react";
import TranscriptionResults from "./transcription-results";
import SummaryResults from "./summary-results";
import EMCodingResults from "./em-coding-results";

export default function DemoScenario() {
  const [showDemo, setShowDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Enhanced clinical scenario data with diversity
  const demoData = {
    patient: {
      id: "P-001",
      name: "Emma Rodriguez",
      age: 6,
      gender: "Female"
    },
    encounter: {
      type: "Sick Visit",
      date: "2024-12-15",
      chiefComplaint: "Fever and ear pain"
    },
    transcription: {
      text: `Chief complaint: 6-year-old Hispanic female presents with mother reporting 2 days of fever up to 102.5F, left ear pain, and decreased appetite. Child has been tugging at left ear and crying more than usual. No vomiting, diarrhea, or respiratory symptoms. Patient appears uncomfortable but alert and responsive. Temperature 101.8F, other vitals stable. Left tympanic membrane erythematous and bulging with poor mobility on pneumatic otoscopy. Right ear normal. Throat mildly erythematous, no exudate. 

Past medical history: Born at 38 weeks gestation, no complications. No known drug allergies. Growth and development appropriate for age. Immunizations up to date.

Physical examination: Temperature 101.8F, HR 110, RR 24, O2 sat 99%. Alert, interactive but irritable. HEENT: Left TM erythematous and bulging with decreased mobility. Right TM normal. Throat mildly erythematous, no exudate. No cervical lymphadenopathy.

Assessment: Acute otitis media, left ear.

Plan: Amoxicillin 400mg/5ml suspension, 8ml twice daily for 10 days. Ibuprofen for pain and fever. Return if symptoms worsen or no improvement in 48-72 hours.`,
      confidence: 92,
      duration: "4:32"
    },
    summary: {
      keyFindings: [
        "Chief complaint: Burning chest pain for 3 days, worse after meals",
        "Physical exam: Vital signs stable, chest wall non-tender",
        "Associated symptoms: Fatigue, nausea, sleep difficulty",
        "Improvement with antacids noted",
        "Recent increased work stress reported"
      ],
      diagnosis: "Gastroesophageal Reflux Disease (GERD) likely secondary to dietary triggers and stress",
      differentialDiagnosis: [
        {
          condition: "Gastroesophageal Reflux Disease (GERD)",
          probability: 85,
          reasoning: "Burning chest pain worse after meals, improvement with antacids, and absence of cardiac risk factors strongly suggest GERD"
        },
        {
          condition: "Functional dyspepsia",
          probability: 40,
          reasoning: "Stress-related component and burning epigastric discomfort could indicate functional dyspepsia"
        },
        {
          condition: "Atypical chest pain",
          probability: 25,
          reasoning: "Non-cardiac chest pain is common in young adults, especially with stress component"
        },
        {
          condition: "Peptic ulcer disease",
          probability: 15,
          reasoning: "Less likely given improvement with antacids and no H. pylori risk factors, but worth considering"
        }
      ],
      reviewOfSystems: {
        constitutional: ["Fatigue", "No fever", "No chills"],
        gastrointestinal: ["Burning chest pain", "Nausea", "No vomiting", "No diarrhea"],
        cardiovascular: ["No palpitations", "No shortness of breath"],
        respiratory: ["No cough", "No wheezing"]
      },
      treatment: "Initiate PPI therapy (omeprazole 20mg daily), dietary modifications (avoid spicy foods, smaller frequent meals), stress management counseling, follow-up in 2 weeks"
    },
    emCoding: {
      history: { level: 3, description: "Detailed" },
      exam: { level: 2, description: "Expanded Problem Focused" },
      mdm: { level: 2, description: "Low Complexity" },
      recommendedCode: "99213",
      confidence: 88,
      rationale: "Based on detailed history with review of systems, expanded problem focused examination of cardiovascular and pulmonary systems, and low complexity medical decision making with initiation of new treatment plan."
    }
  };

  const steps = [
    { title: "Patient Check-in", description: "Patient arrives for appointment" },
    { title: "Voice Recording", description: "Physician conducts encounter" },
    { title: "AI Transcription", description: "Converting speech to text" },
    { title: "Clinical Analysis", description: "Extracting medical insights" },
    { title: "E/M Coding", description: "Automated billing code assignment" },
    { title: "Results Review", description: "Complete documentation ready" }
  ];

  const handleStartDemo = () => {
    setShowDemo(true);
    setCurrentStep(0);
    
    // Simulate progression through steps
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const resetDemo = () => {
    setShowDemo(false);
    setCurrentStep(0);
  };

  if (!showDemo) {
    return (
      <Card className="mb-8 border-2 border-dashed border-blue-300 bg-blue-50">
        <CardHeader className="text-center">
          <CardTitle className="text-blue-700 flex items-center justify-center gap-2">
            <Play className="h-5 w-5" />
            Clinical Demo Scenario
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-4">
            <Badge variant="outline" className="mb-2">
              Realistic Patient Encounter
            </Badge>
            <h3 className="font-semibold text-gray-900 mb-2">34-Year-Old Female with Chest Pain</h3>
            <p className="text-sm text-gray-600 mb-4">
              Experience how AI enhances clinical documentation with real physician-patient interaction, 
              including differential diagnosis and automated E/M coding.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-xs">
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <div className="font-medium">Patient</div>
              <div className="text-gray-500">Sarah Chen, 34F</div>
            </div>
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <div className="font-medium">Duration</div>
              <div className="text-gray-500">4:32 encounter</div>
            </div>
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-1 text-purple-600" />
              <div className="font-medium">Diagnosis</div>
              <div className="text-gray-500">4 differentials</div>
            </div>
            <div className="text-center">
              <Badge className="mx-auto mb-1 bg-amber-100 text-amber-800">99213</Badge>
              <div className="font-medium">E/M Code</div>
              <div className="text-gray-500">Level 3 Visit</div>
            </div>
          </div>

          <Button 
            onClick={handleStartDemo}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Clinical Demo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Demo: AI-Enhanced Clinical Documentation</CardTitle>
            <Button onClick={resetDemo} variant="outline" size="sm">
              Reset Demo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex-1 min-w-32 p-3 rounded-lg text-center text-sm ${
                  index <= currentStep 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <div className="font-medium">{step.title}</div>
                <div className="text-xs">{step.description}</div>
              </div>
            ))}
          </div>
          
          {/* Patient Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Patient Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {demoData.patient.name}
              </div>
              <div>
                <span className="font-medium">Age:</span> {demoData.patient.age}
              </div>
              <div>
                <span className="font-medium">Gender:</span> {demoData.patient.gender}
              </div>
              <div>
                <span className="font-medium">ID:</span> {demoData.patient.id}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Display */}
      {currentStep >= 2 && (
        <TranscriptionResults 
          text={demoData.transcription.text}
          confidence={demoData.transcription.confidence}
          duration={demoData.transcription.duration}
        />
      )}

      {currentStep >= 4 && (
        <SummaryResults summary={demoData.summary} />
      )}

      {currentStep >= 5 && (
        <EMCodingResults emCoding={demoData.emCoding} />
      )}

      {currentStep >= 5 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                Clinical Documentation Complete!
              </h3>
              <p className="text-sm text-green-600 mb-4">
                AI has successfully processed the encounter, generated differential diagnoses, 
                and assigned appropriate E/M coding - saving 15+ minutes of documentation time.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-green-700">92%</div>
                  <div className="text-gray-600">Transcription Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-700">4</div>
                  <div className="text-gray-600">Differential Diagnoses</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-700">88%</div>
                  <div className="text-gray-600">Coding Confidence</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-700">~15min</div>
                  <div className="text-gray-600">Time Saved</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}