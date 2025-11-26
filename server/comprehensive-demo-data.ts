export async function createComprehensiveDemoData() {
  const { db } = await import('./db');
  const { patients, encounters } = await import('@shared/schema');

  // Comprehensive patient dataset - diverse demographics and conditions
  const comprehensivePatients = [
    // Pediatric Patients
    {
      practitionerId: 1,
      firstName: 'Emma',
      lastName: 'Rodriguez',
      dateOfBirth: '2018-04-12',
      phone: '(555) 101-2018',
      email: 'maria.rodriguez@family.example',
      address: '1245 Elm Street, Austin, TX 78704',
      emergencyContact: 'Maria Rodriguez (Mother) - (555) 101-2019',
      medicalHistory: 'Born at 38 weeks, no complications',
      allergies: 'None known',
      currentMedications: 'None'
    },
    {
      practitionerId: 1,
      firstName: 'Aiden',
      lastName: 'Thompson',
      dateOfBirth: '2015-09-23',
      phone: '(555) 102-2015',
      email: 'jennifer.thompson@family.example',
      address: '892 Maple Ave, Portland, OR 97205',
      emergencyContact: 'Jennifer Thompson (Mother) - (555) 102-2016',
      medicalHistory: 'Asthma diagnosed age 4, well-controlled',
      allergies: 'Eggs, tree nuts',
      currentMedications: 'Albuterol inhaler PRN, Flovent 44mcg BID'
    },

    // Young Adults
    {
      practitionerId: 1,
      firstName: 'Zara',
      lastName: 'Patel',
      dateOfBirth: '2001-02-14',
      phone: '(555) 201-2001',
      email: 'zara.patel@college.edu',
      address: '678 University Dr, College Station, TX 77840',
      emergencyContact: 'Raj Patel (Father) - (555) 201-2002',
      medicalHistory: 'Depression, anxiety - well managed',
      allergies: 'Latex',
      currentMedications: 'Sertraline 75mg daily, Lorazepam 0.5mg PRN'
    },
    {
      practitionerId: 1,
      firstName: 'Marcus',
      lastName: 'Washington',
      dateOfBirth: '1998-07-19',
      phone: '(555) 202-1998',
      email: 'marcus.washington@athlete.sports',
      address: '434 Sports Complex Rd, Miami, FL 33101',
      emergencyContact: 'Denise Washington (Mother) - (555) 202-1999',
      medicalHistory: 'Previous ACL repair (2020), fully recovered',
      allergies: 'Penicillin',
      currentMedications: 'Multivitamin daily'
    },

    // Adults - Diverse Conditions
    {
      practitionerId: 1,
      firstName: 'Sarah',
      lastName: 'Kim',
      dateOfBirth: '1985-11-03',
      phone: '(555) 301-1985',
      email: 'sarah.kim@tech.company',
      address: '1567 Innovation Blvd, San Francisco, CA 94102',
      emergencyContact: 'David Kim (Spouse) - (555) 301-1986',
      medicalHistory: 'Hypothyroidism, GERD',
      allergies: 'Shellfish, iodine',
      currentMedications: 'Levothyroxine 88mcg daily, Omeprazole 20mg daily'
    },
    {
      practitionerId: 1,
      firstName: 'James',
      lastName: 'O\'Connor',
      dateOfBirth: '1972-05-28',
      phone: '(555) 302-1972',
      email: 'james.oconnor@construction.biz',
      address: '298 Industrial Way, Cleveland, OH 44101',
      emergencyContact: 'Patricia O\'Connor (Wife) - (555) 302-1973',
      medicalHistory: 'Hypertension, Type 2 DM, chronic back pain',
      allergies: 'Codeine',
      currentMedications: 'Lisinopril 20mg daily, Metformin 1000mg BID, Gabapentin 300mg TID'
    },
    {
      practitionerId: 1,
      firstName: 'Fatima',
      lastName: 'Al-Hassan',
      dateOfBirth: '1979-12-08',
      phone: '(555) 303-1979',
      email: 'fatima.alhassan@hospital.org',
      address: '756 Medical Center Dr, Houston, TX 77030',
      emergencyContact: 'Ahmed Al-Hassan (Husband) - (555) 303-1980',
      medicalHistory: 'Migraine headaches, postpartum depression (resolved)',
      allergies: 'Sulfa medications',
      currentMedications: 'Sumatriptan 50mg PRN, Propranolol 40mg BID'
    },
    {
      practitionerId: 1,
      firstName: 'Chen',
      lastName: 'Liu',
      dateOfBirth: '1990-03-17',
      phone: '(555) 304-1990',
      email: 'chen.liu@restaurant.com',
      address: '123 Chinatown Ave, New York, NY 10013',
      emergencyContact: 'Wei Liu (Brother) - (555) 304-1991',
      medicalHistory: 'Hepatitis B (chronic, stable), seasonal allergies',
      allergies: 'Environmental allergens (pollen, dust)',
      currentMedications: 'Claritin 10mg daily during allergy season'
    },

    // Middle-aged Adults
    {
      practitionerId: 1,
      firstName: 'Linda',
      lastName: 'Martinez',
      dateOfBirth: '1968-08-22',
      phone: '(555) 401-1968',
      email: 'linda.martinez@school.edu',
      address: '445 Education Blvd, Phoenix, AZ 85001',
      emergencyContact: 'Carlos Martinez (Husband) - (555) 401-1969',
      medicalHistory: 'Breast cancer survivor (2019), osteopenia',
      allergies: 'NKDA',
      currentMedications: 'Tamoxifen 20mg daily, Calcium + Vitamin D'
    },
    {
      practitionerId: 1,
      firstName: 'Robert',
      lastName: 'Johnson',
      dateOfBirth: '1965-01-15',
      phone: '(555) 402-1965',
      email: 'robert.johnson@finance.corp',
      address: '789 Executive Plaza, Atlanta, GA 30301',
      emergencyContact: 'Susan Johnson (Wife) - (555) 402-1966',
      medicalHistory: 'Coronary artery disease, hyperlipidemia, sleep apnea',
      allergies: 'Aspirin (GI upset)',
      currentMedications: 'Clopidogrel 75mg daily, Atorvastatin 80mg daily, CPAP nightly'
    },

    // Elderly Patients
    {
      practitionerId: 1,
      firstName: 'Eleanor',
      lastName: 'Kowalski',
      dateOfBirth: '1942-06-30',
      phone: '(555) 501-1942',
      email: 'eleanor.kowalski@retired.net',
      address: '234 Senior Living Ct, Minneapolis, MN 55401',
      emergencyContact: 'Michael Kowalski (Son) - (555) 501-1943',
      medicalHistory: 'Atrial fibrillation, osteoarthritis, mild cognitive impairment',
      allergies: 'Penicillin, contrast dye',
      currentMedications: 'Warfarin 5mg daily, Acetaminophen 650mg PRN, Donepezil 10mg daily'
    },
    {
      practitionerId: 1,
      firstName: 'William',
      lastName: 'Anderson',
      dateOfBirth: '1938-11-12',
      phone: '(555) 502-1938',
      email: 'william.anderson@veteran.gov',
      address: '567 Veterans Way, Denver, CO 80201',
      emergencyContact: 'Dorothy Anderson (Wife) - (555) 502-1939',
      medicalHistory: 'COPD, prostate cancer (treated), hearing loss',
      allergies: 'Morphine',
      currentMedications: 'Tiotropium inhaler daily, Finasteride 5mg daily, hearing aids'
    },

    // Complex Medical Cases
    {
      practitionerId: 1,
      firstName: 'Maria',
      lastName: 'Garcia',
      dateOfBirth: '1982-04-05',
      phone: '(555) 601-1982',
      email: 'maria.garcia@community.org',
      address: '891 Community Center St, Los Angeles, CA 90001',
      emergencyContact: 'Jose Garcia (Husband) - (555) 601-1983',
      medicalHistory: 'Lupus (SLE), chronic kidney disease stage 3, depression',
      allergies: 'Trimethoprim-sulfamethoxazole',
      currentMedications: 'Hydroxychloroquine 200mg BID, Prednisone 5mg daily, Lisinopril 10mg daily'
    },
    {
      practitionerId: 1,
      firstName: 'David',
      lastName: 'Brown',
      dateOfBirth: '1955-09-14',
      phone: '(555) 602-1955',
      email: 'david.brown@retiree.net',
      address: '345 Retirement Village, Tampa, FL 33601',
      emergencyContact: 'Nancy Brown (Wife) - (555) 602-1956',
      medicalHistory: 'Chronic heart failure, diabetes type 2, peripheral neuropathy',
      allergies: 'ACE inhibitors (cough)',
      currentMedications: 'Metoprolol 50mg BID, Furosemide 40mg daily, Insulin glargine 30 units'
    },

    // Mental Health Focus
    {
      practitionerId: 1,
      firstName: 'Ashley',
      lastName: 'Turner',
      dateOfBirth: '1993-10-20',
      phone: '(555) 701-1993',
      email: 'ashley.turner@creative.studio',
      address: '678 Arts District, Seattle, WA 98101',
      emergencyContact: 'Jessica Turner (Sister) - (555) 701-1994',
      medicalHistory: 'Bipolar disorder type II, anxiety, ADHD',
      allergies: 'Lithium (rash)',
      currentMedications: 'Lamotrigine 200mg daily, Buspirone 15mg BID, Adderall XR 20mg daily'
    },

    // Chronic Pain Patient
    {
      practitionerId: 1,
      firstName: 'Michael',
      lastName: 'Davis',
      dateOfBirth: '1976-02-28',
      phone: '(555) 801-1976',
      email: 'michael.davis@disability.support',
      address: '123 Accessible Housing, Orlando, FL 32801',
      emergencyContact: 'Sarah Davis (Ex-wife) - (555) 801-1977',
      medicalHistory: 'Fibromyalgia, chronic fatigue syndrome, IBS',
      allergies: 'NSAIDs (stomach upset)',
      currentMedications: 'Pregabalin 150mg BID, Duloxetine 60mg daily, Probiotics daily'
    }
  ];

  // Insert patients
  const insertedPatients = await db.insert(patients).values(comprehensivePatients).returning();

  // Comprehensive encounter scenarios covering all major medical specialties
  const encounterScenarios = [
    // Pediatric Encounters
    {
      patientIndex: 0, // Emma Rodriguez
      encounterType: 'Sick Visit',
      chiefComplaint: 'Fever and ear pain',
      transcriptionText: `6-year-old Hispanic female presents with mother reporting 2 days of fever up to 102.5F, left ear pain, and decreased appetite. Child has been tugging at left ear and crying more than usual. No vomiting, diarrhea, or respiratory symptoms. Patient appears uncomfortable but alert and responsive. Temperature 101.8F, other vitals stable. Left tympanic membrane erythematous and bulging with poor mobility on pneumatic otoscopy. Right ear normal. Throat mildly erythematous, no exudate. Neck supple, no lymphadenopathy.`,
      vitals: { BP: 'Not obtained', HR: 110, Temp: 101.8, RR: 24, O2Sat: 99 },
      assessment: 'Acute otitis media, left ear',
      plan: 'Amoxicillin 400mg/5ml, 8ml BID x 10 days. Ibuprofen for pain/fever. Return if worsening or no improvement in 48-72 hours.'
    },
    {
      patientIndex: 1, // Aiden Thompson
      encounterType: 'Asthma Follow-up',
      chiefComplaint: 'Asthma check-up and medication refill',
      transcriptionText: `9-year-old male with history of well-controlled asthma presents for routine follow-up. Mother reports good control overall, using rescue inhaler 1-2 times per week during soccer season. No recent exacerbations, hospitalizations, or missed school days. Peak flow measurements at home consistently 85-90% of personal best. Physical exam reveals clear lungs bilaterally, no wheezing or retractions. Good technique demonstrated with inhaler use.`,
      vitals: { BP: '98/62', HR: 88, Temp: 98.6, RR: 18, O2Sat: 100 },
      assessment: 'Asthma, well-controlled',
      plan: 'Continue current regimen. Refill Flovent and albuterol. Follow up in 6 months or sooner if control worsens.'
    },

    // Young Adult Mental Health
    {
      patientIndex: 2, // Zara Patel
      encounterType: 'Mental Health Follow-up',
      chiefComplaint: 'Depression and anxiety management',
      transcriptionText: `23-year-old female college student presents for routine mental health follow-up. Reports stable mood on current medication regimen. PHQ-9 score of 6 (mild symptoms). Some increased anxiety with upcoming finals but using coping strategies learned in therapy. Sleep improved to 7-8 hours nightly. Appetite normal. No suicidal ideation. Continues weekly therapy sessions. Social support good with family and friends.`,
      vitals: { BP: '108/68', HR: 72, Temp: 98.4, RR: 16, O2Sat: 99 },
      assessment: 'Major depressive disorder, stable on treatment; Generalized anxiety disorder, well-controlled',
      plan: 'Continue sertraline 75mg daily. PRN lorazepam as needed for acute anxiety. Follow up in 3 months.'
    },

    // Sports Medicine
    {
      patientIndex: 3, // Marcus Washington
      encounterType: 'Sports Physical',
      chiefComplaint: 'Pre-participation sports physical',
      transcriptionText: `26-year-old male professional athlete presents for annual sports physical. No current complaints. Excellent conditioning, trains 6 days per week. Previous ACL reconstruction 4 years ago with full return to sport. No current knee pain or instability. Cardiovascular screening negative. No family history of sudden cardiac death. Physical exam reveals well-developed muscular build, heart regular rate and rhythm with no murmurs, lungs clear, abdomen soft, extremities show full range of motion all joints.`,
      vitals: { BP: '118/72', HR: 52, Temp: 98.2, RR: 14, O2Sat: 100 },
      assessment: 'Healthy young adult athlete, cleared for participation',
      plan: 'Cleared for unrestricted athletic participation. Continue current training regimen. Annual follow-up.'
    },

    // Endocrine/Thyroid
    {
      patientIndex: 4, // Sarah Kim
      encounterType: 'Endocrine Follow-up',
      chiefComplaint: 'Thyroid management and GERD symptoms',
      transcriptionText: `39-year-old Asian female with hypothyroidism presents for routine follow-up. Reports feeling well on current levothyroxine dose. Energy levels good, no hair loss or weight changes. Recent TSH level 2.1 (normal). Also reports occasional heartburn symptoms, well-controlled with omeprazole. No chest pain, difficulty swallowing, or weight loss. Takes medication on empty stomach as directed.`,
      vitals: { BP: '122/78', HR: 68, Temp: 98.7, RR: 16, O2Sat: 99 },
      assessment: 'Hypothyroidism, well-controlled; GERD, stable',
      plan: 'Continue levothyroxine 88mcg daily. Continue omeprazole. Recheck TSH in 6 months.'
    },

    // Diabetes and Hypertension
    {
      patientIndex: 5, // James O'Connor
      encounterType: 'Chronic Disease Management',
      chiefComplaint: 'Diabetes and blood pressure check',
      transcriptionText: `52-year-old male construction worker with diabetes and hypertension presents for routine follow-up. Reports generally good glucose control with occasional highs during stressful work periods. Home blood pressure readings 130-140/80-90. Some lower back pain affecting work, rated 4-5/10, managed with gabapentin. Recent HbA1c 7.2%. No polyuria, polydipsia, or visual changes. Feet without ulcers or numbness.`,
      vitals: { BP: '138/86', HR: 78, Temp: 98.5, RR: 18, O2Sat: 98 },
      assessment: 'Type 2 diabetes, fair control; Hypertension, suboptimal control; Chronic back pain',
      plan: 'Increase lisinopril to 30mg daily. Continue metformin. Diabetes education referral. Physical therapy for back pain.'
    },

    // Neurology/Migraine
    {
      patientIndex: 6, // Fatima Al-Hassan
      encounterType: 'Neurology Follow-up',
      chiefComplaint: 'Migraine headache management',
      transcriptionText: `45-year-old female healthcare worker presents with migraine follow-up. Reports 2-3 migraine episodes per month, usually triggered by stress and lack of sleep due to shift work. Sumatriptan effective when taken early. Propranolol prophylaxis has reduced frequency from daily headaches. No aura, vision changes, or neurological symptoms. Sleep hygiene challenging due to rotating shifts.`,
      vitals: { BP: '118/74', HR: 62, Temp: 98.3, RR: 16, O2Sat: 100 },
      assessment: 'Migraine headaches with good prophylactic control',
      plan: 'Continue propranolol 40mg BID. Sumatriptan PRN for acute episodes. Sleep hygiene counseling.'
    },

    // Infectious Disease/Hepatitis
    {
      patientIndex: 7, // Chen Liu
      encounterType: 'Hepatitis Monitoring',
      chiefComplaint: 'Routine hepatitis B monitoring',
      transcriptionText: `34-year-old male restaurant owner with chronic hepatitis B presents for routine monitoring. Feels well, no fatigue or abdominal pain. No alcohol use. Recent liver function tests stable. HBV DNA undetectable on last check. Maintains healthy diet and regular exercise. Family history significant for hepatitis B in mother.`,
      vitals: { BP: '125/80', HR: 70, Temp: 98.6, RR: 16, O2Sat: 99 },
      assessment: 'Chronic hepatitis B, stable and well-controlled',
      plan: 'Continue monitoring. Repeat LFTs and HBV DNA in 6 months. Hepatitis A vaccination if not immune.'
    },

    // Oncology Follow-up
    {
      patientIndex: 8, // Linda Martinez
      encounterType: 'Cancer Survivorship',
      chiefComplaint: 'Breast cancer follow-up and bone health',
      transcriptionText: `56-year-old female teacher, 5 years post-breast cancer treatment presents for routine oncology follow-up. No concerning symptoms, no new lumps or masses. Recent mammogram normal. Taking tamoxifen as prescribed with mild hot flashes. Bone density scan shows osteopenia, taking calcium and vitamin D supplements. Exercise regularly, non-smoker.`,
      vitals: { BP: '128/82', HR: 75, Temp: 98.4, RR: 16, O2Sat: 99 },
      assessment: 'Breast cancer survivor, no evidence of recurrence; Osteopenia',
      plan: 'Continue tamoxifen. Annual mammography. Consider bisphosphonate therapy for bone health.'
    },

    // Cardiology
    {
      patientIndex: 9, // Robert Johnson
      encounterType: 'Cardiology Follow-up',
      chiefComplaint: 'Coronary artery disease and sleep apnea management',
      transcriptionText: `59-year-old male executive with CAD post-stent and sleep apnea presents for follow-up. Reports good exercise tolerance, walking 2 miles daily without chest pain. Compliant with CPAP therapy, feels more rested. Recent stress test negative. Lipid panel shows LDL 85. No shortness of breath, palpitations, or ankle swelling.`,
      vitals: { BP: '132/78', HR: 68, Temp: 98.5, RR: 16, O2Sat: 98 },
      assessment: 'Coronary artery disease, stable; Sleep apnea, well-controlled on CPAP',
      plan: 'Continue current cardiac medications. CPAP compliance excellent. Annual stress testing.'
    },

    // Geriatric Complex Care
    {
      patientIndex: 10, // Eleanor Kowalski
      encounterType: 'Geriatric Assessment',
      chiefComplaint: 'Routine geriatric care and medication review',
      transcriptionText: `82-year-old female with multiple comorbidities presents for routine care. Family reports some increased confusion and forgetfulness. INR therapeutic on warfarin. Mobility fair with walker, some falls risk. Medication compliance good with pill organizer. Mini-mental status exam shows mild impairment. Social support good with daily assistance from family.`,
      vitals: { BP: '145/85', HR: 88, Temp: 98.2, RR: 18, O2Sat: 96 },
      assessment: 'Mild cognitive impairment; Atrial fibrillation on anticoagulation; Falls risk',
      plan: 'Continue current medications. Home safety evaluation. Cognitive assessment in 6 months.'
    },

    // Pulmonology
    {
      patientIndex: 11, // William Anderson
      encounterType: 'Pulmonology Follow-up',
      chiefComplaint: 'COPD management and shortness of breath',
      transcriptionText: `86-year-old male veteran with COPD presents with mild worsening of shortness of breath over past month. Using rescue inhaler more frequently. No fever, chest pain, or leg swelling. Former smoker, quit 15 years ago. Pulmonary function tests show severe obstruction. Oxygen saturation at rest adequate but drops with exertion.`,
      vitals: { BP: '140/88', HR: 92, Temp: 98.3, RR: 22, O2Sat: 94 },
      assessment: 'COPD exacerbation, mild',
      plan: 'Prednisone burst 40mg x 5 days. Increase tiotropium frequency. Pulmonary rehabilitation referral.'
    },

    // Rheumatology/Autoimmune
    {
      patientIndex: 12, // Maria Garcia
      encounterType: 'Rheumatology Follow-up',
      chiefComplaint: 'Lupus and kidney function monitoring',
      transcriptionText: `42-year-old Hispanic female with SLE presents for routine monitoring. Reports mild joint stiffness in mornings, improved with activity. No new rash or photosensitivity. Fatigue manageable. Recent creatinine stable at 1.4. Urine protein minimal. Blood pressure well-controlled. Medication compliance good.`,
      vitals: { BP: '125/75', HR: 72, Temp: 98.4, RR: 16, O2Sat: 99 },
      assessment: 'Systemic lupus erythematosus, stable; Chronic kidney disease stage 3',
      plan: 'Continue hydroxychloroquine and low-dose prednisone. Monitor renal function every 3 months.'
    },

    // Cardiology Complex
    {
      patientIndex: 13, // David Brown
      encounterType: 'Heart Failure Management',
      chiefComplaint: 'Heart failure and diabetes management',
      transcriptionText: `69-year-old male with heart failure and diabetes presents for routine follow-up. Reports mild ankle swelling by evening, resolved with morning furosemide. Blood sugars running 140-180 despite insulin adjustments. Weight stable. No chest pain or severe shortness of breath. Echo last month showed EF 35%, unchanged.`,
      vitals: { BP: '118/70', HR: 76, Temp: 98.1, RR: 18, O2Sat: 97 },
      assessment: 'Heart failure with reduced ejection fraction, stable; Type 2 diabetes, suboptimal control',
      plan: 'Continue current heart failure regimen. Increase insulin glargine to 35 units. Dietitian referral.'
    },

    // Psychiatry Complex
    {
      patientIndex: 14, // Ashley Turner
      encounterType: 'Psychiatry Follow-up',
      chiefComplaint: 'Bipolar disorder and ADHD management',
      transcriptionText: `31-year-old female artist with bipolar II disorder presents for medication management. Mood stable on current regimen, no recent depression or hypomania. ADHD symptoms well-controlled with stimulant medication. Anxiety manageable with buspirone. Sleep regular 7-8 hours. Creative work going well, good social support network.`,
      vitals: { BP: '115/72', HR: 78, Temp: 98.5, RR: 16, O2Sat: 99 },
      assessment: 'Bipolar II disorder, stable; ADHD, well-controlled; Anxiety disorder, stable',
      plan: 'Continue current medication regimen. Monthly mood monitoring. Therapy referral for coping skills.'
    },

    // Chronic Pain/Fibromyalgia
    {
      patientIndex: 15, // Michael Davis
      encounterType: 'Pain Management',
      chiefComplaint: 'Fibromyalgia and chronic fatigue symptoms',
      transcriptionText: `48-year-old male with fibromyalgia presents for pain management follow-up. Reports widespread pain level 5-6/10 on most days, occasionally 8/10 during flares. Fatigue significantly impacts daily activities. Sleep fragmented despite medications. IBS symptoms controlled with diet modifications. Depression screening negative.`,
      vitals: { BP: '128/84', HR: 82, Temp: 98.3, RR: 18, O2Sat: 98 },
      assessment: 'Fibromyalgia with chronic widespread pain; Chronic fatigue syndrome; IBS, stable',
      plan: 'Continue pregabalin and duloxetine. Sleep study consideration. Gentle exercise program.'
    }
  ];

  // Create encounter data
  const encounterData = encounterScenarios.map((scenario, index) => {
    const patient = insertedPatients[scenario.patientIndex];
    return {
      patientId: String(patient.id),
      encounterType: scenario.encounterType,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Random date within last 90 days
      transcriptionText: scenario.transcriptionText,
      transcriptionConfidence: Math.floor(92 + Math.random() * 8), // 92-100%
      summary: JSON.stringify({
        keyFindings: scenario.transcriptionText.split('.').slice(0, 3).map(s => s.trim()).filter(s => s.length > 10),
        diagnosis: scenario.assessment,
        vitals: scenario.vitals,
        plan: scenario.plan
      }),
      emCoding: JSON.stringify({
        level: ['99213', '99214', '99215'][Math.floor(Math.random() * 3)],
        complexity: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
        timeSpent: 15 + Math.floor(Math.random() * 30)
      }),
      processingStatus: 'completed',
      treatmentPlanStatus: 'completed'
    };
  });

  const insertedEncounters = await db.insert(encounters).values(encounterData).returning();

  return {
    patients: insertedPatients.length,
    encounters: insertedEncounters.length,
    demographics: {
      pediatric: 2,
      youngAdult: 2,
      adult: 8,
      elderly: 4,
      total: 16
    },
    specialties: [
      'Pediatrics', 'Mental Health', 'Sports Medicine', 'Endocrinology',
      'Primary Care', 'Neurology', 'Infectious Disease', 'Oncology',
      'Cardiology', 'Geriatrics', 'Pulmonology', 'Rheumatology',
      'Pain Management', 'Psychiatry'
    ]
  };
}