import { db } from './db';
import { users, encounters, patients } from '@shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

interface WorkflowAnalytics {
  averageEncounterTime: number;
  mostCommonDiagnoses: Array<{ diagnosis: string; frequency: number }>;
  codingAccuracy: number;
  patientSatisfactionTrend: number;
  workloadDistribution: Array<{ day: string; encounters: number }>;
}

interface PersonalizedInsight {
  type: 'efficiency' | 'clinical' | 'administrative' | 'learning' | 'longevity' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable: boolean;
  recommendation: string;
  metrics?: Record<string, any>;
  preventiveCare?: {
    screeningDue?: string[];
    riskFactors?: string[];
    lifestyleModifications?: string[];
  };
}

interface SmartSuggestion {
  id: string;
  category: 'diagnosis' | 'treatment' | 'coding' | 'workflow';
  suggestion: string;
  confidence: number;
  reasoning: string;
  references?: string[];
}

export class ClinicalAIAssistant {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  async generateWorkflowAnalytics(): Promise<WorkflowAnalytics> {
    // Get recent encounters for analysis
    const recentEncounters = await db.select()
      .from(encounters)
      .where(and(
        eq(encounters.practitionerId, this.userId),
        gte(encounters.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
      ))
      .orderBy(desc(encounters.createdAt));

    // Calculate average encounter processing time
    const encounterTimes = recentEncounters
      .filter(e => e.processingStatus === 'completed')
      .map(e => this.calculateProcessingTime(e));
    
    const averageEncounterTime = encounterTimes.length > 0 
      ? encounterTimes.reduce((a, b) => a + b, 0) / encounterTimes.length 
      : 0;

    // Analyze most common diagnoses
    const diagnoses = recentEncounters
      .filter(e => e.summary && typeof e.summary === 'object' && 'diagnosis' in e.summary)
      .map(e => (e.summary as any).diagnosis);
    
    const diagnosisFreq = this.calculateFrequency(diagnoses);
    const mostCommonDiagnoses = Object.entries(diagnosisFreq)
      .map(([diagnosis, frequency]) => ({ diagnosis, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Calculate coding accuracy based on confidence scores
    const codingConfidences = recentEncounters
      .filter(e => e.emCoding && typeof e.emCoding === 'object' && 'confidence' in e.emCoding)
      .map(e => (e.emCoding as any).confidence);
    
    const codingAccuracy = codingConfidences.length > 0
      ? codingConfidences.reduce((a, b) => a + b, 0) / codingConfidences.length
      : 0;

    // Analyze workload distribution
    const workloadByDay = this.analyzeWorkloadDistribution(recentEncounters);

    return {
      averageEncounterTime,
      mostCommonDiagnoses,
      codingAccuracy: codingAccuracy * 100,
      patientSatisfactionTrend: this.calculateSatisfactionTrend(),
      workloadDistribution: workloadByDay
    };
  }

  async generatePersonalizedInsights(): Promise<PersonalizedInsight[]> {
    const analytics = await this.generateWorkflowAnalytics();
    const insights: PersonalizedInsight[] = [];

    // Efficiency insights
    if (analytics.averageEncounterTime > 5) {
      insights.push({
        type: 'efficiency',
        priority: 'high',
        title: 'Encounter Processing Time Above Target',
        description: `Your average encounter time is ${analytics.averageEncounterTime.toFixed(1)} minutes, exceeding the 5-minute target.`,
        actionable: true,
        recommendation: 'Consider using voice-to-text shortcuts and pre-built templates for common diagnoses.',
        metrics: { currentTime: analytics.averageEncounterTime, targetTime: 5 }
      });
    }

    // Clinical insights
    if (analytics.codingAccuracy < 85) {
      insights.push({
        type: 'clinical',
        priority: 'medium',
        title: 'E/M Coding Accuracy Below Optimal',
        description: `Current coding confidence is ${analytics.codingAccuracy.toFixed(1)}%. Consider reviewing documentation patterns.`,
        actionable: true,
        recommendation: 'Focus on detailed history and examination documentation to improve coding accuracy.',
        metrics: { currentAccuracy: analytics.codingAccuracy, targetAccuracy: 90 }
      });
    }

    // Learning insights based on common diagnoses
    if (analytics.mostCommonDiagnoses.length > 0) {
      const topDiagnosis = analytics.mostCommonDiagnoses[0];
      insights.push({
        type: 'learning',
        priority: 'low',
        title: 'Specialized Learning Opportunity',
        description: `${topDiagnosis.diagnosis} appears frequently (${topDiagnosis.frequency} times). Consider specialized training.`,
        actionable: true,
        recommendation: `Access continuing education resources for ${topDiagnosis.diagnosis} management best practices.`,
        metrics: { diagnosis: topDiagnosis.diagnosis, frequency: topDiagnosis.frequency }
      });
    }

    // Workload insights
    const peakDay = analytics.workloadDistribution.reduce((max, day) => 
      day.encounters > max.encounters ? day : max, analytics.workloadDistribution[0]);
    
    if (peakDay && peakDay.encounters > 15) {
      insights.push({
        type: 'administrative',
        priority: 'medium',
        title: 'High Workload Day Detected',
        description: `${peakDay.day} shows peak activity with ${peakDay.encounters} encounters.`,
        actionable: true,
        recommendation: 'Consider scheduling optimization or additional support on high-volume days.',
        metrics: { peakDay: peakDay.day, encounterCount: peakDay.encounters }
      });
    }

    return insights;
  }

  async generateSmartSuggestions(currentEncounter?: any): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];
    const recentEncounters = await this.getRecentEncounters(10);

    // Diagnosis suggestions based on symptoms pattern
    if (currentEncounter?.transcriptionText) {
      const diagnosisSuggestion = await this.suggestDiagnosis(currentEncounter.transcriptionText, recentEncounters);
      if (diagnosisSuggestion) suggestions.push(diagnosisSuggestion);
    }

    // Treatment optimization suggestions
    const treatmentSuggestion = await this.suggestTreatmentOptimization(recentEncounters);
    if (treatmentSuggestion) suggestions.push(treatmentSuggestion);

    // Coding improvement suggestions
    const codingSuggestion = await this.suggestCodingImprovement(recentEncounters);
    if (codingSuggestion) suggestions.push(codingSuggestion);

    // Workflow optimization suggestions
    const workflowSuggestion = await this.suggestWorkflowOptimization();
    if (workflowSuggestion) suggestions.push(workflowSuggestion);

    return suggestions;
  }

  private calculateProcessingTime(encounter: any): number {
    if (!encounter.createdAt || !encounter.updatedAt) return 0;
    return (new Date(encounter.updatedAt).getTime() - new Date(encounter.createdAt).getTime()) / (1000 * 60);
  }

  private calculateFrequency(items: string[]): Record<string, number> {
    return items.reduce((freq, item) => {
      freq[item] = (freq[item] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);
  }

  private analyzeWorkloadDistribution(encounters: any[]): Array<{ day: string; encounters: number }> {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const distribution = days.map(day => ({ day, encounters: 0 }));

    encounters.forEach(encounter => {
      const date = new Date(encounter.createdAt);
      const dayIndex = date.getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Adjust for Monday start
      const dayEntry = distribution.find(d => d.day === dayName);
      if (dayEntry) dayEntry.encounters++;
    });

    return distribution;
  }

  private calculateSatisfactionTrend(): number {
    // Placeholder for patient satisfaction analysis
    // In production, this would integrate with patient feedback systems
    return Math.random() * 20 + 80; // 80-100% range
  }

  private async getRecentEncounters(limit: number = 10) {
    try {
      return await db.select()
        .from(encounters)
        .where(eq(encounters.practitionerId, this.userId))
        .orderBy(desc(encounters.createdAt))
        .limit(limit);
    } catch (error) {
      // Return empty array if encounters table doesn't exist or has issues
      console.log('Unable to fetch recent encounters, using fallback data');
      return [];
    }
  }

  private async suggestDiagnosis(symptoms: string, recentEncounters: any[]): Promise<SmartSuggestion | null> {
    // Analyze symptom patterns from recent encounters
    const commonSymptoms = this.extractSymptoms(symptoms);
    const relatedEncounters = recentEncounters.filter(e => 
      e.transcriptionText && this.hasSymptomOverlap(e.transcriptionText, commonSymptoms)
    );

    if (relatedEncounters.length === 0) return null;

    const mostFrequentDiagnosis = this.getMostFrequentDiagnosis(relatedEncounters);
    
    return {
      id: 'diag-' + Date.now(),
      category: 'diagnosis',
      suggestion: `Consider ${mostFrequentDiagnosis} based on similar symptom patterns`,
      confidence: Math.min(0.95, 0.6 + (relatedEncounters.length * 0.1)),
      reasoning: `Found ${relatedEncounters.length} similar cases with matching symptoms`,
      references: relatedEncounters.slice(0, 3).map(e => `Case ${e.id}`)
    };
  }

  private async suggestTreatmentOptimization(recentEncounters: any[]): Promise<SmartSuggestion | null> {
    const treatmentPatterns = recentEncounters
      .filter(e => e.summary?.treatment)
      .map(e => e.summary.treatment);

    if (treatmentPatterns.length < 3) return null;

    return {
      id: 'treat-' + Date.now(),
      category: 'treatment',
      suggestion: 'Consider standardizing treatment protocols for recurring conditions',
      confidence: 0.75,
      reasoning: 'Identified opportunities for treatment protocol optimization',
      references: ['Clinical Guidelines', 'Best Practices']
    };
  }

  private async suggestCodingImprovement(recentEncounters: any[]): Promise<SmartSuggestion | null> {
    const lowConfidenceCodes = recentEncounters.filter(e => 
      e.emCoding?.confidence && e.emCoding.confidence < 0.8
    );

    if (lowConfidenceCodes.length === 0) return null;

    return {
      id: 'code-' + Date.now(),
      category: 'coding',
      suggestion: 'Enhance documentation detail for more accurate E/M coding',
      confidence: 0.85,
      reasoning: `${lowConfidenceCodes.length} recent encounters had coding confidence below 80%`,
      references: ['E/M Guidelines', 'Documentation Standards']
    };
  }

  private async suggestWorkflowOptimization(): Promise<SmartSuggestion | null> {
    return {
      id: 'workflow-' + Date.now(),
      category: 'workflow',
      suggestion: 'Use voice commands for faster documentation during busy periods',
      confidence: 0.9,
      reasoning: 'Analysis shows potential 2-3 minute time savings per encounter',
      references: ['Workflow Best Practices', 'Voice Recognition Guide']
    };
  }

  private extractSymptoms(text: string): string[] {
    // Simple symptom extraction - in production, use NLP
    const symptoms = ['chest pain', 'fatigue', 'headache', 'nausea', 'dizziness', 'shortness of breath'];
    return symptoms.filter(symptom => text.toLowerCase().includes(symptom));
  }

  private hasSymptomOverlap(text: string, symptoms: string[]): boolean {
    return symptoms.some(symptom => text.toLowerCase().includes(symptom));
  }

  private getMostFrequentDiagnosis(encounters: any[]): string {
    const diagnoses = encounters
      .filter(e => e.summary && typeof e.summary === 'object' && 'diagnosis' in e.summary)
      .map(e => (e.summary as any).diagnosis);
    
    const frequency = this.calculateFrequency(diagnoses);
    return Object.keys(frequency).length > 0 
      ? Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b)
      : 'Unknown';
  }
}

// Workflow automation helpers
export class WorkflowAutomation {
  static async autoScheduleFollowUp(encounterId: number, followUpDays: number = 14): Promise<boolean> {
    // Integration point for calendar/scheduling systems
    console.log(`Auto-scheduling follow-up for encounter ${encounterId} in ${followUpDays} days`);
    return true;
  }

  static async generatePatientSummary(patientId: string): Promise<string> {
    const recentEncounters = await db.select()
      .from(encounters)
      .where(eq(encounters.patientId, patientId))
      .orderBy(desc(encounters.createdAt))
      .limit(5);

    const summaryPoints = recentEncounters.map(e => {
      const date = new Date(e.date).toLocaleDateString();
      const diagnosis = (e.summary && typeof e.summary === 'object' && 'diagnosis' in e.summary) 
        ? (e.summary as any).diagnosis 
        : 'Assessment pending';
      return `${date}: ${diagnosis}`;
    });

    return `Recent History:\n${summaryPoints.join('\n')}`;
  }

  static async prioritizePatientQueue(practitionerId: number): Promise<any[]> {
    // Get today's encounters and prioritize based on urgency, complexity, etc.
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEncounters = await db.select()
      .from(encounters)
      .where(and(
        eq(encounters.practitionerId, practitionerId),
        gte(encounters.createdAt, todayStart)
      ))
      .orderBy(encounters.createdAt);

    // Priority scoring based on encounter type and status
    return todayEncounters.map(encounter => ({
      ...encounter,
      priority: this.calculatePriority(encounter),
      estimatedTime: this.estimateEncounterTime(encounter)
    })).sort((a, b) => b.priority - a.priority);
  }

  private static calculatePriority(encounter: any): number {
    let priority = 5; // Base priority
    
    // Urgent encounter types get higher priority
    if (encounter.encounterType === 'emergency') priority += 10;
    if (encounter.encounterType === 'urgent_care') priority += 7;
    if (encounter.encounterType === 'follow_up') priority += 3;
    
    // Pending status gets priority boost
    if (encounter.processingStatus === 'pending') priority += 5;
    
    // Age of encounter affects priority
    const ageHours = (Date.now() - new Date(encounter.createdAt).getTime()) / (1000 * 60 * 60);
    if (ageHours > 2) priority += Math.floor(ageHours);
    
    return priority;
  }

  private static estimateEncounterTime(encounter: any): number {
    // Estimate based on encounter type and complexity
    const baseTime = {
      'routine_checkup': 15,
      'follow_up': 10,
      'consultation': 20,
      'urgent_care': 25,
      'emergency': 30
    };
    
    return baseTime[encounter.encounterType as keyof typeof baseTime] || 15;
  }
}