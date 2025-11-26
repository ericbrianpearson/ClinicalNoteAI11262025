import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Calendar, 
  FileText, 
  Search,
  Filter,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
}

interface Encounter {
  id: string;
  patientId: string;
  encounterType: string;
  date: string;
  transcriptionText: string;
  summary: any;
  emCoding: any;
}

interface DemoPatientSelectorProps {
  onPatientSelect: (patient: Patient, encounter: Encounter) => void;
  selectedPatientId?: string;
}

export default function DemoPatientSelector({ onPatientSelect, selectedPatientId }: DemoPatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const { toast } = useToast();

  // Demo patient data with comprehensive clinical diversity
  const demoPatients: Patient[] = [
    {
      id: 'P001',
      firstName: 'Emma',
      lastName: 'Rodriguez',
      dateOfBirth: '2018-04-12',
      medicalHistory: 'Born at 38 weeks, no complications',
      allergies: 'None known',
      currentMedications: 'None'
    },
    {
      id: 'P002', 
      firstName: 'Aiden',
      lastName: 'Thompson',
      dateOfBirth: '2015-09-23',
      medicalHistory: 'Asthma diagnosed age 4, well-controlled',
      allergies: 'Eggs, tree nuts',
      currentMedications: 'Albuterol inhaler PRN, Flovent 44mcg BID'
    },
    {
      id: 'P003',
      firstName: 'Zara',
      lastName: 'Patel',
      dateOfBirth: '2001-02-14',
      medicalHistory: 'Depression, anxiety - well managed',
      allergies: 'Latex',
      currentMedications: 'Sertraline 75mg daily, Lorazepam 0.5mg PRN'
    },
    {
      id: 'P004',
      firstName: 'Marcus',
      lastName: 'Washington',
      dateOfBirth: '1998-07-19',
      medicalHistory: 'Previous ACL repair (2020), fully recovered',
      allergies: 'Penicillin',
      currentMedications: 'Multivitamin daily'
    },
    {
      id: 'P005',
      firstName: 'Sarah',
      lastName: 'Kim',
      dateOfBirth: '1985-11-03',
      medicalHistory: 'Hypothyroidism, GERD',
      allergies: 'Shellfish, iodine',
      currentMedications: 'Levothyroxine 88mcg daily, Omeprazole 20mg daily'
    },
    {
      id: 'P006',
      firstName: 'James',
      lastName: "O'Connor",
      dateOfBirth: '1972-05-28',
      medicalHistory: 'Hypertension, Type 2 DM, chronic back pain',
      allergies: 'Codeine',
      currentMedications: 'Lisinopril 20mg daily, Metformin 1000mg BID, Gabapentin 300mg TID'
    },
    {
      id: 'P007',
      firstName: 'Fatima',
      lastName: 'Al-Hassan',
      dateOfBirth: '1979-12-08',
      medicalHistory: 'Migraine headaches, postpartum depression (resolved)',
      allergies: 'Sulfa medications',
      currentMedications: 'Sumatriptan 50mg PRN, Propranolol 40mg BID'
    },
    {
      id: 'P008',
      firstName: 'Chen',
      lastName: 'Liu',
      dateOfBirth: '1990-03-17',
      medicalHistory: 'Hepatitis B (chronic, stable), seasonal allergies',
      allergies: 'Environmental allergens (pollen, dust)',
      currentMedications: 'Claritin 10mg daily during allergy season'
    },
    {
      id: 'P009',
      firstName: 'Linda',
      lastName: 'Martinez',
      dateOfBirth: '1968-08-22',
      medicalHistory: 'Breast cancer survivor (2019), osteopenia',
      allergies: 'NKDA',
      currentMedications: 'Tamoxifen 20mg daily, Calcium + Vitamin D'
    },
    {
      id: 'P010',
      firstName: 'Robert',
      lastName: 'Johnson',
      dateOfBirth: '1965-01-15',
      medicalHistory: 'Coronary artery disease, hyperlipidemia, sleep apnea',
      allergies: 'Aspirin (GI upset)',
      currentMedications: 'Clopidogrel 75mg daily, Atorvastatin 80mg daily, CPAP nightly'
    },
    {
      id: 'P011',
      firstName: 'Eleanor',
      lastName: 'Kowalski',
      dateOfBirth: '1942-06-30',
      medicalHistory: 'Atrial fibrillation, osteoarthritis, mild cognitive impairment',
      allergies: 'Penicillin, contrast dye',
      currentMedications: 'Warfarin 5mg daily, Acetaminophen 650mg PRN, Donepezil 10mg daily'
    },
    {
      id: 'P012',
      firstName: 'William',
      lastName: 'Anderson',
      dateOfBirth: '1938-11-12',
      medicalHistory: 'COPD, prostate cancer (treated), hearing loss',
      allergies: 'Morphine',
      currentMedications: 'Tiotropium inhaler daily, Finasteride 5mg daily, hearing aids'
    }
  ];

  const demoEncounters: Encounter[] = [
    {
      id: 'E001',
      patientId: 'P001',
      encounterType: 'Sick Visit',
      date: '2024-12-15',
      transcriptionText: `6-year-old Hispanic female presents with mother reporting 2 days of fever up to 102.5F, left ear pain, and decreased appetite. Child has been tugging at left ear and crying more than usual. No vomiting, diarrhea, or respiratory symptoms. Patient appears uncomfortable but alert and responsive. Temperature 101.8F, other vitals stable. Left tympanic membrane erythematous and bulging with poor mobility on pneumatic otoscopy.`,
      summary: {
        keyFindings: ['Fever 101.8F', 'Left ear pain', 'Erythematous bulging tympanic membrane'],
        diagnosis: 'Acute otitis media, left ear',
        vitals: { HR: 110, Temp: 101.8, RR: 24, O2Sat: 99 },
        plan: 'Amoxicillin 400mg/5ml, 8ml BID x 10 days. Ibuprofen for pain/fever.'
      },
      emCoding: { level: '99213', complexity: 'Moderate', timeSpent: 20 }
    },
    {
      id: 'E002',
      patientId: 'P002',
      encounterType: 'Asthma Follow-up',
      date: '2024-12-10',
      transcriptionText: `9-year-old male with history of well-controlled asthma presents for routine follow-up. Mother reports good control overall, using rescue inhaler 1-2 times per week during soccer season. No recent exacerbations, hospitalizations, or missed school days. Peak flow measurements at home consistently 85-90% of personal best. Physical exam reveals clear lungs bilaterally, no wheezing or retractions.`,
      summary: {
        keyFindings: ['Well-controlled asthma', 'Clear lungs', 'Good peak flow measurements'],
        diagnosis: 'Asthma, well-controlled',
        vitals: { BP: '98/62', HR: 88, Temp: 98.6, RR: 18, O2Sat: 100 },
        plan: 'Continue current regimen. Refill medications. Follow up in 6 months.'
      },
      emCoding: { level: '99213', complexity: 'Low', timeSpent: 15 }
    },
    {
      id: 'E003',
      patientId: 'P003',
      encounterType: 'Mental Health Follow-up',
      date: '2024-12-08',
      transcriptionText: `23-year-old female college student presents for routine mental health follow-up. Reports stable mood on current medication regimen. PHQ-9 score of 6 (mild symptoms). Some increased anxiety with upcoming finals but using coping strategies learned in therapy. Sleep improved to 7-8 hours nightly. Appetite normal. No suicidal ideation.`,
      summary: {
        keyFindings: ['Stable mood', 'PHQ-9 score 6', 'Good sleep pattern'],
        diagnosis: 'Major depressive disorder, stable; Generalized anxiety disorder, well-controlled',
        vitals: { BP: '108/68', HR: 72, Temp: 98.4, RR: 16, O2Sat: 99 },
        plan: 'Continue sertraline 75mg daily. Follow up in 3 months.'
      },
      emCoding: { level: '99214', complexity: 'Moderate', timeSpent: 25 }
    },
    {
      id: 'E004',
      patientId: 'P006',
      encounterType: 'Chronic Disease Management',
      date: '2024-12-05',
      transcriptionText: `52-year-old male construction worker with diabetes and hypertension presents for routine follow-up. Reports generally good glucose control with occasional highs during stressful work periods. Home blood pressure readings 130-140/80-90. Some lower back pain affecting work, rated 4-5/10, managed with gabapentin. Recent HbA1c 7.2%.`,
      summary: {
        keyFindings: ['HbA1c 7.2%', 'BP 130-140/80-90', 'Chronic back pain 4-5/10'],
        diagnosis: 'Type 2 diabetes, fair control; Hypertension, suboptimal control; Chronic back pain',
        vitals: { BP: '138/86', HR: 78, Temp: 98.5, RR: 18, O2Sat: 98 },
        plan: 'Increase lisinopril to 30mg daily. Continue metformin. PT referral for back pain.'
      },
      emCoding: { level: '99214', complexity: 'High', timeSpent: 30 }
    },
    {
      id: 'E005',
      patientId: 'P010',
      encounterType: 'Cardiology Follow-up',
      date: '2024-12-03',
      transcriptionText: `59-year-old male executive with CAD post-stent and sleep apnea presents for follow-up. Reports good exercise tolerance, walking 2 miles daily without chest pain. Compliant with CPAP therapy, feels more rested. Recent stress test negative. Lipid panel shows LDL 85. No shortness of breath, palpitations, or ankle swelling.`,
      summary: {
        keyFindings: ['Good exercise tolerance', 'Negative stress test', 'LDL 85'],
        diagnosis: 'Coronary artery disease, stable; Sleep apnea, well-controlled on CPAP',
        vitals: { BP: '132/78', HR: 68, Temp: 98.5, RR: 16, O2Sat: 98 },
        plan: 'Continue current cardiac medications. Annual stress testing.'
      },
      emCoding: { level: '99214', complexity: 'Moderate', timeSpent: 25 }
    }
  ];

  useEffect(() => {
    // Simulate loading demo data
    setLoading(true);
    setTimeout(() => {
      setPatients(demoPatients);
      setEncounters(demoEncounters);
      setLoading(false);
    }, 500);
  }, []);

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

  const getAgeGroup = (age: number): string => {
    if (age < 18) return 'pediatric';
    if (age < 30) return 'young-adult';
    if (age < 65) return 'adult';
    return 'elderly';
  };

  const getSpecialtyFromEncounter = (encounter: Encounter): string => {
    const type = encounter.encounterType.toLowerCase();
    if (type.includes('mental') || type.includes('psych')) return 'mental-health';
    if (type.includes('cardio')) return 'cardiology';
    if (type.includes('asthma') || type.includes('pulm')) return 'pulmonology';
    if (type.includes('sick') && encounter.patientId.includes('P001')) return 'pediatrics';
    if (type.includes('chronic')) return 'primary-care';
    return 'primary-care';
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const age = getAgeFromBirthDate(patient.dateOfBirth);
    const ageGroup = getAgeGroup(age);
    const patientEncounters = encounters.filter(e => e.patientId === patient.id);
    
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchTerm.toLowerCase()) ||
      patient.medicalHistory.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgeGroup = filterAgeGroup === 'all' || ageGroup === filterAgeGroup;
    
    const matchesSpecialty = filterSpecialty === 'all' || 
      patientEncounters.some(encounter => getSpecialtyFromEncounter(encounter) === filterSpecialty);
    
    return matchesSearch && matchesAgeGroup && matchesSpecialty;
  });

  const handlePatientSelect = (patient: Patient) => {
    const patientEncounters = encounters.filter(e => e.patientId === patient.id);
    const mostRecentEncounter = patientEncounters.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    if (mostRecentEncounter) {
      onPatientSelect(patient, mostRecentEncounter);
      toast({
        title: "Demo Patient Selected",
        description: `Now viewing ${patient.firstName} ${patient.lastName} - ${mostRecentEncounter.encounterType}`,
      });
    }
  };

  const generatePredictedDiagnosis = (encounter: Encounter): string => {
    return encounter.summary?.diagnosis || 'AI analysis pending...';
  };

  const generateQAWarnings = (encounter: Encounter): string[] => {
    const warnings = [];
    const transcriptionText = String(encounter.transcriptionText || '');
    if (transcriptionText.length < 100) {
      warnings.push('Incomplete documentation detected');
    }
    if (!encounter.summary?.vitals) {
      warnings.push('Missing vital signs');
    }
    if (transcriptionText.includes('allergic') && !transcriptionText.includes('allergy')) {
      warnings.push('Potential allergy documentation inconsistency');
    }
    return warnings;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading demo patients...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Demo Patient Database</span>
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Activity className="h-3 w-3 mr-1" />
              {patients.length} Patients
            </Badge>
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {encounters.length} Encounters
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              AI-Ready Dataset
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
              <SelectTrigger>
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="pediatric">Pediatric (&lt;18)</SelectItem>
                <SelectItem value="young-adult">Young Adult (18-29)</SelectItem>
                <SelectItem value="adult">Adult (30-64)</SelectItem>
                <SelectItem value="elderly">Elderly (65+)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                <SelectItem value="primary-care">Primary Care</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="mental-health">Mental Health</SelectItem>
                <SelectItem value="pulmonology">Pulmonology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPatients.map((patient) => {
          const age = getAgeFromBirthDate(patient.dateOfBirth);
          const patientEncounters = encounters.filter(e => e.patientId === patient.id);
          const mostRecentEncounter = patientEncounters[0];
          const isSelected = selectedPatientId === patient.id;

          return (
            <Card 
              key={patient.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handlePatientSelect(patient)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="font-semibold">
                      {patient.firstName} {patient.lastName}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Age {age}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-1">
                  <div><strong>Medical History:</strong> {patient.medicalHistory}</div>
                  <div><strong>Allergies:</strong> {patient.allergies}</div>
                  <div><strong>Medications:</strong> {patient.currentMedications}</div>
                </div>
                
                {mostRecentEncounter && (
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {mostRecentEncounter.date}
                      </Badge>
                      <span className="text-xs font-medium">
                        {mostRecentEncounter.encounterType}
                      </span>
                    </div>
                    
                    <div className="text-sm">
                      <div className="font-medium text-green-700 dark:text-green-400">
                        Predicted Diagnosis: {generatePredictedDiagnosis(mostRecentEncounter)}
                      </div>
                      
                      {generateQAWarnings(mostRecentEncounter).length > 0 && (
                        <div className="mt-1">
                          {generateQAWarnings(mostRecentEncounter).map((warning, index) => (
                            <div key={index} className="flex items-center text-amber-600 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <Button 
                  variant={isSelected ? "default" : "outline"} 
                  size="sm" 
                  className="w-full"
                >
                  {isSelected ? "Selected" : "Select Patient"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}