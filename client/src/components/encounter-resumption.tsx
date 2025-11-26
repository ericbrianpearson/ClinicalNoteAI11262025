import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Clock, FileText, Mic } from 'lucide-react';
import { useAutoSave } from '@/hooks/use-auto-save';

interface PausedEncounter {
  id: number;
  patientId: string;
  encounterType: string;
  pausedAt: string;
  progress: {
    transcriptionComplete: boolean;
    summaryComplete: boolean;
    codingComplete: boolean;
    totalSteps: number;
    completedSteps: number;
  };
  lastActivity: string;
  autoSaveData?: any;
}

interface EncounterResumptionProps {
  onResumeEncounter: (encounterId: number) => void;
  onStartNewEncounter: () => void;
  currentEncounterId?: number;
  isPaused: boolean;
  onPauseEncounter: () => void;
  onUnpauseEncounter: () => void;
}

export default function EncounterResumption({
  onResumeEncounter,
  onStartNewEncounter,
  currentEncounterId,
  isPaused,
  onPauseEncounter,
  onUnpauseEncounter
}: EncounterResumptionProps) {
  const [pausedEncounters, setPausedEncounters] = useState<PausedEncounter[]>([]);
  const [loading, setLoading] = useState(false);

  const { autoSaveData, forceSave, loadFromBackend } = useAutoSave({
    encounterId: currentEncounterId
  });

  // Load paused encounters on mount
  useEffect(() => {
    loadPausedEncounters();
  }, []);

  const loadPausedEncounters = async () => {
    try {
      setLoading(true);
      
      // Check localStorage for paused encounters
      const localPaused = localStorage.getItem('pausedEncounters');
      if (localPaused) {
        const parsed = JSON.parse(localPaused);
        setPausedEncounters(parsed.filter((enc: PausedEncounter) => 
          Date.now() - new Date(enc.pausedAt).getTime() < 7 * 24 * 60 * 60 * 1000 // 7 days
        ));
      }

      // Also fetch from backend
      const response = await fetch('/api/encounters/paused');
      if (response.ok) {
        const backendPaused = await response.json();
        setPausedEncounters(prev => {
          const combined = [...prev, ...backendPaused];
          const unique = combined.filter((enc, index, arr) => 
            arr.findIndex(e => e.id === enc.id) === index
          );
          return unique;
        });
      }
    } catch (error) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const pauseCurrentEncounter = async () => {
    if (!currentEncounterId) return;

    try {
      // Force save current state
      await forceSave();

      const pausedEncounter: PausedEncounter = {
        id: currentEncounterId,
        patientId: autoSaveData.patientId || 'Unknown',
        encounterType: 'Office Visit',
        pausedAt: new Date().toISOString(),
        progress: {
          transcriptionComplete: !!autoSaveData.transcriptionText,
          summaryComplete: false,
          codingComplete: false,
          totalSteps: 6,
          completedSteps: autoSaveData.transcriptionText ? 2 : 1
        },
        lastActivity: 'Recording paused',
        autoSaveData
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('pausedEncounters') || '[]');
      const updated = [...existing.filter((e: PausedEncounter) => e.id !== currentEncounterId), pausedEncounter];
      localStorage.setItem('pausedEncounters', JSON.stringify(updated));

      // Save to backend
      await fetch('/api/encounters/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pausedEncounter)
      });

      setPausedEncounters(prev => [...prev.filter(e => e.id !== currentEncounterId), pausedEncounter]);
      onPauseEncounter();
      
    } catch (error) {
      // Handle error gracefully
    }
  };

  const resumeEncounter = async (encounterId: number) => {
    try {
      setLoading(true);
      
      // Load auto-save data
      await loadFromBackend();
      
      // Remove from paused list
      setPausedEncounters(prev => prev.filter(e => e.id !== encounterId));
      
      const existing = JSON.parse(localStorage.getItem('pausedEncounters') || '[]');
      const updated = existing.filter((e: PausedEncounter) => e.id !== encounterId);
      localStorage.setItem('pausedEncounters', JSON.stringify(updated));

      // Resume encounter
      onResumeEncounter(encounterId);
      onUnpauseEncounter();
      
    } catch (error) {
      // Handle error gracefully
    } finally {
      setLoading(false);
    }
  };

  const deleteEncounter = async (encounterId: number) => {
    try {
      // Remove from localStorage
      const existing = JSON.parse(localStorage.getItem('pausedEncounters') || '[]');
      const updated = existing.filter((e: PausedEncounter) => e.id !== encounterId);
      localStorage.setItem('pausedEncounters', JSON.stringify(updated));

      // Remove from backend
      await fetch(`/api/encounters/${encounterId}/paused`, {
        method: 'DELETE'
      });

      setPausedEncounters(prev => prev.filter(e => e.id !== encounterId));
    } catch (error) {
      // Handle error gracefully
    }
  };

  const formatTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Encounter Controls */}
      {currentEncounterId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Encounter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span className="text-sm">Encounter #{currentEncounterId}</span>
                {isPaused ? (
                  <Badge variant="secondary">Paused</Badge>
                ) : (
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                )}
              </div>
              <div className="flex gap-2">
                {isPaused ? (
                  <Button 
                    size="sm" 
                    onClick={onUnpauseEncounter}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={pauseCurrentEncounter}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paused Encounters */}
      {pausedEncounters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Paused Encounters ({pausedEncounters.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pausedEncounters.map((encounter) => (
              <div 
                key={encounter.id}
                className="p-3 border rounded-lg bg-muted/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {encounter.patientId} - {encounter.encounterType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paused {formatTimeSince(encounter.pausedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => resumeEncounter(encounter.id)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Resume
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteEncounter(encounter.id)}
                      disabled={loading}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{encounter.progress.completedSteps}/{encounter.progress.totalSteps}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ 
                        width: `${(encounter.progress.completedSteps / encounter.progress.totalSteps) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {encounter.progress.transcriptionComplete && (
                    <Badge variant="secondary" className="text-xs">Transcribed</Badge>
                  )}
                  {encounter.progress.summaryComplete && (
                    <Badge variant="secondary" className="text-xs">Summarized</Badge>
                  )}
                  {encounter.progress.codingComplete && (
                    <Badge variant="secondary" className="text-xs">Coded</Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={onStartNewEncounter}
            className="w-full"
            disabled={currentEncounterId && !isPaused}
          >
            <FileText className="h-4 w-4 mr-2" />
            Start New Encounter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}