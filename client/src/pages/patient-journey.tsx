import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PatientJourneyVisualization from "@/components/patient-journey-visualization";
import { Users, Search, TrendingUp } from "lucide-react";

export default function PatientJourneyPage() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");

  // Get list of patients for selection
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Patient Journey Visualization
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Comprehensive timeline view of patient encounters, treatments, and outcomes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Select Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select 
                value={selectedPatientId} 
                onValueChange={setSelectedPatientId}
                disabled={patientsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={patientsLoading ? "Loading patients..." : "Choose a patient to view their journey"} />
                </SelectTrigger>
                <SelectContent>
                  {patients?.map((patient: any) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => setSelectedPatientId("")}
              variant="outline"
              disabled={!selectedPatientId}
            >
              Clear Selection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Journey Visualization */}
      {selectedPatientId ? (
        <PatientJourneyVisualization patientId={selectedPatientId} />
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Patient Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Select a patient from the dropdown above to view their comprehensive care journey
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}