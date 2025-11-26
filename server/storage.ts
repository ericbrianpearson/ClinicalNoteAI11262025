import { 
  encounters, type Encounter, type InsertEncounter,
  ehrSystems, type InsertAuditLog,
  ehrSyncLogs,
  clinicalAlerts,
  clinicalEntities,
  drugInteractions,
  clinicalAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getEncounter(id: number): Promise<Encounter | undefined>;
  createEncounter(encounter: InsertEncounter): Promise<Encounter>;
  updateEncounter(id: number, updates: Partial<Encounter>): Promise<Encounter | undefined>;
  getEncountersByPatient(patientId: string): Promise<Encounter[]>;
  // EHR Integration methods
  createEHRSystem(userId: number, systemType: string, systemName: string, endpoint: string): Promise<any>;
  getEHRSystems(userId: number): Promise<any[]>;
  updateEHRSystem(id: number, updates: any): Promise<any>;
  deleteEHRSystem(id: number): Promise<boolean>;
  logEHRSync(ehrSystemId: number, syncType: string, status: string, itemsSynced: number): Promise<any>;
  getEHRSyncLogs(ehrSystemId: number, limit: number): Promise<any[]>;
  createClinicalAlert(encounterId: number, alertType: string, severity: string, message: string): Promise<any>;
  getClinicalAlerts(encounterId: number): Promise<any[]>;
  createClinicalEntity(encounterId: number, entityType: string, value: string, confidence: number): Promise<any>;
  getClinicalEntities(encounterId: number): Promise<any[]>;
  checkDrugInteractions(drugs: string[]): Promise<any[]>;
  logClinicalAnalytics(userId: number, metricType: string, value: number, benchmark: number): Promise<any>;
  getClinicalAnalytics(userId: number, timeframe: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getEncounter(id: number): Promise<Encounter | undefined> {
    const [encounter] = await db.select().from(encounters).where(eq(encounters.id, id));
    return encounter || undefined;
  }

  async createEncounter(insertEncounter: InsertEncounter): Promise<Encounter> {
    const [encounter] = await db
      .insert(encounters)
      .values(insertEncounter)
      .returning();
    return encounter;
  }

  async updateEncounter(id: number, updates: Partial<Encounter>): Promise<Encounter | undefined> {
    const [encounter] = await db
      .update(encounters)
      .set(updates)
      .where(eq(encounters.id, id))
      .returning();
    return encounter || undefined;
  }

  async getEncountersByPatient(patientId: string): Promise<Encounter[]> {
    return await db.select().from(encounters).where(eq(encounters.patientId, patientId));
  }

  // EHR System Management
  async createEHRSystem(userId: number, systemType: string, systemName: string, endpoint: string): Promise<any> {
    const [system] = await db
      .insert(ehrSystems)
      .values({
        userId,
        systemType,
        systemName,
        endpoint,
        isActive: true,
      })
      .returning();
    return system;
  }

  async getEHRSystems(userId: number): Promise<any[]> {
    return await db.select().from(ehrSystems).where(eq(ehrSystems.userId, userId));
  }

  async updateEHRSystem(id: number, updates: any): Promise<any> {
    const [system] = await db
      .update(ehrSystems)
      .set(updates)
      .where(eq(ehrSystems.id, id))
      .returning();
    return system;
  }

  async deleteEHRSystem(id: number): Promise<boolean> {
    const result = await db
      .delete(ehrSystems)
      .where(eq(ehrSystems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // EHR Sync Logging
  async logEHRSync(ehrSystemId: number, syncType: string, status: string, itemsSynced: number): Promise<any> {
    const [log] = await db
      .insert(ehrSyncLogs)
      .values({
        ehrSystemId,
        syncType,
        status,
        itemsSynced,
      })
      .returning();
    return log;
  }

  async getEHRSyncLogs(ehrSystemId: number, limit: number = 50): Promise<any[]> {
    return await db
      .select()
      .from(ehrSyncLogs)
      .where(eq(ehrSyncLogs.ehrSystemId, ehrSystemId))
      .orderBy(desc(ehrSyncLogs.createdAt))
      .limit(limit);
  }

  // Clinical Alerts
  async createClinicalAlert(encounterId: number, alertType: string, severity: string, message: string): Promise<any> {
    const [alert] = await db
      .insert(clinicalAlerts)
      .values({
        encounterId,
        alertType,
        severity,
        message,
      })
      .returning();
    return alert;
  }

  async getClinicalAlerts(encounterId: number): Promise<any[]> {
    return await db
      .select()
      .from(clinicalAlerts)
      .where(eq(clinicalAlerts.encounterId, encounterId))
      .orderBy(desc(clinicalAlerts.createdAt));
  }

  // Clinical Entities
  async createClinicalEntity(encounterId: number, entityType: string, value: string, confidence: number): Promise<any> {
    const [entity] = await db
      .insert(clinicalEntities)
      .values({
        encounterId,
        entityType,
        value,
        confidence,
      })
      .returning();
    return entity;
  }

  async getClinicalEntities(encounterId: number): Promise<any[]> {
    return await db
      .select()
      .from(clinicalEntities)
      .where(eq(clinicalEntities.encounterId, encounterId));
  }

  // Drug Interactions
  async checkDrugInteractions(drugs: string[]): Promise<any[]> {
    if (drugs.length < 2) return [];
    return await db
      .select()
      .from(drugInteractions)
      .where(
        sql`(drug_1 IN (${sql.join(drugs, sql`, `)}) AND drug_2 IN (${sql.join(drugs, sql`, `)}))`
      );
  }

  // Clinical Analytics
  async logClinicalAnalytics(userId: number, metricType: string, value: number, benchmark: number): Promise<any> {
    const [metric] = await db
      .insert(clinicalAnalytics)
      .values({
        userId,
        metricType,
        value,
        benchmark,
        timeframe: 'day',
      })
      .returning();
    return metric;
  }

  async getClinicalAnalytics(userId: number, timeframe: string = 'day'): Promise<any[]> {
    return await db
      .select()
      .from(clinicalAnalytics)
      .where(eq(clinicalAnalytics.userId, userId))
      .orderBy(desc(clinicalAnalytics.createdAt));
  }
}

export const storage = new DatabaseStorage();
