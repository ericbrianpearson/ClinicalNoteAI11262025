import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check } from "lucide-react";

interface TranscriptionResultsProps {
  text: string;
  confidence: number;
  duration: string;
}

export default function TranscriptionResults({ text, confidence, duration }: TranscriptionResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleExport = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Transcription Results</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Confidence:</span>
            <span className="text-sm font-medium text-green-600">{confidence}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-gray-900 leading-relaxed whitespace-pre-wrap">
            {text || "No transcription available"}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            <span>Duration: </span>
            <span>{duration}</span>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="hover:text-blue-600 transition-colors h-auto p-1"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={handleExport}
              variant="ghost"
              size="sm"
              className="hover:text-blue-600 transition-colors h-auto p-1"
            >
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
