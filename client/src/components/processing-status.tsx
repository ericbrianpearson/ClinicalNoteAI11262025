import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Loader2 } from "lucide-react";

export default function ProcessingStatus() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Processing Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Step 1: Transcription */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Speech-to-Text Transcription</div>
              <div className="text-sm text-gray-500">Audio converted to text using Azure Speech Services</div>
            </div>
            <div className="text-green-600 font-medium text-sm">Complete</div>
          </div>

          {/* Step 2: Text Analytics */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <Loader2 className="text-white h-4 w-4 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Text Analytics & Summary</div>
              <div className="text-sm text-gray-500">Generating encounter summary using AI</div>
            </div>
            <div className="text-amber-600 font-medium text-sm">Processing...</div>
          </div>

          {/* Step 3: E/M Coding */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Clock className="text-gray-500 h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-400">E/M Auto-Coding</div>
              <div className="text-sm text-gray-400">Applying evaluation and management coding rules</div>
            </div>
            <div className="text-gray-400 font-medium text-sm">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
