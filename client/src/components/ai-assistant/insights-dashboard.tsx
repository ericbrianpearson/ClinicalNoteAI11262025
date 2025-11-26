import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  BarChart3,
  Users,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Insight {
  id: number;
  type: 'efficiency' | 'clinical' | 'administrative' | 'learning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation?: string;
  metrics?: Record<string, any>;
  isRead: boolean;
  isActionable: boolean;
  createdAt: string;
}

interface Analytics {
  averageEncounterTime: number;
  mostCommonDiagnoses: Array<{ diagnosis: string; frequency: number }>;
  codingAccuracy: number;
  patientSatisfactionTrend: number;
  workloadDistribution: Array<{ day: string; encounters: number }>;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'efficiency': return <Clock className="h-4 w-4" />;
    case 'clinical': return <Target className="h-4 w-4" />;
    case 'administrative': return <Users className="h-4 w-4" />;
    case 'learning': return <Lightbulb className="h-4 w-4" />;
    default: return <Brain className="h-4 w-4" />;
  }
};

export default function InsightsDashboard() {
  const [selectedTab, setSelectedTab] = useState("insights");
  const queryClient = useQueryClient();

  // Fetch insights
  const { data: insightsData, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai/insights'],
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/ai/analytics'],
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });

  // Mark insight as read
  const markReadMutation = useMutation({
    mutationFn: async (insightId: number) => {
      const response = await fetch(`/api/ai/insights/${insightId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to mark insight as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/insights'] });
    }
  });

  // Handle API response structure properly
  const insights: Insight[] = [];
  const analytics: Analytics = analyticsData ? {
    averageEncounterTime: analyticsData.averageEncounterTime || 0,
    mostCommonDiagnoses: analyticsData.mostCommonDiagnoses || [],
    codingAccuracy: analyticsData.codingAccuracy || 0,
    patientSatisfactionTrend: analyticsData.patientSatisfactionTrend || 0,
    workloadDistribution: analyticsData.workloadDistribution || []
  } : {
    averageEncounterTime: 0,
    mostCommonDiagnoses: [],
    codingAccuracy: 0,
    patientSatisfactionTrend: 0,
    workloadDistribution: []
  };

  const unreadInsights = insights.filter(insight => !insight.isRead);
  const highPriorityInsights = insights.filter(insight => insight.priority === 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Clinical Assistant</h2>
          <p className="text-muted-foreground">
            Personalized insights and workflow optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            {unreadInsights.length} New Insights
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Encounter Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageEncounterTime?.toFixed(1) || '0.0'}m
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 5.0m
            </p>
            <Progress 
              value={Math.min(100, ((5 - (analytics.averageEncounterTime || 0)) / 5) * 100)} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coding Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.codingAccuracy?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Target: 90.0%
            </p>
            <Progress 
              value={analytics.codingAccuracy || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Satisfaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.patientSatisfactionTrend?.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
            <Progress 
              value={analytics.patientSatisfactionTrend || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Insights</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityInsights.length}</div>
            <p className="text-xs text-muted-foreground">
              High priority items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {insightsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : insights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No insights available yet. Continue using the platform to generate personalized recommendations.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <Card key={insight.id} className={`${!insight.isRead ? 'border-blue-200 bg-blue-50/50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(insight.type)}
                        <CardTitle className="text-lg">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(insight.priority)}>
                          {insight.priority}
                        </Badge>
                        {!insight.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markReadMutation.mutate(insight.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <CardDescription>{insight.description}</CardDescription>
                  </CardHeader>
                  {insight.recommendation && (
                    <CardContent>
                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Recommendation:</strong> {insight.recommendation}
                        </AlertDescription>
                      </Alert>
                      {insight.metrics && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          {Object.entries(insight.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analyticsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {/* Most Common Diagnoses */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Common Diagnoses (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.mostCommonDiagnoses?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.mostCommonDiagnoses.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.diagnosis}</span>
                          <div className="flex items-center gap-2">
                            <Progress value={(item.frequency / analytics.mostCommonDiagnoses[0].frequency) * 100} className="w-20" />
                            <span className="text-sm font-medium w-8">{item.frequency}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No diagnosis data available yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Workload Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Workload Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.workloadDistribution?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.workloadDistribution.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{item.day}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.max(...analytics.workloadDistribution.map(d => d.encounters)) > 0 
                                ? (item.encounters / Math.max(...analytics.workloadDistribution.map(d => d.encounters))) * 100 
                                : 0} 
                              className="w-20" 
                            />
                            <span className="text-sm font-medium w-8">{item.encounters}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No workload data available yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="suggestions">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Smart suggestions will appear here during patient encounters.</p>
                <p className="text-sm mt-2">Context-aware recommendations based on current case and your practice patterns.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}