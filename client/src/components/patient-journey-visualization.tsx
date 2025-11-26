import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, FileText, Activity, Heart, Brain, Pill, Users, TrendingUp, AlertCircle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

interface JourneyEvent {
  id: string;
  date: string;
  type: 'encounter' | 'treatment' | 'medication' | 'lab_result' | 'referral' | 'follow_up';
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'scheduled' | 'cancelled';
  outcome?: 'improved' | 'stable' | 'declined' | 'resolved';
  provider?: string;
  location?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

interface PatientJourneyData {
  patientId: string;
  patientName: string;
  dateOfBirth: string;
  totalEncounters: number;
  avgDaysBetweenVisits: number;
  primaryConditions: string[];
  events: JourneyEvent[];
  milestones: {
    firstVisit: string;
    lastVisit: string;
    longestGap: number;
    totalTreatmentDays: number;
  };
}

const eventTypeConfig = {
  encounter: { icon: FileText, color: "bg-blue-500", label: "Encounter" },
  treatment: { icon: Activity, color: "bg-green-500", label: "Treatment" },
  medication: { icon: Pill, color: "bg-purple-500", label: "Medication" },
  lab_result: { icon: Heart, color: "bg-red-500", label: "Lab Result" },
  referral: { icon: Users, color: "bg-orange-500", label: "Referral" },
  follow_up: { icon: Clock, color: "bg-gray-500", label: "Follow-up" }
};

const outcomeConfig = {
  improved: { color: "bg-green-100 text-green-800", label: "Improved" },
  stable: { color: "bg-blue-100 text-blue-800", label: "Stable" },
  declined: { color: "bg-red-100 text-red-800", label: "Declined" },
  resolved: { color: "bg-emerald-100 text-emerald-800", label: "Resolved" }
};

const priorityConfig = {
  low: { color: "bg-gray-100 text-gray-800", label: "Low" },
  medium: { color: "bg-yellow-100 text-yellow-800", label: "Medium" },
  high: { color: "bg-orange-100 text-orange-800", label: "High" },
  urgent: { color: "bg-red-100 text-red-800", label: "Urgent" }
};

interface PatientJourneyVisualizationProps {
  patientId: string;
}

export default function PatientJourneyVisualization({ patientId }: PatientJourneyVisualizationProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"timeline" | "summary">("timeline");

  const { data: journeyData, isLoading, error } = useQuery({
    queryKey: [`/api/patients/${patientId}/journey`, selectedTimeframe],
    enabled: !!patientId,
  });

  const filteredEvents = journeyData?.events?.filter((event: JourneyEvent) => {
    if (selectedEventTypes.length > 0 && !selectedEventTypes.includes(event.type)) {
      return false;
    }
    
    if (selectedTimeframe !== "all") {
      const eventDate = parseISO(event.date);
      const now = new Date();
      const daysAgo = differenceInDays(now, eventDate);
      
      switch (selectedTimeframe) {
        case "30d":
          return daysAgo <= 30;
        case "90d":
          return daysAgo <= 90;
        case "1y":
          return daysAgo <= 365;
        default:
          return true;
      }
    }
    
    return true;
  }) || [];

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) 
        ? prev.filter(t => t !== eventType)
        : [...prev, eventType]
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Patient Journey Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Loading patient journey...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !journeyData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Patient Journey Visualization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-red-500">
            Unable to load patient journey data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Patient Journey: {journeyData.patientName}
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="timeline">Timeline</SelectItem>
                  <SelectItem value="summary">Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{journeyData.totalEncounters}</div>
              <div className="text-sm text-gray-600">Total Encounters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{journeyData.avgDaysBetweenVisits}</div>
              <div className="text-sm text-gray-600">Avg Days Between Visits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{journeyData.milestones.totalTreatmentDays}</div>
              <div className="text-sm text-gray-600">Treatment Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{journeyData.milestones.longestGap}</div>
              <div className="text-sm text-gray-600">Longest Gap (Days)</div>
            </div>
          </div>
          
          {journeyData.primaryConditions.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Primary Conditions:</div>
              <div className="flex flex-wrap gap-2">
                {journeyData.primaryConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary">{condition}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & View Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Event Types:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(eventTypeConfig).map(([type, config]) => {
                const Icon = config.icon;
                const isSelected = selectedEventTypes.includes(type);
                return (
                  <Button
                    key={type}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleEventType(type)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {config.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey Content */}
      {viewMode === "timeline" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline View ({filteredEvents.length} events)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {filteredEvents.map((event, index) => {
                  const config = eventTypeConfig[event.type];
                  const Icon = config.icon;
                  const isLast = index === filteredEvents.length - 1;
                  
                  return (
                    <div key={event.id} className="relative">
                      {!isLast && (
                        <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={`${config.color} rounded-full p-2 text-white`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <div className="flex items-center gap-2">
                              {event.priority && (
                                <Badge className={priorityConfig[event.priority].color}>
                                  {priorityConfig[event.priority].label}
                                </Badge>
                              )}
                              {event.outcome && (
                                <Badge className={outcomeConfig[event.outcome].color}>
                                  {outcomeConfig[event.outcome].label}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(parseISO(event.date), "MMM d, yyyy")}
                            </span>
                            {event.provider && (
                              <span>Provider: {event.provider}</span>
                            )}
                            {event.location && (
                              <span>Location: {event.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Type Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Event Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(eventTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  const count = filteredEvents.filter(e => e.type === type).length;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{config.label}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Outcome Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Outcome Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(outcomeConfig).map(([outcome, config]) => {
                  const count = filteredEvents.filter(e => e.outcome === outcome).length;
                  if (count === 0) return null;
                  return (
                    <div key={outcome} className="flex items-center justify-between">
                      <Badge className={config.color}>{config.label}</Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}