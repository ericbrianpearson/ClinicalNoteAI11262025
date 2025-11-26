import { faker } from 'faker';
import { db } from './db';
import { users, patients, encounters } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from './auth';

const PRACTICE_TYPES = [
  'family_medicine',
  'internal_medicine',
  'pediatrics',
  'emergency_medicine',
  'cardiology',
  'dermatology',
  'orthopedics',
  'psychiatry',
  'radiology',
  'anesthesiology'
];

const ENCOUNTER_TYPES = [
  'Office Visit',
  'Telehealth Visit',
  'Follow-up',
  'Annual Physical',
  'Consultation',
  'Emergency Visit',
  'Procedure',
  'Surgery Consultation'
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create practitioners
    console.log('Creating practitioners...');
    const practitionerIds: number[] = [];
    
    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();
      const username = faker.internet.userName({ firstName, lastName }).toLowerCase();
      
      // Create trial period (7 days from now)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);
      
      const [practitioner] = await db.insert(users).values({
        email,
        username,
        passwordHash: await hashPassword('password123'), // Default password for demo
        firstName,
        lastName,
        practiceType: faker.helpers.arrayElement(PRACTICE_TYPES),
        licenseNumber: `MD${faker.string.numeric(6)}`,
        subscriptionStatus: i < 3 ? 'active' : 'trial', // First 3 have active subscriptions
        trialEndsAt,
        role: 'practitioner',
        isActive: true,
      }).returning({ id: users.id });
      
      practitionerIds.push(practitioner.id);
    }
    
    console.log(`✅ Created ${practitionerIds.length} practitioners`);
    
    // Create patients
    console.log('Creating patients...');
    const patientIds: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const dateOfBirth = faker.date.birthdate({ min: 18, max: 85, mode: 'age' });
      
      // Assign patients to practitioners (10 patients per practitioner)
      const practitionerId = practitionerIds[Math.floor(i / 10)];
      
      const [patient] = await db.insert(patients).values({
        practitionerId,
        firstName,
        lastName,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        phone: faker.phone.number(),
        address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
        emergencyContact: `${faker.person.fullName()} - ${faker.phone.number()}`,
        allergies: faker.helpers.maybe(() => faker.helpers.arrayElements([
          'Penicillin', 'Peanuts', 'Latex', 'Shellfish', 'Sulfa drugs', 'Aspirin'
        ], { min: 1, max: 3 }).join(', '), { probability: 0.3 }) || 'NKDA',
        medications: faker.helpers.maybe(() => faker.helpers.arrayElements([
          'Lisinopril 10mg daily', 'Metformin 500mg BID', 'Atorvastatin 20mg daily',
          'Levothyroxine 50mcg daily', 'Metoprolol 25mg BID', 'Omeprazole 20mg daily'
        ], { min: 1, max: 4 }).join(', '), { probability: 0.4 }) || 'None',
        medicalHistory: faker.helpers.maybe(() => faker.helpers.arrayElements([
          'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Depression',
          'Anxiety', 'GERD', 'Osteoarthritis', 'Hypothyroidism'
        ], { min: 1, max: 3 }).join(', '), { probability: 0.5 }) || 'No significant past medical history',
        isActive: true,
      }).returning({ id: patients.id });
      
      patientIds.push(patient.id);
    }
    
    console.log(`✅ Created ${patientIds.length} patients`);
    
    // Create sample encounters
    console.log('Creating sample encounters...');
    let encounterCount = 0;
    
    for (let i = 0; i < 50; i++) {
      const patientId = faker.helpers.arrayElement(patientIds);
      // Get the practitioner for this patient
      const [patient] = await db.select().from(patients).where(eq(patients.id, patientId));
      if (!patient) continue;
      
      const encounterDate = faker.date.recent({ days: 90 });
      const encounterType = faker.helpers.arrayElement(ENCOUNTER_TYPES);
      
      // Generate realistic medical encounter content
      const symptoms = faker.helpers.arrayElements([
        'chest pain', 'shortness of breath', 'cough', 'fever', 'headache',
        'abdominal pain', 'nausea', 'fatigue', 'dizziness', 'joint pain'
      ], { min: 1, max: 3 });
      
      const transcriptionText = generateRealisticEncounter(patient, symptoms, encounterType);
      
      await db.insert(encounters).values({
        practitionerId: patient.practitionerId,
        patientId,
        encounterType,
        date: encounterDate.toISOString().split('T')[0],
        transcriptionText,
        transcriptionConfidence: faker.number.int({ min: 85, max: 99 }),
        summary: generateSummary(symptoms, transcriptionText),
        emCoding: generateEMCoding(encounterType, symptoms),
        processingStatus: 'completed',
      });
      
      encounterCount++;
    }
    
    console.log(`✅ Created ${encounterCount} encounters`);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Practitioners: ${practitionerIds.length}
