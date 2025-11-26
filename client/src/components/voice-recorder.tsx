import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Play, Pause } from "lucide-react";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

interface VoiceRecorderProps {
  onAudioReady: (audioFile: File) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onAudioReady, disabled = false }: VoiceRecorderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const {
    isRecording,
    isPaused,
    recordingTime,
    recordingStatus,
    audioUrl,
    startRecording,
    pauseRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      // Handle recording error gracefully
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleProcess = async () => {
    if (!audioUrl) return;
    
    try {
      // Convert blob URL to File
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
      onAudioReady(file);
    } catch (error) {
      console.error('Failed to process recording:', error);
    }
  };

  // Audio visualization component
  const AudioWaveform = () => {
    const bars = Array.from({ length: 20 }, (_, i) => {
      const height = isRecording 
        ? Math.random() * 40 + 20 
        : 20;
      return (
        <div
          key={i}
          className="waveform-bar"
          style={{ 
            height: `${height}px`,
            animationDelay: `${i * 50}ms`
          }}
        />
      );
    });

    return (
      <div className="audio-waveform">
        {bars}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Voice Recording</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {/* Recording Visualization */}
          <div className="mb-6">
            <div className={`w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center mb-4 relative ${
              isRecording ? 'animate-pulse-record' : ''
            }`}>
              <Mic className="text-white text-2xl h-6 w-6" />
              {isRecording && (
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 opacity-20 animate-ping" />
              )}
            </div>
            <div className="text-gray-500 text-sm mb-2">
              <span>{recordingStatus}</span>
            </div>
            <div className="text-2xl font-mono text-blue-600">
              <span>{formatTime(recordingTime)}</span>
            </div>
          </div>

          {/* Audio Waveform */}
          <div className="mb-6 h-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            {isRecording ? (
              <AudioWaveform />
            ) : (
              <span className="text-gray-400 text-sm">Audio waveform will appear here</span>
            )}
          </div>

          {/* Recording Controls */}
          <div className="space-y-3">
            {!isRecording && !audioUrl && (
              <Button 
                onClick={handleStartRecording}
                disabled={disabled}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Recording
              </Button>
            )}
            
            {isRecording && (
              <div className="flex space-x-2">
                <Button 
                  onClick={pauseRecording}
                  disabled={disabled}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button 
                  onClick={stopRecording}
                  disabled={disabled}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            )}

            {audioUrl && !isRecording && (
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Button 
                    onClick={handlePlayPause}
                    variant="outline"
                    className="flex-1"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={clearRecording}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
                <Button 
                  onClick={handleProcess}
                  disabled={disabled}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  Process Recording
                </Button>
              </div>
            )}
          </div>

          {/* Hidden audio element for playback */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
