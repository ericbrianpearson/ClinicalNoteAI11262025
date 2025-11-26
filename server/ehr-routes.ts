import type { Express, Request, Response } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { ehrSystems, ehrSyncLogs, clinicalAlerts, drugInteractions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, AuthenticatedRequest } from "./auth-middleware";

export function registerEHRRoutes(app: Express) {
  // EHR Systems Management
  app.get('/api/ehr/systems', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });
      
      const systems = await storage.getEHRSystems(userId);
      res.json(systems);
    } catch (error) {
      console.error('Failed to fetch EHR systems:', error);
      res.status(500).json({ message: 'Failed to fetch EHR systems' });
    }
  });

  app.post('/api/ehr/connect', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const { systemType, systemName, endpoint, apiKey, orgId } = req.body;

      if (!systemType || !systemName || !endpoint) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const newSystem = await storage.createEHRSystem(userId, systemType, systemName, endpoint);
      
      // Store API credentials securely (in production, use KMS)
      if (apiKey) {
        await storage.updateEHRSystem(newSystem.id, {
          apiKey: apiKey, // In production, encrypt this
          orgId: orgId,
        });
      }

      res.status(201).json({
        message: 'EHR system connected successfully',
        system: newSystem,
      });
    } catch (error) {
      console.error('EHR connection failed:', error);
      res.status(500).json({ message: 'Failed to connect EHR system' });
    }
  });

  app.patch('/api/ehr/systems/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await storage.updateEHRSystem(Number(id), updates);
      if (!updated) {
        return res.status(404).json({ message: 'EHR system not found' });
      }

      res.json({ message: 'EHR system updated', system: updated });
    } catch (error) {
      console.error('Failed to update EHR system:', error);
      res.status(500).json({ message: 'Failed to update EHR system' });
    }
  });

  app.delete('/api/ehr/systems/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEHRSystem(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'EHR system not found' });
      }

      res.json({ message: 'EHR system disconnected' });
    } catch (error) {
      console.error('Failed to delete EHR system:', error);
      res.status(500).json({ message: 'Failed to disconnect EHR system' });
    }
  });

  // EHR Sync Operations
  app.post('/api/ehr/sync/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { syncType, encounterId } = req.body;

      // Simulate sync operation (in production, call actual EHR API)
      const syncLog = await storage.logEHRSync(Number(id), syncType || 'bidirectional', 'pending', 0);

      // Queue async sync job (in production, use job queue)
      setTimeout(async () => {
        try {
          const itemsSynced = Math.floor(Math.random() * 10) + 1;
          await storage.logEHRSync(Number(id), syncType || 'bidirectional', 'success', itemsSynced);
          
          // Update last sync time
          await storage.updateEHRSystem(Number(id), {
            lastSyncAt: new Date(),
          });
        } catch (error) {
          await storage.logEHRSync(Number(id), syncType || 'bidirectional', 'failed', 0);
        }
      }, 2000);

      res.json({
        message: 'Sync initiated',
        syncId: syncLog.id,
        status: 'pending',
      });
    } catch (error) {
      console.error('Sync failed:', error);
      res.status(500).json({ message: 'Failed to initiate sync' });
    }
  });

  app.get('/api/ehr/sync/:id/logs', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const logs = await storage.getEHRSyncLogs(Number(id));
      res.json(logs);
    } catch (error) {
      console.error('Failed to fetch sync logs:', error);
      res.status(500).json({ message: 'Failed to fetch sync logs' });
    }
  });

  // Clinical Alerts
  app.get('/api/clinical/alerts/:encounterId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { encounterId } = req.params;
      const alerts = await storage.getClinicalAlerts(Number(encounterId));
      res.json(alerts);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      res.status(500).json({ message: 'Failed to fetch alerts' });
    }
  });

  app.post('/api/clinical/alerts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { encounterId, alertType, severity, message, suggestedAction } = req.body;

      const alert = await storage.createClinicalAlert(
        Number(encounterId),
        alertType,
        severity,
        message
      );

      res.status(201).json({ message: 'Alert created', alert });
    } catch (error) {
      console.error('Failed to create alert:', error);
      res.status(500).json({ message: 'Failed to create alert' });
    }
  });

  // Drug Interactions Check
  app.post('/api/clinical/check-interactions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { drugs } = req.body;

      if (!Array.isArray(drugs) || drugs.length === 0) {
        return res.status(400).json({ message: 'Invalid drugs list' });
      }

      const interactions = await storage.checkDrugInteractions(drugs);
      res.json({
        drugs,
        interactions,
        hasInteractions: interactions.length > 0,
      });
    } catch (error) {
      console.error('Failed to check interactions:', error);
      res.status(500).json({ message: 'Failed to check drug interactions' });
    }
  });

  // Clinical Entities
  app.get('/api/clinical/entities/:encounterId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { encounterId } = req.params;
      const entities = await storage.getClinicalEntities(Number(encounterId));
      res.json(entities);
    } catch (error) {
      console.error('Failed to fetch entities:', error);
      res.status(500).json({ message: 'Failed to fetch clinical entities' });
    }
  });

  // FHIR Resources Endpoints
  app.get('/api/fhir/Patient/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      // Fetch patient and convert to FHIR format
      const patient = await db.query.patients.findFirst({
        where: (patients, { eq }) => eq(patients.id, Number(id)),
      });

      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      // FHIR Patient Resource Format
      const fhirPatient = {
        resourceType: 'Patient',
        id: String(patient.id),
        identifier: [{
          system: 'urn:healthscribe:patient',
          value: String(patient.id),
        }],
        name: [{
          given: [patient.firstName],
          family: patient.lastName,
        }],
        birthDate: patient.dateOfBirth,
        contact: patient.phone ? [{
          system: 'phone',
          value: patient.phone,
        }] : [],
        address: patient.address ? [{
          text: patient.address,
        }] : [],
      };

      res.set('Content-Type', 'application/fhir+json');
      res.json(fhirPatient);
    } catch (error) {
      console.error('Failed to fetch FHIR Patient:', error);
      res.status(500).json({ error: 'Failed to fetch patient' });
    }
  });

  app.get('/api/fhir/Encounter/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const encounter = await storage.getEncounter(Number(id));
      if (!encounter) {
        return res.status(404).json({ error: 'Encounter not found' });
      }

      // FHIR Encounter Resource Format
      const fhirEncounter = {
        resourceType: 'Encounter',
        id: String(encounter.id),
        identifier: [{
          system: 'urn:healthscribe:encounter',
          value: String(encounter.id),
        }],
        status: encounter.processingStatus === 'completed' ? 'finished' : 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'AMB',
          display: 'ambulatory',
        },
        type: [{
          text: encounter.encounterType,
        }],
        subject: {
          reference: `Patient/${encounter.patientId}`,
        },
        period: {
          start: encounter.createdAt.toISOString(),
          end: encounter.updatedAt.toISOString(),
        },
        reasonCodeableConcept: encounter.summary ? {
          text: JSON.stringify(encounter.summary).substring(0, 255),
        } : undefined,
      };

      res.set('Content-Type', 'application/fhir+json');
      res.json(fhirEncounter);
    } catch (error) {
      console.error('Failed to fetch FHIR Encounter:', error);
      res.status(500).json({ error: 'Failed to fetch encounter' });
    }
  });

  app.get('/api/fhir/Observation/:encounterId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { encounterId } = req.params;

      const entities = await storage.getClinicalEntities(Number(encounterId));

      // Convert clinical entities to FHIR Observation Resources
      const observations = entities.map((entity: any) => ({
        resourceType: 'Observation',
        id: String(entity.id),
        identifier: [{
          system: 'urn:healthscribe:observation',
          value: String(entity.id),
        }],
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: entity.entityType,
            display: entity.entityType,
          }],
        }],
        code: {
          text: entity.entityType,
          coding: entity.standardCode ? [{
            system: 'http://snomed.info/sct',
            code: entity.standardCode,
          }] : [],
        },
        valueString: entity.value,
        valueQuantity: {
          value: entity.confidence,
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%',
        },
        encounter: {
          reference: `Encounter/${encounterId}`,
        },
      }));

      res.set('Content-Type', 'application/fhir+json');
      res.json({
        resourceType: 'Bundle',
        type: 'searchset',
        total: observations.length,
        entry: observations.map((obs: any) => ({
          resource: obs,
        })),
      });
    } catch (error) {
      console.error('Failed to fetch FHIR Observations:', error);
      res.status(500).json({ error: 'Failed to fetch observations' });
    }
  });

  // FHIR Capability Statement
  app.get('/api/fhir/metadata', async (req: Request, res: Response) => {
    try {
      const metadata = {
        resourceType: 'CapabilityStatement',
        version: '1.0.0',
        name: 'HealthScribeAI',
        title: 'Health Scribe AI FHIR API',
        status: 'active',
        experimental: false,
        date: new Date().toISOString(),
        publisher: 'Health Scribe AI',
        description: 'FHIR-compliant API for clinical documentation and EHR integration',
        kind: 'instance',
        software: {
          name: 'HealthScribeAI',
          version: '1.0.0',
        },
        fhirVersion: '4.0.1',
        format: ['application/fhir+json'],
        rest: [{
          mode: 'server',
          resource: [
            {
              type: 'Patient',
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
              ],
            },
            {
              type: 'Encounter',
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
              ],
            },
            {
              type: 'Observation',
              interaction: [
                { code: 'read' },
                { code: 'search-type' },
              ],
            },
          ],
        }],
      };

      res.set('Content-Type', 'application/fhir+json');
      res.json(metadata);
    } catch (error) {
      console.error('Failed to fetch capability statement:', error);
      res.status(500).json({ error: 'Failed to fetch capability statement' });
    }
  });
}