- Patients: ${patientIds.length}  
- Encounters: ${encounterCount}

🔐 Login credentials (all users):
- Password: password123
- Email format: firstname.lastname@example.com
- First 3 practitioners have active subscriptions
- Remaining 7 have trial subscriptions (7 days)
    `);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

function generateRealisticEncounter(patient: any, symptoms: string[], encounterType: string): string {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  
  return `
Patient: ${patient.firstName} ${patient.lastName}, ${age}-year-old presenting for ${encounterType}.

Chief Complaint: Patient reports ${symptoms.join(' and ')} for the past ${faker.number.int({ min: 1, max: 14 })} days.

History of Present Illness: The patient describes the ${symptoms[0]} as ${faker.helpers.arrayElement(['mild', 'moderate', 'severe'])} and ${faker.helpers.arrayElement(['constant', 'intermittent', 'worsening', 'improving'])}. ${faker.helpers.maybe(() => 'Associated symptoms include ' + faker.helpers.arrayElements(['nausea', 'vomiting', 'dizziness', 'sweating'], { min: 1, max: 2 }).join(' and '), { probability: 0.6 }) || 'No associated symptoms reported.'} Patient denies any recent trauma or similar episodes in the past.

Review of Systems: ${faker.helpers.arrayElement(['Negative except as noted above', 'Positive for fatigue and decreased appetite', 'Patient reports some anxiety about symptoms'])}

Physical Examination:
- Vital Signs: BP ${faker.number.int({ min: 110, max: 140 })}/${faker.number.int({ min: 70, max: 90 })}, HR ${faker.number.int({ min: 60, max: 100 })}, RR ${faker.number.int({ min: 12, max: 20 })}, Temp ${faker.number.float({ min: 97.5, max: 99.5, fractionDigits: 1 })}°F
- General: ${faker.helpers.arrayElement(['Well-appearing', 'Mild distress', 'Alert and oriented'])}
- HEENT: ${faker.helpers.arrayElement(['Normal', 'Mild erythema of throat', 'Clear'])}
- Cardiovascular: ${faker.helpers.arrayElement(['Regular rate and rhythm', 'No murmurs', 'Normal S1 S2'])}
- Pulmonary: ${faker.helpers.arrayElement(['Clear to auscultation bilaterally', 'Mild rhonchi', 'Good air movement'])}
- Abdomen: ${faker.helpers.arrayElement(['Soft, non-tender', 'Mild tenderness', 'Normal bowel sounds'])}

Assessment and Plan:
Based on history and physical examination, likely diagnosis is ${generateDiagnosis(symptoms)}. ${generateTreatmentPlan(symptoms, encounterType)}

