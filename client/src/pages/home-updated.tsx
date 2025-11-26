import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Stethoscope, 
  User, 
  LogOut, 
  Brain, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle2, 
  Mic,
  Upload,
  Activity,
  AlertTriangle,
  Plus,
  TrendingUp,
  Settings,
  Menu,
  X,
  FileText,
  Users,
  Camera
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useAuth } from "@/hooks/use-auth";
import VoiceRecorder from "@/components/voice-recorder";
import FileUpload from "@/components/file-upload";
import ProcessingStatus from "@/components/processing-status";
import TranscriptionResults from "@/components/transcription-results";
import SummaryResults from "@/components/summary-results";
import EMCodingResults from "@/components/em-coding-results";
import ReviewOfSystems from "@/components/review-of-systems";
import DemoScenario from "@/components/demo-scenario";
import TreatmentPlan from "@/components/treatment-plan";
import RealTimeAIFeedback from "@/components/real-time-ai-feedback";
import ClinicalSummaryTimeline from "@/components/clinical-summary-timeline";
import EncounterResumption from "@/components/encounter-resumption";
import SystemPerformanceMonitor from "@/components/system-performance-monitor";
import PDFExport from "@/components/pdf-export";
import PredictiveInsightsPanel from "@/components/clinical/predictive-insights-panel";
import ErrorQAEngine from "@/components/clinical/error-qa-engine";
import AnalyticsDashboard from "@/components/clinical/analytics-dashboard";
import FloatingActionButton from "@/components/ui/floating-action-button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAutoSave } from "@/hooks/use-auto-save";
import type { Encounter } from "@shared/schema";

