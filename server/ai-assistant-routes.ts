import { Express, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from './auth';
import { ClinicalAIAssistant, WorkflowAutomation } from './ai-assistant';
import { db } from './db';
import { aiInsights, workflowTasks, smartSuggestions } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

export function registerAIAssistantRoutes(app: Express) {
  // Get personalized insights for current user
  app.get('/api/ai/insights', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const assistant = new ClinicalAIAssistant(req.user!.id);
      const insights = await assistant.generatePersonalizedInsights();
      
      // Store insights in database for tracking
      for (const insight of insights) {
        await db.insert(aiInsights).values({
          userId: req.user!.id,
          type: insight.type,
          priority: insight.priority,
          title: insight.title,
          description: insight.description,
          recommendation: insight.recommendation || null,
          metrics: insight.metrics || null,
          isActionable: insight.actionable
        }).onConflictDoNothing();
      }
      
      res.json({ insights });
    } catch (error) {
      console.error('Error generating insights:', error);
      res.status(500).json({ error: 'Failed to generate insights' });
    }
  });

  // Get workflow analytics dashboard
  app.get('/api/ai/analytics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const assistant = new ClinicalAIAssistant(req.user!.id);
      const analytics = await assistant.generateWorkflowAnalytics();
      
      res.json({ analytics });
    } catch (error) {
      console.error('Error generating analytics:', error);
      res.status(500).json({ error: 'Failed to generate analytics' });
    }
  });

  // Get smart suggestions for current encounter or general workflow
  app.get('/api/ai/suggestions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const encounterId = req.query.encounterId as string;
      const assistant = new ClinicalAIAssistant(req.user!.id);
      
      let currentEncounter = null;
      if (encounterId) {
        // Fetch encounter details for context-aware suggestions
        const encounters = await db.select()
          .from(require('@shared/schema').encounters)
          .where(eq(require('@shared/schema').encounters.id, parseInt(encounterId)))
          .limit(1);
        currentEncounter = encounters[0] || null;
      }
      
      const suggestions = await assistant.generateSmartSuggestions(currentEncounter);
      
      res.json({ suggestions });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });

  // Mark insight as read
  app.patch('/api/ai/insights/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const insightId = parseInt(req.params.id);
      
      await db.update(aiInsights)
        .set({ isRead: true })
        .where(and(
          eq(aiInsights.id, insightId),
          eq(aiInsights.userId, req.user!.id)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking insight as read:', error);
      res.status(500).json({ error: 'Failed to update insight' });
    }
  });

  // Accept or reject a smart suggestion
  app.patch('/api/ai/suggestions/:id/feedback', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const suggestionId = parseInt(req.params.id);
      const { accepted, feedback } = req.body;
      
      await db.update(smartSuggestions)
        .set({ 
          isAccepted: accepted === true ? true : null,
          isRejected: accepted === false ? true : null,
          feedback: feedback || null
        })
        .where(and(
          eq(smartSuggestions.id, suggestionId),
          eq(smartSuggestions.userId, req.user!.id)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating suggestion feedback:', error);
      res.status(500).json({ error: 'Failed to update suggestion' });
    }
  });

  // Get workflow automation tasks
  app.get('/api/ai/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tasks = await db.select()
        .from(workflowTasks)
        .where(eq(workflowTasks.userId, req.user!.id))
        .orderBy(desc(workflowTasks.priority), workflowTasks.dueDate);
      
      res.json({ tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  // Create automated workflow task
  app.post('/api/ai/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { encounterId, taskType, title, description, dueDate, priority } = req.body;
      
      const [task] = await db.insert(workflowTasks).values({
        userId: req.user!.id,
        encounterId: encounterId || null,
        taskType,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 5
      }).returning();
      
      res.json({ task });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  });

  // Complete a workflow task
  app.patch('/api/ai/tasks/:id/complete', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      
      await db.update(workflowTasks)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(and(
          eq(workflowTasks.id, taskId),
          eq(workflowTasks.userId, req.user!.id)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  });

  // Get prioritized patient queue
  app.get('/api/ai/patient-queue', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prioritizedQueue = await WorkflowAutomation.prioritizePatientQueue(req.user!.id);
      res.json({ queue: prioritizedQueue });
    } catch (error) {
      console.error('Error generating patient queue:', error);
      res.status(500).json({ error: 'Failed to generate patient queue' });
    }
  });

  // Generate patient summary
  app.get('/api/ai/patient-summary/:patientId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const patientId = req.params.patientId;
      const summary = await WorkflowAutomation.generatePatientSummary(patientId);
      res.json({ summary });
    } catch (error) {
      console.error('Error generating patient summary:', error);
      res.status(500).json({ error: 'Failed to generate patient summary' });
    }
  });

  // Auto-schedule follow-up
  app.post('/api/ai/schedule-followup', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { encounterId, followUpDays = 14 } = req.body;
      
      const success = await WorkflowAutomation.autoScheduleFollowUp(encounterId, followUpDays);
      
      if (success) {
        // Create workflow task for follow-up
        await db.insert(workflowTasks).values({
          userId: req.user!.id,
          encounterId,
          taskType: 'follow_up',
          title: `Follow-up appointment scheduled`,
          description: `Patient follow-up scheduled for ${followUpDays} days from encounter`,
          dueDate: new Date(Date.now() + followUpDays * 24 * 60 * 60 * 1000),
          priority: 7
        });
      }
      
      res.json({ success });
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      res.status(500).json({ error: 'Failed to schedule follow-up' });
    }
  });
}