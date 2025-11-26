import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, RefreshCw, Calendar, User, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TreatmentPlanProps {
  encounterId: number;
  treatment: string;
  status?: 'pending' | 'approved' | 'modified' | 'requires_referral';
  onUpdate?: () => void;
}

interface ReferralRequest {
  specialty: string;
  urgency: 'routine' | 'urgent' | 'stat';
  reason: string;
}

export default function TreatmentPlan({ encounterId, treatment, status = 'pending', onUpdate }: TreatmentPlanProps) {
  const [planStatus, setPlanStatus] = useState(status);
  const [modifications, setModifications] = useState('');
  const [showReferrals, setShowReferrals] = useState(false);
  const [referrals, setReferrals] = useState<ReferralRequest[]>([]);
  const { toast } = useToast();

  const SPECIALTIES = [
    'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 
    'Neurology', 'Orthopedics', 'Psychiatry', 'Pulmonology', 
    'Rheumatology', 'Urology', 'Oncology', 'Ophthalmology'
  ];

  const approvePlanMutation = useMutation({
    mutationFn: async ({ encounterId, action, modifications, referrals }: {
      encounterId: number;
      action: 'approve' | 'modify' | 'reanalyze';
      modifications?: string;
      referrals?: ReferralRequest[];
    }) => {
      return apiRequest(`/api/encounters/${encounterId}/treatment-plan`, {
        method: 'PATCH',
        body: JSON.stringify({ action, modifications, referrals })
      });
    },
    onSuccess: (data) => {
      setPlanStatus(data.status);
      toast({
        title: "Treatment Plan Updated",
        description: data.message,
      });
      onUpdate?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update treatment plan",
        variant: "destructive",
      });
    }
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (encounterId: number) => {
      return apiRequest(`/api/encounters/${encounterId}/reanalyze`, {
        method: 'POST'
      });
    },
    onSuccess: () => {
      toast({
        title: "Reanalysis Initiated",
        description: "The encounter is being reanalyzed with updated clinical guidelines",
      });
      onUpdate?.();
    }
  });

  const handleApprove = () => {
    approvePlanMutation.mutate({
      encounterId,
      action: 'approve'
    });
  };

  const handleModify = () => {
    if (!modifications.trim()) {
      toast({
        title: "Modifications Required",
        description: "Please provide modifications to the treatment plan",
        variant: "destructive",
      });
      return;
    }

    approvePlanMutation.mutate({
      encounterId,
      action: 'modify',
      modifications,
      referrals: referrals.length > 0 ? referrals : undefined
    });
  };

  const handleReanalyze = () => {
    reanalyzeMutation.mutate(encounterId);
  };

  const addReferral = () => {
    setReferrals([...referrals, {
      specialty: '',
      urgency: 'routine',
      reason: ''
    }]);
  };

  const updateReferral = (index: number, field: keyof ReferralRequest, value: string) => {
    const updated = [...referrals];
    updated[index] = { ...updated[index], [field]: value };
    setReferrals(updated);
  };

  const removeReferral = (index: number) => {
    setReferrals(referrals.filter((_, i) => i !== index));
  };

  const getStatusBadge = () => {
    switch (planStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'modified':
        return <Badge className="bg-blue-100 text-blue-800">Modified</Badge>;
      case 'requires_referral':
        return <Badge className="bg-yellow-100 text-yellow-800">Referral Required</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending Review</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Treatment Plan</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Treatment Plan Content */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm leading-relaxed">{treatment}</p>
        </div>

        {/* Action Buttons */}
        {planStatus === 'pending' && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleApprove}
              disabled={approvePlanMutation.isPending}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve Plan
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowReferrals(!showReferrals)}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Add Referrals
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReanalyze}
              disabled={reanalyzeMutation.isPending}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
              Reanalyze
            </Button>
          </div>
        )}

        {/* Modifications Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Modifications/Notes:</label>
          <Textarea
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
            placeholder="Add any modifications to the treatment plan or additional notes..."
            className="min-h-[80px]"
          />
        </div>

        {/* Referrals Section */}
        {showReferrals && (
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Specialist Referrals</h4>
              <Button size="sm" onClick={addReferral}>Add Referral</Button>
            </div>
            
            {referrals.map((referral, index) => (
              <div key={index} className="p-3 border rounded-lg space-y-2">
                <div className="flex gap-2">
                  <select
                    value={referral.specialty}
                    onChange={(e) => updateReferral(index, 'specialty', e.target.value)}
                    className="flex-1 p-2 border rounded text-sm"
                  >
                    <option value="">Select Specialty</option>
                    {SPECIALTIES.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                  
                  <select
                    value={referral.urgency}
                    onChange={(e) => updateReferral(index, 'urgency', e.target.value as any)}
                    className="p-2 border rounded text-sm"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="stat">STAT</option>
                  </select>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => removeReferral(index)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <Textarea
                  value={referral.reason}
                  onChange={(e) => updateReferral(index, 'reason', e.target.value)}
                  placeholder="Reason for referral..."
                  className="text-sm"
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit Modifications */}
        {(modifications.trim() || referrals.length > 0) && planStatus === 'pending' && (
          <Button
            onClick={handleModify}
            disabled={approvePlanMutation.isPending}
            className="w-full"
          >
            Update Treatment Plan
          </Button>
        )}

        {/* Referral Scheduling */}
        {referrals.length > 0 && planStatus !== 'pending' && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Schedule Referrals</h4>
            <div className="space-y-2">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <div>
                    <span className="font-medium">{referral.specialty}</span>
                    <span className="text-sm text-gray-600 ml-2">({referral.urgency})</span>
                  </div>
                  <Button size="sm" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Schedule
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}