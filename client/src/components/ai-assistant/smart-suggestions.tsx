import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  TrendingUp,
  FileText,
  Stethoscope,
  Workflow
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SmartSuggestion {
  id: number;
  category: 'diagnosis' | 'treatment' | 'coding' | 'workflow';
  suggestion: string;
  confidence: number;
  reasoning: string;
  references?: string[];
  isAccepted?: boolean;
  isRejected?: boolean;
  createdAt: string;
}

interface SmartSuggestionsProps {
  encounterId?: number;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'diagnosis': return <Stethoscope className="h-4 w-4" />;
    case 'treatment': return <FileText className="h-4 w-4" />;
    case 'coding': return <TrendingUp className="h-4 w-4" />;
    case 'workflow': return <Workflow className="h-4 w-4" />;
    default: return <Lightbulb className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'diagnosis': return 'bg-blue-100 text-blue-800';
    case 'treatment': return 'bg-green-100 text-green-800';
    case 'coding': return 'bg-purple-100 text-purple-800';
    case 'workflow': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-600';
  if (confidence >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export default function SmartSuggestions({ encounterId, className }: SmartSuggestionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch suggestions
  const { data: suggestionsData, isLoading } = useQuery({
    queryKey: ['/api/ai/suggestions', encounterId],
    refetchInterval: 30 * 1000 // Refresh every 30 seconds
  });

  // Handle suggestion feedback
  const feedbackMutation = useMutation({
    mutationFn: ({ suggestionId, accepted, feedback }: { suggestionId: number; accepted: boolean; feedback?: string }) => 
      apiRequest(`/api/ai/suggestions/${suggestionId}/feedback`, 'PATCH', { accepted, feedback }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/suggestions'] });
      toast({
        title: "Feedback Recorded",
        description: variables.accepted 
          ? "Thank you for accepting the suggestion. This helps improve our AI recommendations."
          : "Thank you for the feedback. This helps us learn and provide better suggestions.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record feedback. Please try again.",
        variant: "destructive"
      });
    }
  });

  const suggestions: SmartSuggestion[] = (suggestionsData as any)?.suggestions || [];

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>
            AI-powered recommendations based on current encounter and practice patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No suggestions available at the moment.</p>
            <p className="text-sm mt-2">Suggestions will appear as you document the encounter.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Smart Suggestions ({suggestions.length})
        </CardTitle>
        <CardDescription>
          AI-powered recommendations based on current encounter and practice patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="border rounded-lg p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getCategoryIcon(suggestion.category)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(suggestion.category)}`}>
                  {suggestion.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                  {suggestion.confidence}% confidence
                </span>
              </div>
            </div>

            {/* Suggestion Content */}
            <div className="space-y-2">
              <p className="font-medium">{suggestion.suggestion}</p>
              <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
            </div>

            {/* References */}
            {suggestion.references && suggestion.references.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>References: {suggestion.references.join(', ')}</span>
              </div>
            )}

            {/* Action Buttons */}
            {suggestion.isAccepted === undefined && suggestion.isRejected === undefined && (
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => feedbackMutation.mutate({ 
                    suggestionId: suggestion.id, 
                    accepted: true 
                  })}
                  disabled={feedbackMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => feedbackMutation.mutate({ 
                    suggestionId: suggestion.id, 
                    accepted: false,
                    feedback: "Not applicable to current case"
                  })}
                  disabled={feedbackMutation.isPending}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-3 w-3" />
                  Reject
                </Button>
              </div>
            )}

            {/* Feedback Status */}
            {(suggestion.isAccepted || suggestion.isRejected) && (
              <Alert className="mt-2">
                <AlertDescription className="flex items-center gap-2">
                  {suggestion.isAccepted ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Suggestion accepted - Thank you for the feedback!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-700">Suggestion rejected - Your feedback helps improve our AI</span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ))}

        {/* Help Text */}
        <div className="text-xs text-muted-foreground text-center pt-4 border-t">
          <p>Suggestions are personalized based on your practice patterns and current case context.</p>
          <p>Your feedback helps improve the accuracy of future recommendations.</p>
        </div>
      </CardContent>
    </Card>
  );
}