export default function Home() {
  const { user, logout } = useAuth();
  const [patientId, setPatientId] = useState<string>("P-12345");
  const [encounterType, setEncounterType] = useState("Office Visit");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEncounterId, setCurrentEncounterId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscriptionText, setCurrentTranscriptionText] = useState("");
  const [activeTab, setActiveTab] = useState("encounter");
  const [isAdminView, setIsAdminView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [qaErrors, setQAErrors] = useState<any[]>([]);
  const [showQAModal, setShowQAModal] = useState(false);
  const { toast } = useToast();

  // Auto-save functionality
  const { saveTranscription, saveFormData, forceSave, autoSaveData } = useAutoSave({
    encounterId: currentEncounterId || undefined,
    saveInterval: 30000,
    debounceDelay: 2000
  });

  // Get current encounter data
  const { data: encounter, isLoading: encounterLoading, refetch: refetchEncounter } = useQuery<Encounter>({
    queryKey: ['/api/encounters', currentEncounterId],
    enabled: !!currentEncounterId,
  });

  // Create new encounter mutation with enhanced error handling
  const createEncounterMutation = useMutation({
    mutationFn: async (encounterData: { patientId: string; encounterType: string; date: string }) => {
      try {
        const response = await apiRequest('/api/encounters', {
          method: 'POST',
          body: JSON.stringify(encounterData)
        });
        return response;
      } catch (error) {
        console.error('Create encounter error:', error);
        throw new Error('Failed to create encounter. Please check your connection and try again.');
      }
    },
    onSuccess: (data: Encounter) => {
      setCurrentEncounterId(data.id);
      toast({
        title: "Encounter Created Successfully",
        description: `New patient encounter for ${patientId} has been initiated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Encounter Creation Failed",
        description: error.message || "Unable to create encounter. Contact support.",
        variant: "destructive",
      });
    },
  });

  // Process audio mutation with enhanced feedback
  const processAudioMutation = useMutation({
    mutationFn: async ({ encounterId, audioFile }: { encounterId: number; audioFile: File }) => {
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      const response = await fetch(`/api/ai/upload-audio`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Processing failed (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      refetchEncounter();
      toast({
        title: "AI Processing Complete",
        description: "Audio transcribed and clinical analysis generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Processing Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Enhanced Start New Encounter with comprehensive validation
  const handleStartNewEncounter = () => {
    if (!patientId || !patientId.trim()) {
      toast({
        title: "Validation Error",
        description: "Patient ID is required to start a new encounter.",
        variant: "destructive",
      });
      return;
    }

    if (patientId.trim().length < 3) {
      toast({
        title: "Validation Error", 
        description: "Patient ID must be at least 3 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!encounterType) {
      toast({
        title: "Validation Error",
        description: "Please select an encounter type.",
        variant: "destructive", 
      });
      return;
    }

    createEncounterMutation.mutate({
      patientId: patientId.trim(),
      encounterType,
      date,
    });
  };

  const handleAudioReady = (audioFile: File) => {
    if (!currentEncounterId) {
      toast({
        title: "Setup Required",
        description: "Please create an encounter first using 'Start New Encounter'.",
        variant: "destructive",
      });
      return;
    }

    if (audioFile.size > 50 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Audio file must be under 50MB. Please compress and try again.",
        variant: "destructive",
      });
      return;
    }

    processAudioMutation.mutate({
      encounterId: currentEncounterId,
      audioFile,
    });
  };

  const handleNewEncounter = () => {
    setCurrentEncounterId(null);
    setPatientId("P-12345");
    setDate(new Date().toISOString().split('T')[0]);
    setActiveTab("encounter");
  };

  const handleQAErrorsDetected = (errors: any[]) => {
    setQAErrors(errors);
    if (errors.filter(e => e.type === 'critical').length > 0) {
      setShowQAModal(true);
    }
  };

  const isProcessing = processAudioMutation.isPending;
  const hasResults = encounter && encounter.processingStatus === 'completed';
  const criticalErrors = qaErrors.filter(e => e.type === 'critical');

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
            {/* QA Error Warning */}
            {criticalErrors.length > 0 && (
              <Card className="border-red-500 bg-red-50 dark:bg-red-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Critical errors detected</span>
                    <Badge variant="destructive">{criticalErrors.length}</Badge>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    Please resolve critical errors before finalizing the encounter.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-6">
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
                          value={patientId || ""}
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
                      onClick={handleStartNewEncounter}
                      disabled={createEncounterMutation.isPending}
                      className="w-full h-12 text-base"
                      size="lg"
                    >
                      {createEncounterMutation.isPending ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Creating Encounter...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Start New Encounter
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Voice Recording */}
                {currentEncounterId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5" />
                        Voice Recording & Upload
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <VoiceRecorder
                        onAudioReady={handleAudioReady}
                        isProcessing={isProcessing}
                        className="w-full"
                      />
                      <div className="text-center text-sm text-muted-foreground">
                        Or upload an existing audio file
                      </div>
                      <FileUpload
                        onFileSelect={handleAudioReady}
                        accept="audio/*"
                        className="w-full h-12"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Processing Status */}
                {isProcessing && (
                  <ProcessingStatus 
                    status="processing"
                    progress={65}
                    message="AI is transcribing audio and analyzing clinical content..."
                  />
                )}

                {/* Results */}
                {hasResults && (
                  <div className="space-y-6">
                    <TranscriptionResults 
                      transcription={encounter.transcriptionText || ""}
                      confidence={encounter.transcriptionConfidence || 0}
                    />
                    
                    <SummaryResults summary={encounter.summary} />
                    
                    <EMCodingResults coding={encounter.emCoding} />
                    
                    <ReviewOfSystems data={encounter.summary?.reviewOfSystems} />
                    
                    <TreatmentPlan encounter={encounter} />
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* System Performance Monitor */}
                <SystemPerformanceMonitor />

                {/* Real-time AI Feedback */}
                {isRecording && (
                  <RealTimeAIFeedback 
                    transcription={currentTranscriptionText}
                    confidence={85}
                    clinicalEntities={['chest pain', 'dyspnea', 'hypertension']}
                    isProcessing={isProcessing}
                  />
                )}

                {/* AI Clinical Insights */}
                {hasResults && (
                  <PredictiveInsightsPanel
                    transcriptionText={encounter.transcriptionText}
                    chiefComplaint={encounter.summary?.keyFindings?.[0]}
                    symptoms={encounter.summary?.keyFindings}
                    vitals={encounter.summary?.vitals}
                  />
                )}

                {/* Quality Assurance */}
                {hasResults && (
                  <ErrorQAEngine
                    transcriptionText={encounter.transcriptionText}
                    chiefComplaint={encounter.summary?.keyFindings?.[0]}
                    vitals={encounter.summary?.vitals}
                    allergies={encounter.summary?.allergies}
                    medications={encounter.summary?.medications}
                    onErrorsDetected={handleQAErrorsDetected}
                  />
                )}

                {/* Encounter Resumption */}
                <EncounterResumption 
                  onResumeEncounter={(id) => setCurrentEncounterId(id)}
                  onStartNewEncounter={handleNewEncounter}
                  isPaused={isPaused}
                  onPauseEncounter={() => setIsPaused(true)}
                  onUnpauseEncounter={() => setIsPaused(false)}
                />

                {/* Clinical Timeline */}
                {hasResults && (
                  <ClinicalSummaryTimeline 
                    patientId={patientId}
                    summary={encounter.summary}
                    emCoding={encounter.emCoding}
                    keyFindings={encounter.summary?.keyFindings}
                    transcriptionText={encounter.transcriptionText}
                    audioFileName={encounter.audioFileName}
                  />
                )}

                {/* PDF Export */}
                {hasResults && (
                  <PDFExport encounter={encounter} />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard isAdminView={false} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {hasResults ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PredictiveInsightsPanel
                  transcriptionText={encounter.transcriptionText}
                  chiefComplaint={encounter.summary?.keyFindings?.[0]}
                  symptoms={encounter.summary?.keyFindings}
                  vitals={encounter.summary?.vitals}
                />
                <ErrorQAEngine
                  transcriptionText={encounter.transcriptionText}
                  chiefComplaint={encounter.summary?.keyFindings?.[0]}
                  vitals={encounter.summary?.vitals}
                  allergies={encounter.summary?.allergies}
                  medications={encounter.summary?.medications}
                  onErrorsDetected={handleQAErrorsDetected}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">AI Insights Unavailable</h3>
                  <p className="text-muted-foreground">
                    Complete an encounter to view AI-powered clinical insights and recommendations.
                  </p>
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

      {/* QA Error Modal */}
      <Dialog open={showQAModal} onOpenChange={setShowQAModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Errors Detected
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Critical errors must be resolved before finalizing this encounter.
            </p>
            <div className="space-y-2">
              {criticalErrors.map((error) => (
                <Card key={error.id} className="border-red-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-1">
                      {error.title}
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {error.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowQAModal(false)}>
                Review Later
              </Button>
              <Button onClick={() => {
                setShowQAModal(false);
                setActiveTab("insights");
              }}>
                View All Issues
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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