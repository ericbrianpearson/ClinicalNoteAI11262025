export async function createRealisticPatients() {
  const { db } = await import('./db');
  const { patients, encounters } = await import('@shared/schema');

  // Realistic patient data for comprehensive testing
  const patientData = [
    {
      practitionerId: 1,
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1975-03-15',
      gender: 'male',
      phone: '(555) 123-4567',
      email: 'john.smith@clinic.example',
      address: '123 Main St, Springfield, IL 62701',
      emergencyContact: 'Jane Smith - (555) 123-4568',
      insuranceInfo: 'Blue Cross Blue Shield - Policy #BC123456789',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
      allergies: 'Penicillin',
      currentMedications: 'Lisinopril 10mg daily, Metformin 1000mg BID'
    },
    {
      practitionerId: 1,
      firstName: 'Mary',
      lastName: 'Johnson',
      dateOfBirth: '1982-07-22',
      gender: 'female',
      phone: '(555) 234-5678',
      email: 'mary.johnson@clinic.example',
      address: '456 Oak Ave, Springfield, IL 62702',
      emergencyContact: 'Robert Johnson - (555) 234-5679',
      insuranceInfo: 'Aetna Health Plan - Policy #AE987654321',
      medicalHistory: 'Asthma, Anxiety',
      allergies: 'Shellfish',
      currentMedications: 'Albuterol inhaler PRN, Sertraline 50mg daily'
    },
    {
      practitionerId: 1,
      firstName: 'Robert',
      lastName: 'Williams',
      dateOfBirth: '1968-11-08',
      gender: 'male',
      phone: '(555) 345-6789',
      email: 'robert.williams@clinic.example',
      address: '789 Pine St, Springfield, IL 62703',
      emergencyContact: 'Linda Williams - (555) 345-6790',
      insuranceInfo: 'UnitedHealthcare - Policy #UH456789123',
      medicalHistory: 'Hyperlipidemia, Arthritis',
      allergies: 'NKDA',
      currentMedications: 'Atorvastatin 40mg daily, Ibuprofen 600mg PRN'
    }
  ];

  const insertedPatients = await db.insert(patients).values(patientData).returning();

  // Create realistic encounters with comprehensive clinical data
  const encounterData = [];
  const clinicalScenarios = [
    {
      encounterType: 'Annual Physical',
      transcriptionText: 'Patient presents for annual physical examination. No acute complaints. Reviews systems negative except for occasional fatigue. Physical exam reveals blood pressure 142/88, heart rate 78, temperature 98.6. Heart regular rate and rhythm, lungs clear bilaterally, abdomen soft non-tender. Patient counseled on blood pressure management and lifestyle modifications.',
      summary: {
        keyFindings: ['Elevated blood pressure 142/88', 'Otherwise normal physical exam', 'Patient reports occasional fatigue'],
        diagnosis: 'Hypertension, uncontrolled',
        differentialDiagnosis: [
          { condition: 'Essential hypertension', probability: 85, reasoning: 'Consistent with patient history and current readings' },
          { condition: 'Secondary hypertension', probability: 15, reasoning: 'Less likely given normal exam findings' }
        ],
        reviewOfSystems: {
          constitutional: ['Fatigue'],
          cardiovascular: ['No chest pain', 'No palpitations'],
          respiratory: ['No shortness of breath', 'No cough'],
          gastrointestinal: ['No nausea', 'No vomiting'],
          genitourinary: ['No urinary symptoms'],
          musculoskeletal: ['No joint pain'],
          neurological: ['No headaches', 'No dizziness'],
          psychiatric: ['No anxiety', 'No depression']
        },
        treatment: 'Increase Lisinopril to 20mg daily. Dietary counseling for low sodium diet. Follow up in 4 weeks for blood pressure check. Order basic metabolic panel and lipid profile.'
      },
      emCoding: {
        history: { level: 3, description: 'Detailed history with review of systems' },
        exam: { level: 3, description: 'Detailed physical examination' },
        mdm: { level: 2, description: 'Straightforward medical decision making' },
        recommendedCode: '99395',
        confidence: 92,
        rationale: 'Preventive medicine visit for established patient age 40-64'
      }
    },
    {
      encounterType: 'Acute Care Visit',
      transcriptionText: 'Patient presents with chief complaint of chest pain and shortness of breath that started 2 hours ago. Pain is substernal, 7/10 intensity, radiating to left arm. Associated with diaphoresis and nausea. No relief with rest. Vital signs show blood pressure 160/95, heart rate 102, respiratory rate 22, oxygen saturation 96% on room air. EKG shows ST elevations in leads II, III, aVF.',
      summary: {
        keyFindings: ['Acute chest pain with radiation', 'ST elevation on EKG', 'Elevated blood pressure and heart rate'],
        diagnosis: 'ST-elevation myocardial infarction (STEMI), inferior wall',
        differentialDiagnosis: [
          { condition: 'STEMI', probability: 95, reasoning: 'Classic presentation with EKG changes' },
          { condition: 'Unstable angina', probability: 3, reasoning: 'Less likely given ST elevations' },
          { condition: 'Aortic dissection', probability: 2, reasoning: 'Consider given severe pain' }
        ],
        reviewOfSystems: {
          constitutional: ['Diaphoresis', 'Nausea'],
          cardiovascular: ['Chest pain', 'No palpitations'],
          respiratory: ['Shortness of breath'],
          gastrointestinal: ['Nausea', 'No vomiting'],
          neurological: ['No syncope', 'No dizziness']
        },
        treatment: 'STAT cardiology consult. Activate cardiac catheterization lab. Aspirin 325mg chewed, Clopidogrel 600mg loading dose, Atorvastatin 80mg. IV access, continuous cardiac monitoring. NPO for procedure.'
      },
      emCoding: {
        history: { level: 4, description: 'Comprehensive history in emergency setting' },
        exam: { level: 4, description: 'Comprehensive examination' },
        mdm: { level: 4, description: 'High complexity medical decision making' },
        recommendedCode: '99285',
        confidence: 98,
        rationale: 'High complexity emergency department visit with life-threatening condition'
      }
    }
  ];

  for (let i = 0; i < insertedPatients.length; i++) {
    const scenario = clinicalScenarios[i % clinicalScenarios.length];
    encounterData.push({
      patientId: String(insertedPatients[i].id),
      encounterType: scenario.encounterType,
      date: new Date().toISOString().split('T')[0],
      transcriptionText: scenario.transcriptionText,
      transcriptionConfidence: 95,
      summary: JSON.stringify(scenario.summary),
      emCoding: JSON.stringify(scenario.emCoding),
      processingStatus: 'completed',
      treatmentPlanStatus: 'pending'
    });
  }

  const insertedEncounters = await db.insert(encounters).values(encounterData).returning();

  return {
    patients: insertedPatients.length,
    encounters: insertedEncounters.length
  };
}