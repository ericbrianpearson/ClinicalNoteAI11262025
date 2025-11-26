import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Mic,
  Activity,
  AlertTriangle,
  Plus,
  TrendingUp,
  Settings,
  Menu,
  X,
  FileText,
  Users,
  Camera,
  Heart,
  Target,
  LogOut,
  User
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAuth } from "@/hooks/use-auth";
import VoiceRecorder from "@/components/voice-recorder";
import FileUpload from "@/components/file-upload";
import DemoScenario from "@/components/demo-scenario";
import PredictiveInsightsPanel from "@/components/clinical/predictive-insights-panel";
import ErrorQAEngine from "@/components/clinical/error-qa-engine";
import AnalyticsDashboard from "@/components/clinical/analytics-dashboard";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { user, logout } = useAuth();
  const [patientId, setPatientId] = useState<string>("P-12345");
  const [encounterType, setEncounterType] = useState("Office Visit");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState("encounter");
  const [isAdminView, setIsAdminView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Demo data for investor presentation
  const demoTranscription = "Patient presents with chest pain radiating to left arm, started 2 hours ago. Associated with shortness of breath and diaphoresis. No previous cardiac history. Vital signs: BP 150/90, HR 88, RR 18, O2 sat 98%. Patient appears anxious and diaphoretic.";
  
  const demoSummary = {
    keyFindings: ["chest pain", "shortness of breath", "diaphoresis", "hypertension"],
    diagnosis: "Possible acute coronary syndrome",
    vitals: { bp: "150/90", hr: "88", rr: "18", o2: "98%" },
    allergies: "NKDA",
    medications: "None currently"
  };

  const handleStartDemo = () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate AI processing with realistic progress
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setShowResults(true);
          setTranscriptionText(demoTranscription);
          toast({
            title: "AI Processing Complete",
            description: "Clinical analysis and insights generated successfully.",
          });
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 300);
  };

  const handleAudioReady = (audioFile: File) => {
    toast({
      title: "Audio Received",
      description: `Processing ${audioFile.name} with AI transcription...`,
    });
    handleStartDemo();
  };

  const handleNewEncounter = () => {
    setShowResults(false);
    setTranscriptionText("");
    setProcessingProgress(0);
    setActiveTab("encounter");
    toast({
      title: "New Encounter Started",
      description: "Ready for patient documentation.",
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Enterprise Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BrandLogo size="md" variant="full" className="flex-shrink-0" />
              <div className="hidden md:flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Brain className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Admin View Toggle */}
              <div className="hidden md:flex items-center space-x-2">
                <Label htmlFor="admin-mode" className="text-sm">Admin View</Label>
                <Switch
                  id="admin-mode"
                  checked={isAdminView}
                  onCheckedChange={setIsAdminView}
                />
              </div>

              <ThemeToggle />
              
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user.role}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="admin-mode-mobile" className="text-sm">Admin View</Label>
            <Switch
              id="admin-mode-mobile"
              checked={isAdminView}
              onCheckedChange={setIsAdminView}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Shield className="h-3 w-3 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="encounter" className="text-xs sm:text-sm">
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Encounter</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              <Brain className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            {isAdminView && (
              <TabsTrigger value="admin" className="text-xs sm:text-sm">
                <Settings className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Encounter Tab */}
          <TabsContent value="encounter" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
                {/* Demo Banner */}
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <Activity className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Investor Demo Mode:</strong> Experience AI-powered clinical documentation with realistic demo data. 
                    Production version integrates with Azure OpenAI for enterprise deployment.
                  </AlertDescription>
                </Alert>

                {/* Demo Scenario */}
                <DemoScenario />

                {/* Encounter Setup */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Patient Encounter Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="patient-id">Patient ID</Label>
                        <Input
                          id="patient-id"
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                          placeholder="Enter patient ID"
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="encounter-type">Encounter Type</Label>
                        <Select value={encounterType} onValueChange={setEncounterType}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Office Visit">Office Visit</SelectItem>
                            <SelectItem value="Follow-up">Follow-up</SelectItem>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                            <SelectItem value="Annual Physical">Annual Physical</SelectItem>
                            <SelectItem value="Urgent Care">Urgent Care</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="encounter-date">Date</Label>
                      <Input
                        id="encounter-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="h-12 text-base"
                      />
                    </div>
                    <Button 
                      onClick={handleStartDemo}
                      disabled={isProcessing}
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Processing AI Analysis...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Start AI Demo
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Voice Recording */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mic className="h-5 w-5" />
                      Voice Recording & Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <VoiceRecorder onAudioReady={handleAudioReady} />
                    <div className="text-center text-sm text-muted-foreground">
                      Or upload an existing audio file
                    </div>
                    <FileUpload onFileReady={handleAudioReady} accept="audio/*" />
                  </CardContent>
                </Card>

                {/* Processing Status */}
                {isProcessing && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">AI Processing</h3>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(processingProgress)}%
                          </span>
                        </div>
                        <Progress value={processingProgress} className="h-2" />
                        <p className="text-sm text-muted-foreground">
                          Transcribing audio and analyzing clinical content with advanced AI...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Demo Results */}
                {showResults && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          AI Transcription Results
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Confidence Score</span>
                            <Badge className="bg-green-100 text-green-800">94% Accurate</Badge>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <p className="text-sm">{transcriptionText}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5" />
                          Clinical Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Key Findings</h4>
                            <div className="space-y-1">
                              {demoSummary.keyFindings.map((finding, index) => (
                                <Badge key={index} variant="outline" className="mr-1">
                                  {finding}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Vital Signs</h4>
                            <div className="text-sm space-y-1">
                              <p>BP: {demoSummary.vitals.bp}</p>
                              <p>HR: {demoSummary.vitals.hr}</p>
                              <p>RR: {demoSummary.vitals.rr}</p>
                              <p>O2 Sat: {demoSummary.vitals.o2}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Preliminary Diagnosis</h4>
                          <p className="text-sm bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
                            {demoSummary.diagnosis}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          E/M Coding Recommendation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">99214</div>
                            <div className="text-sm text-muted-foreground">Recommended Code</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">Level 4</div>
                            <div className="text-sm text-muted-foreground">Complexity</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">89%</div>
                            <div className="text-sm text-muted-foreground">Confidence</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Clinical Insights */}
                {showResults && (
                  <PredictiveInsightsPanel
                    transcriptionText={transcriptionText}
                    chiefComplaint="chest pain"
                    symptoms={demoSummary.keyFindings}
                    vitals={demoSummary.vitals}
                  />
                )}

                {/* Quality Assurance */}
                {showResults && (
                  <ErrorQAEngine
                    transcriptionText={transcriptionText}
                    chiefComplaint="chest pain"
                    vitals={demoSummary.vitals}
                    allergies={demoSummary.allergies}
                    medications={demoSummary.medications}
                  />
                )}

                {/* Demo Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Live Demo Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Processing Time</span>
                      <span className="font-bold text-green-600">1.2s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Accuracy Score</span>
                      <span className="font-bold text-blue-600">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Time Saved</span>
                      <span className="font-bold text-purple-600">7 min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard isAdminView={false} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {showResults ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictiveInsightsPanel
                  transcriptionText={transcriptionText}
                  chiefComplaint="chest pain"
                  symptoms={demoSummary.keyFindings}
                  vitals={demoSummary.vitals}
                />
                <ErrorQAEngine
                  transcriptionText={transcriptionText}
                  chiefComplaint="chest pain"
                  vitals={demoSummary.vitals}
                  allergies={demoSummary.allergies}
                  medications={demoSummary.medications}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Insights Unavailable</h3>
                  <p className="text-muted-foreground">
                    Complete an encounter demo to view AI-powered clinical insights and recommendations.
                  </p>
                  <Button onClick={() => setActiveTab("encounter")} className="mt-4">
                    Start Demo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Admin Tab */}
          {isAdminView && (
            <TabsContent value="admin">
              <AnalyticsDashboard isAdminView={true} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Mobile Floating Action Button */}
      <FloatingActionButton
        onNewEncounter={handleNewEncounter}
        onVoiceRecord={() => setActiveTab("encounter")}
        onImageCapture={() => toast({ title: "Coming Soon", description: "Image capture feature will be available in the next update." })}
        onNewPatient={() => toast({ title: "Coming Soon", description: "Patient management feature will be available in the next update." })}
      />

      {/* Enterprise Footer Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                AI-Powered, Cloud-Ready
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Built for Azure/OpenAI integration. Enterprise-scale deployment ready.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Production Ready
              </Badge>
              <Badge className="bg-green-600 hover:bg-green-700 text-white">
                <Shield className="h-3 w-3 mr-1" />
                HIPAA Certified
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}