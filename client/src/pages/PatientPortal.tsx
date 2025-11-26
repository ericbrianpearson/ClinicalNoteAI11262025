import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePatientAuth } from "@/hooks/use-patient-auth";

// Custom fetcher for patient API calls that includes patient token
async function patientFetch(url: string) {
  const token = localStorage.getItem("patient_token");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  FileText, 
  Calendar, 
  LogOut, 
  Shield,
  AlertCircle,
  Activity,
  Pill
} from "lucide-react";
import { format } from "date-fns";

interface Encounter {
  id: number;
  encounterType: string;
  date: string;
  transcriptionText: string | null;
  summary: any;
  emCoding: any;
  processingStatus: string;
}

interface PatientProfile {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string | null;
  phone: string | null;
  allergies: string | null;
  medications: string | null;
  medicalHistory: string | null;
}

export default function PatientPortal() {
  const { patient, token, logout } = usePatientAuth();
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  const { data: encounters, isLoading: loadingEncounters } = useQuery<Encounter[]>({
    queryKey: ["/api/patient/records"],
    queryFn: () => patientFetch("/api/patient/records"),
    enabled: !!token,
  });

  const { data: profile, isLoading: loadingProfile } = useQuery<PatientProfile>({
    queryKey: ["/api/patient/profile"],
    queryFn: () => patientFetch("/api/patient/profile"),
    enabled: !!token,
  });

  if (!patient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white" data-testid="text-portal-title">
                Patient Portal
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-patient-name">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="records" data-testid="tab-medical-records">
              <FileText className="mr-2 h-4 w-4" />
              Medical Records
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="mr-2 h-4 w-4" />
              My Profile
            </TabsTrigger>
          </TabsList>

          {/* Medical Records Tab */}
          <TabsContent value="records" className="space-y-4">
            {loadingEncounters ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Loading your medical records...
                  </div>
                </CardContent>
              </Card>
            ) : encounters && encounters.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Records List */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Your Visits
                  </h2>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-3">
                      {encounters.map((encounter) => (
                        <Card
                          key={encounter.id}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedEncounter?.id === encounter.id
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                          onClick={() => setSelectedEncounter(encounter)}
                          data-testid={`card-encounter-${encounter.id}`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base" data-testid={`text-encounter-type-${encounter.id}`}>
                                  {encounter.encounterType}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1" data-testid={`text-encounter-date-${encounter.id}`}>
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(encounter.date), "PPP")}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={
                                  encounter.processingStatus === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                                data-testid={`badge-status-${encounter.id}`}
                              >
                                {encounter.processingStatus}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Selected Record Details */}
                <div>
                  {selectedEncounter ? (
                    <Card className="sticky top-24">
                      <CardHeader>
                        <CardTitle data-testid="text-selected-encounter-type">
                          {selectedEncounter.encounterType}
                        </CardTitle>
                        <CardDescription data-testid="text-selected-encounter-date">
                          {format(new Date(selectedEncounter.date), "PPP")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedEncounter.summary && (
                          <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Clinical Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                              {selectedEncounter.summary.diagnosis && (
                                <div>
                                  <span className="font-medium">Diagnosis:</span>{" "}
                                  <span data-testid="text-diagnosis">{selectedEncounter.summary.diagnosis}</span>
                                </div>
                              )}
                              {selectedEncounter.summary.treatment && (
                                <div>
                                  <span className="font-medium">Treatment:</span>{" "}
                                  <span data-testid="text-treatment">{selectedEncounter.summary.treatment}</span>
                                </div>
                              )}
                              {selectedEncounter.summary.keyFindings && (
                                <div>
                                  <span className="font-medium">Key Findings:</span>
                                  <ul className="list-disc list-inside mt-1 ml-2">
                                    {selectedEncounter.summary.keyFindings.map(
                                      (finding: string, index: number) => (
                                        <li key={index} data-testid={`text-finding-${index}`}>{finding}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {selectedEncounter.emCoding && (
                          <div>
                            <Separator className="my-4" />
                            <h3 className="font-semibold mb-2">Visit Code</h3>
                            <Badge variant="outline" data-testid="text-em-code">
                              {selectedEncounter.emCoding.recommendedCode}
                            </Badge>
                          </div>
                        )}

                        {selectedEncounter.transcriptionText && (
                          <div>
                            <Separator className="my-4" />
                            <h3 className="font-semibold mb-2">Visit Notes</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap" data-testid="text-transcription">
                              {selectedEncounter.transcriptionText}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="py-12">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Select a visit to view details</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No medical records available yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {loadingProfile ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-gray-500 dark:text-gray-400">
                    Loading your profile...
                  </div>
                </CardContent>
              </Card>
            ) : profile ? (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </span>
                      <p className="text-base" data-testid="text-profile-name">
                        {profile.firstName} {profile.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Date of Birth
                      </span>
                      <p className="text-base" data-testid="text-profile-dob">
                        {profile.dateOfBirth}
                      </p>
                    </div>
                    {profile.email && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </span>
                        <p className="text-base" data-testid="text-profile-email">{profile.email}</p>
                      </div>
                    )}
                    {profile.phone && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Phone
                        </span>
                        <p className="text-base" data-testid="text-profile-phone">{profile.phone}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Medical Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {profile.allergies && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          Allergies
                        </span>
                        <p className="text-base" data-testid="text-profile-allergies">{profile.allergies}</p>
                      </div>
                    )}
                    {profile.medications && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Pill className="h-4 w-4" />
                          Current Medications
                        </span>
                        <p className="text-base" data-testid="text-profile-medications">{profile.medications}</p>
                      </div>
                    )}
                    {profile.medicalHistory && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Medical History
                        </span>
                        <p className="text-base text-gray-600 dark:text-gray-400" data-testid="text-profile-history">
                          {profile.medicalHistory}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
