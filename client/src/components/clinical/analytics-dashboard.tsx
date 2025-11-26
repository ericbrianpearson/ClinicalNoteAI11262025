// This module displays demo analytics for investor presentation. Replace with real metrics in production.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Activity,
  CheckCircle,
  Target,
  BarChart3,
  Heart
} from 'lucide-react';

interface AnalyticsMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  description: string;
}

interface AnalyticsDashboardProps {
  isAdminView?: boolean;
}

// Demo metrics for investor presentation
const DEMO_METRICS: AnalyticsMetric[] = [
  {
    id: 'time-saved',
    title: 'Avg. Time Saved per Note',
    value: '7 minutes',
    change: '+15%',
    trend: 'up',
    icon: Clock,
    description: 'Compared to traditional documentation methods'
  },
  {
    id: 'satisfaction',
    title: 'Clinician Satisfaction',
    value: '96%',
    change: '+8%',
    trend: 'up',
    icon: Heart,
    description: 'Based on user feedback surveys'
  },
  {
    id: 'accuracy',
    title: 'Documentation Accuracy',
    value: '94.2%',
    change: '+3%',
    trend: 'up',
    icon: Target,
    description: 'AI-assisted error detection and correction'
  },
  {
    id: 'efficiency',
    title: 'Workflow Efficiency',
    value: '89%',
    change: '+12%',
    trend: 'up',
    icon: TrendingUp,
    description: 'Reduction in documentation time and effort'
  }
];

const USAGE_STATS = {
  dailyEncounters: 247,
  activeUsers: 89,
  processingTime: '1.2s',
  uptime: '99.9%'
};

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'up': return 'text-green-600';
    case 'down': return 'text-red-600';
    case 'stable': return 'text-gray-600';
    default: return 'text-gray-600';
  }
}

function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'up': return '↗';
    case 'down': return '↘';
    case 'stable': return '→';
    default: return '→';
  }
}

export default function AnalyticsDashboard({ isAdminView = false }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isAdminView ? 'Admin Analytics' : 'Performance Dashboard'}
          </h2>
          <p className="text-muted-foreground">
            Real-time insights into clinical documentation efficiency
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 w-fit">
          <BarChart3 className="h-3 w-3 mr-1" />
          AI-Powered Analytics
        </Badge>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMO_METRICS.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="transition-all hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <span className={getTrendColor(metric.trend)}>
                    {getTrendIcon(metric.trend)} {metric.change}
                  </span>
                  <span>from last month</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin-specific metrics */}
      {isAdminView && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-time Usage
                </CardTitle>
                <CardDescription>
                  Live system metrics and user activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Daily Encounters</span>
                  <span className="text-lg font-bold">{USAGE_STATS.dailyEncounters}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Active Users</span>
                  <span className="text-lg font-bold">{USAGE_STATS.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Avg. Processing Time</span>
                  <span className="text-lg font-bold text-green-600">{USAGE_STATS.processingTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">System Uptime</span>
                  <span className="text-lg font-bold text-green-600">{USAGE_STATS.uptime}</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Indicators
                </CardTitle>
                <CardDescription>
                  Key performance metrics and benchmarks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">AI Accuracy</span>
                    <span className="text-sm font-bold">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">User Adoption</span>
                    <span className="text-sm font-bold">89%</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Quality Score</span>
                    <span className="text-sm font-bold">96%</span>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Time Efficiency</span>
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                System Health
              </CardTitle>
              <CardDescription>
                Infrastructure and security status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Database: Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">API: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Security: Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">HIPAA: Compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Enterprise Banner */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                AI-Powered, Cloud-Ready
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Built for Azure/OpenAI integration. Enterprise-scale deployment ready.
              </p>
            </div>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
              Cloud Native
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}