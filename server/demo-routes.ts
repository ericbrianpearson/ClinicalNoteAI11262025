import type { Express, Request, Response } from "express";
import { TextAnalyticsClient, AzureKeyCredential } from "@azure/ai-text-analytics";

// Demo AI Analysis - Public endpoint with rate limiting
export function registerDemoRoutes(app: Express) {
  
  // Demo AI text analysis - PUBLIC with rate limiting
  app.post('/api/demo/analyze-text', async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || text.length > 1000) {
        return res.status(400).json({ 
          error: 'Text required and must be under 1000 characters for demo' 
        });
      }

      // Mock AI analysis for demo (production uses Azure)
      const demoAnalysis = {
        keyFindings: [
          "Patient presents with acute onset symptoms",
          "No significant past medical history",
          "Vital signs within normal limits"
        ],
        diagnosis: "Working diagnosis based on clinical presentation",
        differentialDiagnosis: [
          {
            condition: "Primary consideration",
            probability: 0.7,
            reasoning: "Based on symptom constellation and patient history"
          },
          {
            condition: "Secondary consideration", 
            probability: 0.2,
            reasoning: "Alternative diagnosis to consider"
          }
        ],
        reviewOfSystems: {
          cardiovascular: "Negative",
          respiratory: "Positive for dyspnea",
          neurological: "Negative"
        },
        treatment: "Supportive care and monitoring recommended"
      };

      res.json({
        analysis: demoAnalysis,
        confidence: 0.85,
        isDemo: true,
        message: "Demo analysis - Sign in for full AI capabilities"
      });

    } catch (error) {
      console.error('Demo analysis error:', error);
      res.status(500).json({ 
        error: 'Demo analysis temporarily unavailable',
        isDemo: true 
      });
    }
  });

  // Demo transcription - PUBLIC with limitations
  app.post('/api/demo/transcribe', async (req: Request, res: Response) => {
    try {
      // Demo transcription response
      const demoTranscription = {
        text: "Patient presents with chief complaint of chest pain, started this morning, describes as sharp, radiating to left arm...",
        confidence: 0.92,
        duration: "0:45",
        isDemo: true,
        message: "Demo transcription - Sign in for real audio processing"
      };

      res.json(demoTranscription);

    } catch (error) {
      console.error('Demo transcription error:', error);
      res.status(500).json({ 
        error: 'Demo transcription unavailable',
        isDemo: true 
      });
    }
  });

  // Demo E/M coding - PUBLIC preview
  app.post('/api/demo/em-coding', async (req: Request, res: Response) => {
    try {
      const demoEMCoding = {
        history: {
          level: 3,
          description: "Detailed history obtained"
        },
        exam: {
          level: 3,
          description: "Detailed examination performed"
        },
        mdm: {
          level: 3,
          description: "Moderate complexity medical decision making"
        },
        recommendedCode: "99213",
        confidence: 0.88,
        rationale: "Based on documentation complexity and clinical presentation",
        isDemo: true,
        message: "Demo coding - Sign in for comprehensive E/M analysis"
      };

      res.json(demoEMCoding);

    } catch (error) {
      console.error('Demo E/M coding error:', error);
      res.status(500).json({ 
        error: 'Demo coding unavailable',
        isDemo: true 
      });
    }
  });

  // Demo patient data - PUBLIC sample with diverse demographics
  app.get('/api/demo/patients', async (req: Request, res: Response) => {
    try {
      const demoPatients = [
        {
          id: "P001",
          firstName: "Emma",
          lastName: "Rodriguez",
          dateOfBirth: "2018-04-12",
          age: 6,
          ageGroup: "pediatric",
          medicalHistory: "Born at 38 weeks, no complications",
          allergies: "None known",
          currentMedications: "None",
          isDemo: true
        },
        {
          id: "P002", 
          firstName: "Aiden",
          lastName: "Thompson",
          dateOfBirth: "2015-09-23",
          age: 9,
          ageGroup: "pediatric",
          medicalHistory: "Asthma diagnosed age 4, well-controlled",
          allergies: "Eggs, tree nuts",
          currentMedications: "Albuterol inhaler PRN, Flovent 44mcg BID",
          isDemo: true
        },
        {
          id: "P003",
          firstName: "Zara",
          lastName: "Patel",
          dateOfBirth: "2001-02-14",
          age: 23,
          ageGroup: "young-adult",
          medicalHistory: "Depression, anxiety - well managed",
          allergies: "Latex",
          currentMedications: "Sertraline 75mg daily, Lorazepam 0.5mg PRN",
          isDemo: true
        },
        {
          id: "P006",
          firstName: "James",
          lastName: "O'Connor",
          dateOfBirth: "1972-05-28",
          age: 52,
          ageGroup: "adult",
          medicalHistory: "Hypertension, Type 2 DM, chronic back pain",
          allergies: "Codeine",
          currentMedications: "Lisinopril 20mg daily, Metformin 1000mg BID, Gabapentin 300mg TID",
          isDemo: true
        },
        {
          id: "P010",
          firstName: "Robert",
          lastName: "Johnson",
          dateOfBirth: "1965-01-15",
          age: 59,
          ageGroup: "adult",
          medicalHistory: "Coronary artery disease, hyperlipidemia, sleep apnea",
          allergies: "Aspirin (GI upset)",
          currentMedications: "Clopidogrel 75mg daily, Atorvastatin 80mg daily, CPAP nightly",
          isDemo: true
        },
        {
          id: "P011",
          firstName: "Eleanor",
          lastName: "Kowalski",
          dateOfBirth: "1942-06-30",
          age: 82,
          ageGroup: "elderly",
          medicalHistory: "Atrial fibrillation, osteoarthritis, mild cognitive impairment",
          allergies: "Penicillin, contrast dye",
          currentMedications: "Warfarin 5mg daily, Acetaminophen 650mg PRN, Donepezil 10mg daily",
          isDemo: true
        }
      ];

      res.json({
        patients: demoPatients,
        demographics: {
          pediatric: 2,
          youngAdult: 1,
          adult: 2,
          elderly: 1,
          total: 6
        },
        specialties: ["Pediatrics", "Mental Health", "Primary Care", "Cardiology", "Geriatrics"],
        isDemo: true,
        message: "Comprehensive demo dataset - Sign in for your patient records"
      });

    } catch (error) {
      console.error('Demo patients error:', error);
      res.status(500).json({ 
        error: 'Demo data unavailable',
        isDemo: true 
      });
    }
  });

  // Demo encounter data - PUBLIC sample with diverse clinical scenarios
  app.get('/api/demo/encounters', async (req: Request, res: Response) => {
    try {
      const demoEncounters = [
        {
          id: "E001",
          patientId: "P001",
          date: "2024-12-15",
          encounterType: "Sick Visit",
          chiefComplaint: "Fever and ear pain",
          transcriptionText: "6-year-old Hispanic female presents with mother reporting 2 days of fever up to 102.5F, left ear pain, and decreased appetite. Child has been tugging at left ear and crying more than usual. Temperature 101.8F, other vitals stable. Left tympanic membrane erythematous and bulging with poor mobility on pneumatic otoscopy.",
          summary: {
            keyFindings: ["Fever 101.8F", "Left ear pain", "Erythematous bulging tympanic membrane"],
            diagnosis: "Acute otitis media, left ear",
            vitals: { HR: 110, Temp: 101.8, RR: 24, O2Sat: 99 },
            plan: "Amoxicillin 400mg/5ml, 8ml BID x 10 days. Ibuprofen for pain/fever."
          },
          aiPrediction: {
            diagnosis: "Acute otitis media",
            confidence: 94,
            warnings: ["Verify antibiotic dosing for pediatric patient"]
          },
          specialty: "Pediatrics",
          status: "completed",
          isDemo: true
        },
        {
          id: "E002",
          patientId: "P002",
          date: "2024-12-10",
          encounterType: "Asthma Follow-up",
          chiefComplaint: "Asthma check-up and medication refill",
          transcriptionText: "9-year-old male with history of well-controlled asthma presents for routine follow-up. Mother reports good control overall, using rescue inhaler 1-2 times per week during soccer season. No recent exacerbations, hospitalizations, or missed school days. Peak flow measurements at home consistently 85-90% of personal best.",
          summary: {
            keyFindings: ["Well-controlled asthma", "Clear lungs", "Good peak flow measurements"],
            diagnosis: "Asthma, well-controlled",
            vitals: { BP: "98/62", HR: 88, Temp: 98.6, RR: 18, O2Sat: 100 },
            plan: "Continue current regimen. Refill medications. Follow up in 6 months."
          },
          aiPrediction: {
            diagnosis: "Asthma, well-controlled",
            confidence: 97,
            warnings: []
          },
          specialty: "Pulmonology",
          status: "completed",
          isDemo: true
        },
        {
          id: "E003",
          patientId: "P003",
          date: "2024-12-08",
          encounterType: "Mental Health Follow-up",
          chiefComplaint: "Depression and anxiety management",
          transcriptionText: "23-year-old female college student presents for routine mental health follow-up. Reports stable mood on current medication regimen. PHQ-9 score of 6 (mild symptoms). Some increased anxiety with upcoming finals but using coping strategies learned in therapy. Sleep improved to 7-8 hours nightly.",
          summary: {
            keyFindings: ["Stable mood", "PHQ-9 score 6", "Good sleep pattern"],
            diagnosis: "Major depressive disorder, stable; Generalized anxiety disorder, well-controlled",
            vitals: { BP: "108/68", HR: 72, Temp: 98.4, RR: 16, O2Sat: 99 },
            plan: "Continue sertraline 75mg daily. Follow up in 3 months."
          },
          aiPrediction: {
            diagnosis: "Depression and anxiety, stable",
            confidence: 91,
            warnings: ["Monitor for seasonal affective patterns"]
          },
          specialty: "Mental Health",
          status: "completed",
          isDemo: true
        },
        {
          id: "E004",
          patientId: "P006",
          date: "2024-12-05",
          encounterType: "Chronic Disease Management",
          chiefComplaint: "Diabetes and blood pressure check",
          transcriptionText: "52-year-old male construction worker with diabetes and hypertension presents for routine follow-up. Reports generally good glucose control with occasional highs during stressful work periods. Home blood pressure readings 130-140/80-90. Some lower back pain affecting work, rated 4-5/10, managed with gabapentin. Recent HbA1c 7.2%.",
          summary: {
            keyFindings: ["HbA1c 7.2%", "BP 130-140/80-90", "Chronic back pain 4-5/10"],
            diagnosis: "Type 2 diabetes, fair control; Hypertension, suboptimal control; Chronic back pain",
            vitals: { BP: "138/86", HR: 78, Temp: 98.5, RR: 18, O2Sat: 98 },
            plan: "Increase lisinopril to 30mg daily. Continue metformin. PT referral for back pain."
          },
          aiPrediction: {
            diagnosis: "Type 2 DM with suboptimal BP control",
            confidence: 96,
            warnings: ["Consider ACE inhibitor dose adjustment", "Evaluate pain management options"]
          },
          specialty: "Primary Care",
          status: "completed",
          isDemo: true
        },
        {
          id: "E005",
          patientId: "P010",
          date: "2024-12-03",
          encounterType: "Cardiology Follow-up",
          chiefComplaint: "Heart disease and sleep apnea management",
          transcriptionText: "59-year-old male executive with CAD post-stent and sleep apnea presents for follow-up. Reports good exercise tolerance, walking 2 miles daily without chest pain. Compliant with CPAP therapy, feels more rested. Recent stress test negative. Lipid panel shows LDL 85.",
          summary: {
            keyFindings: ["Good exercise tolerance", "Negative stress test", "LDL 85"],
            diagnosis: "Coronary artery disease, stable; Sleep apnea, well-controlled on CPAP",
            vitals: { BP: "132/78", HR: 68, Temp: 98.5, RR: 16, O2Sat: 98 },
            plan: "Continue current cardiac medications. Annual stress testing."
          },
          aiPrediction: {
            diagnosis: "CAD stable, OSA well-controlled",
            confidence: 98,
            warnings: []
          },
          specialty: "Cardiology",
          status: "completed",
          isDemo: true
        },
        {
          id: "E006",
          patientId: "P011",
          date: "2024-11-28",
          encounterType: "Geriatric Assessment",
          chiefComplaint: "Routine geriatric care and medication review",
          transcriptionText: "82-year-old female with multiple comorbidities presents for routine care. Family reports some increased confusion and forgetfulness. INR therapeutic on warfarin. Mobility fair with walker, some falls risk. Medication compliance good with pill organizer. Mini-mental status exam shows mild impairment.",
          summary: {
            keyFindings: ["Increased confusion", "INR therapeutic", "Falls risk with walker"],
            diagnosis: "Mild cognitive impairment; Atrial fibrillation on anticoagulation; Falls risk",
            vitals: { BP: "145/85", HR: 88, Temp: 98.2, RR: 18, O2Sat: 96 },
            plan: "Continue current medications. Home safety evaluation. Cognitive assessment in 6 months."
          },
          aiPrediction: {
            diagnosis: "MCI with multiple comorbidities",
            confidence: 89,
            warnings: ["Monitor for medication interactions", "Fall prevention strategies needed"]
          },
          specialty: "Geriatrics",
          status: "completed",
          isDemo: true
        }
      ];

      res.json({
        encounters: demoEncounters,
        analytics: {
          totalEncounters: 6,
          specialtiesRepresented: 6,
          avgAiConfidence: 94.2,
          encounterTypes: {
            "Sick Visit": 1,
            "Follow-up": 4,
            "Assessment": 1
          }
        },
        isDemo: true,
        message: "Comprehensive clinical encounters - Sign in for your clinical data"
      });

    } catch (error) {
      console.error('Demo encounters error:', error);
      res.status(500).json({ 
        error: 'Demo data unavailable',
        isDemo: true 
      });
    }
  });
}