Patient counseled on symptoms and treatment plan. Follow-up scheduled as needed.
  `.trim();
}

function generateDiagnosis(symptoms: string[]): string {
  const diagnosisMap: Record<string, string[]> = {
    'chest pain': ['Chest pain, atypical', 'Costochondritis', 'GERD'],
    'cough': ['Upper respiratory infection', 'Viral bronchitis', 'Allergic rhinitis'],
    'headache': ['Tension headache', 'Migraine headache', 'Cervical strain'],
    'abdominal pain': ['Gastritis', 'IBS', 'Functional dyspepsia'],
    'fever': ['Viral syndrome', 'Upper respiratory infection'],
    'fatigue': ['Viral syndrome', 'Stress reaction', 'Sleep deprivation'],
  };
  
  for (const symptom of symptoms) {
    if (diagnosisMap[symptom]) {
      return faker.helpers.arrayElement(diagnosisMap[symptom]);
    }
  }
  
  return 'Viral syndrome';
}

function generateSummary(symptoms: string[], transcriptionText: string) {
  return {
    keyFindings: symptoms.map(s => `Patient reports ${s}`),
    diagnosis: generateDiagnosis(symptoms),
    differentialDiagnosis: [
      {
        condition: generateDiagnosis(symptoms),
        probability: faker.number.int({ min: 60, max: 85 }),
        reasoning: 'Based on clinical presentation and symptoms'
      },
      {
        condition: faker.helpers.arrayElement(['Viral syndrome', 'Stress reaction', 'Medication side effect']),
        probability: faker.number.int({ min: 15, max: 40 }),
        reasoning: 'Alternative consideration given symptom pattern'
      }
    ],
    reviewOfSystems: {
      constitutional: symptoms.includes('fever') ? ['Fever'] : [],
      cardiovascular: symptoms.includes('chest pain') ? ['Chest pain'] : [],
      respiratory: symptoms.includes('cough') ? ['Cough'] : [],
      gastrointestinal: symptoms.includes('nausea') ? ['Nausea'] : [],
    },
    treatment: generateTreatmentPlan(symptoms, 'Office Visit')
  };
}

function generateTreatmentPlan(symptoms: string[], encounterType: string): string {
  const treatments = {
    'chest pain': 'Rest, avoid triggers, follow up if worsening',
    'cough': 'Supportive care, increased fluids, cough suppressant PRN',
    'headache': 'Ibuprofen 400mg q6h PRN, stress management',
    'fever': 'Acetaminophen 650mg q6h PRN fever, rest, fluids',
    'abdominal pain': 'Bland diet, avoid triggers, PPI trial',
  };
  
  let plan = 'Supportive care recommended.';
  for (const symptom of symptoms) {
    if (treatments[symptom as keyof typeof treatments]) {
      plan = treatments[symptom as keyof typeof treatments];
      break;
    }
  }
  
  return `${plan} Return to clinic if symptoms worsen or persist beyond 1 week.`;
}

function generateEMCoding(encounterType: string, symptoms: string[]) {
  const historyLevel = symptoms.length >= 2 ? 4 : 3;
  const examLevel = faker.number.int({ min: 2, max: 4 });
  const mdmLevel = symptoms.length >= 3 ? 4 : 3;
  
  const codeMap = {
    2: '99211',
    3: '99213',
    4: '99214',
    5: '99215'
  };
  
  const overallLevel = Math.min(historyLevel, examLevel, mdmLevel);
  
  return {
    history: {
      level: historyLevel,
      description: historyLevel >= 4 ? 'Comprehensive' : 'Detailed'
    },
    exam: {
      level: examLevel,
      description: examLevel >= 4 ? 'Comprehensive' : examLevel >= 3 ? 'Detailed' : 'Problem focused'
    },
    mdm: {
      level: mdmLevel,
      description: mdmLevel >= 4 ? 'High complexity' : 'Moderate complexity'
    },
    recommendedCode: codeMap[overallLevel as keyof typeof codeMap],
    confidence: faker.number.int({ min: 80, max: 95 }),
    rationale: `Based on ${historyLevel >= 4 ? 'comprehensive' : 'detailed'} history and ${examLevel >= 3 ? 'detailed' : 'problem-focused'} examination`
  };
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };