import { db } from './db';
import { users, patients, encounters } from '@shared/schema';
import { hashPassword } from './auth';

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Dorothy', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Margaret',
  'Kenneth', 'Carol', 'Kevin', 'Ruth', 'Brian', 'Sharon', 'George', 'Michelle', 'Timothy', 'Laura',
  'Ronald', 'Sarah', 'Jason', 'Kimberly', 'Edward', 'Deborah', 'Jeffrey', 'Dorothy', 'Ryan', 'Lisa'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const MEDICAL_CONDITIONS = [
  'Hypertension', 'Type 2 Diabetes', 'Hyperlipidemia', 'Asthma', 'COPD', 'Depression', 'Anxiety',
  'Osteoarthritis', 'Rheumatoid Arthritis', 'Fibromyalgia', 'Migraine', 'GERD', 'IBS', 'Hypothyroidism',
  'Atrial Fibrillation', 'Heart Failure', 'Coronary Artery Disease', 'Stroke History', 'Sleep Apnea',
  'Chronic Kidney Disease', 'Osteoporosis', 'Psoriasis', 'Eczema', 'Allergic Rhinitis'
];

const ALLERGIES = [
  'Penicillin', 'Sulfa', 'Latex', 'Shellfish', 'Nuts', 'Eggs', 'Dairy', 'Bee stings', 'Dust mites',
  'Pollen', 'Cat dander', 'Dog dander', 'Codeine', 'Aspirin', 'Iodine', 'NKDA'
];

const MEDICATIONS = [
  'Lisinopril 10mg daily', 'Metformin 1000mg BID', 'Atorvastatin 40mg daily', 'Albuterol inhaler PRN',
  'Omeprazole 20mg daily', 'Levothyroxine 100mcg daily', 'Sertraline 50mg daily', 'Ibuprofen 600mg PRN',
  'Amlodipine 5mg daily', 'Hydrochlorothiazide 25mg daily', 'Gabapentin 300mg TID', 'Tramadol 50mg PRN'
];

const CHIEF_COMPLAINTS = [
  'Chest pain and shortness of breath',
  'Abdominal pain and nausea',
  'Headache and dizziness',
  'Back pain and stiffness',
  'Joint pain and swelling',
  'Fatigue and weakness',
  'Cough and fever',
  'Skin rash and itching',
  'Anxiety and depression',
  'Insomnia and mood changes'
];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAge(): number {
  return Math.floor(Math.random() * 70) + 18; // 18-88 years old
}

function randomDate(): string {
  const start = new Date(1940, 0, 1);
  const end = new Date(2005, 11, 31);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function randomPhone(): string {
  const area = Math.floor(Math.random() * 800) + 200;
  const exchange = Math.floor(Math.random() * 800) + 200;
  const number = Math.floor(Math.random() * 9000) + 1000;
  return `(${area}) ${exchange}-${number}`;
}

function generateAddress(): string {
  const streetNumber = Math.floor(Math.random() * 9999) + 1;
  const streets = ['Main St', 'Oak Ave', 'Pine Rd', 'Cedar Dr', 'Maple Ln', 'First St', 'Second Ave', 'Park Blvd'];
  const cities = ['Springfield', 'Franklin', 'Riverside', 'Georgetown', 'Salem', 'Madison', 'Clayton', 'Auburn'];
  const states = ['CA', 'NY', 'TX', 'FL', 'IL', 'PA', 'OH', 'MI', 'GA', 'NC'];
  const zip = Math.floor(Math.random() * 90000) + 10000;
  
  return `${streetNumber} ${randomChoice(streets)}, ${randomChoice(cities)}, ${randomChoice(states)} ${zip}`;
}

export async function createTestPatients() {
  const patients = [];
  
  for (let i = 1; i <= 100; i++) {
    const firstName = randomChoice(FIRST_NAMES);
    const lastName = randomChoice(LAST_NAMES);
    const age = randomAge();
    const gender = Math.random() > 0.5 ? 'male' : 'female';
    
    const patient = {
      id: `P-${String(i).padStart(5, '0')}`,
      name: `${firstName} ${lastName}`,
      dateOfBirth: randomDate(),
      gender: gender as 'male' | 'female',
      phone: randomPhone(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@clinic.example`,
      address: generateAddress(),
      emergencyContact: `${randomChoice(FIRST_NAMES)} ${lastName} - ${randomPhone()}`,
      insuranceInfo: `${randomChoice(['Blue Cross', 'Aetna', 'Cigna', 'UnitedHealth', 'Kaiser'])} - Policy #${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      medicalHistory: Array.from(new Set([...Array(Math.floor(Math.random() * 4) + 1)].map(() => randomChoice(MEDICAL_CONDITIONS)))).join(', '),
      allergies: Array.from(new Set([...Array(Math.floor(Math.random() * 3) + 1)].map(() => randomChoice(ALLERGIES)))).join(', '),
      currentMedications: Array.from(new Set([...Array(Math.floor(Math.random() * 4) + 1)].map(() => randomChoice(MEDICATIONS)))).join(', ')
    };
    
    patients.push(patient);
  }
  
  return patients;
}

export async function createSampleEncounters(patientIds: string[]) {
  const encounters = [];
  
  // Create 20 sample encounters
  for (let i = 0; i < 20; i++) {
    const patientId = randomChoice(patientIds);
    const chiefComplaint = randomChoice(CHIEF_COMPLAINTS);
    
    const encounter = {
      patientId,
      encounterType: randomChoice(['Office Visit', 'Telehealth Visit', 'Follow-up', 'Annual Physical']),
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      chiefComplaint,
      transcriptionText: generateTranscriptionText(chiefComplaint),
      transcriptionConfidence: 0.9 + Math.random() * 0.09,
      summary: JSON.stringify(generateSummary(chiefComplaint)),
      emCoding: JSON.stringify(generateEMCoding()),
      processingStatus: 'completed' as const
    };
    
    encounters.push(encounter);
  }
  
  return encounters;
}

function generateTranscriptionText(chiefComplaint: string): string {
  const templates = {
    'Chest pain and shortness of breath': 'Patient presents with chest pain described as sharp, substernal, 6/10 intensity, onset 2 hours ago. Associated with shortness of breath on minimal exertion. No radiation, no nausea or vomiting. Patient appears comfortable at rest. Vital signs stable. Physical exam reveals clear lung sounds, regular heart rhythm.',
    'Abdominal pain and nausea': 'Patient reports epigastric abdominal pain, cramping in nature, 7/10 intensity, started this morning. Associated with nausea and one episode of vomiting. No fever. Bowel sounds present. Abdomen soft, tenderness in epigastric region.',
    'Headache and dizziness': 'Patient complains of frontal headache, throbbing quality, 8/10 intensity, ongoing for 2 days. Associated with dizziness and photophobia. No neck stiffness. Neurological exam normal.',
    'Back pain and stiffness': 'Patient presents with lower back pain, aching quality, 6/10 intensity, worse with movement. Started after lifting heavy objects yesterday. No radiation to legs. Range of motion limited due to pain.',
    'Joint pain and swelling': 'Patient reports bilateral knee pain and swelling, worse in the morning, improving with activity. Joint stiffness lasting 30 minutes. No warmth or erythema noted on examination.',
    'Fatigue and weakness': 'Patient complains of generalized fatigue and weakness for the past 2 weeks. Reports difficulty performing daily activities. No fever, weight loss, or night sweats. Physical exam unremarkable.',
    'Cough and fever': 'Patient presents with productive cough with yellow sputum, fever up to 101.5°F, onset 3 days ago. Associated with mild shortness of breath. Lung exam reveals crackles in right lower lobe.',
    'Skin rash and itching': 'Patient reports pruritic rash on bilateral arms and legs, present for 1 week. Describes intense itching, worse at night. Examination reveals erythematous papular rash with excoriation marks.',
    'Anxiety and depression': 'Patient reports feeling anxious and depressed for the past month. Difficulty sleeping, loss of appetite, decreased interest in activities. No suicidal ideation. Mood appears depressed.',
    'Insomnia and mood changes': 'Patient complains of difficulty falling asleep and staying asleep for 2 weeks. Reports mood swings and irritability. No substance use. Mental status exam shows mild anxiety.'
  };
  
  return templates[chiefComplaint as keyof typeof templates] || 'Patient presents with chief complaint as stated. History and physical examination documented.';
}

function generateSummary(chiefComplaint: string) {
  const summaryTemplates = {
    'Chest pain and shortness of breath': {
      keyFindings: ['Substernal chest pain', 'Shortness of breath on exertion', 'Stable vital signs', 'Clear lung sounds'],
      diagnosis: 'Chest pain, likely musculoskeletal',
      differentialDiagnosis: [
        { condition: 'Musculoskeletal chest pain', probability: 0.6, reasoning: 'Sharp pain, reproducible' },
        { condition: 'Anxiety', probability: 0.2, reasoning: 'Associated dyspnea' },
        { condition: 'GERD', probability: 0.15, reasoning: 'Substernal location' },
        { condition: 'Cardiac cause', probability: 0.05, reasoning: 'Low risk profile' }
      ],
      reviewOfSystems: {
        cardiovascular: ['Chest pain', 'Shortness of breath', 'No palpitations'],
        respiratory: ['Dyspnea on exertion', 'No cough'],
        constitutional: ['No fever', 'No weight loss']
      },
      treatment: 'NSAIDs for pain relief, reassurance, follow up if symptoms persist or worsen'
    }
  };
  
  return summaryTemplates[chiefComplaint as keyof typeof summaryTemplates] || {
    keyFindings: ['Patient presentation as documented'],
    diagnosis: 'Condition under evaluation',
    differentialDiagnosis: [
      { condition: 'Primary diagnosis', probability: 0.7, reasoning: 'Clinical presentation consistent' }
    ],
    reviewOfSystems: {
      constitutional: ['As documented in history']
    },
    treatment: 'Treatment plan individualized based on assessment'
  };
}

function generateEMCoding() {
  return {
    history: { level: Math.floor(Math.random() * 3) + 2, description: 'Problem focused to comprehensive history' },
    exam: { level: Math.floor(Math.random() * 3) + 2, description: 'Problem focused to comprehensive examination' },
    mdm: { level: Math.floor(Math.random() * 3) + 2, description: 'Straightforward to moderate complexity' },
    recommendedCode: randomChoice(['99212', '99213', '99214']),
    confidence: 0.85 + Math.random() * 0.14,
    rationale: 'E/M level based on documented history, examination, and medical decision making complexity'
  };
}