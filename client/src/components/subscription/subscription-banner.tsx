import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Clock, AlertTriangle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionBanner() {
  const { user, hasActiveSubscription } = useAuth();
  const { toast } = useToast();

  const upgradeMutation = useMutation({
    mutationFn: async (planType: string) => {
      return apiRequest('POST', '/api/billing/create-checkout-session', {
        priceId: planType === 'pro' ? 'price_pro' : 'price_basic',
        planType,
      });
    },
    onSuccess: (data) => {
      if (data.testMode) {
        toast({
          title: "Subscription Activated",
          description: "Test mode: Your subscription has been activated immediately.",
        });
        // Refresh the page to update subscription status
        window.location.reload();
      } else {
        // In production, redirect to Stripe checkout
        window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Upgrade failed",
        description: error.message || "Failed to start upgrade process",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const isTrialUser = user.subscriptionStatus === 'trial';
  const isExpired = user.subscriptionStatus === 'expired';
  const isActive = user.subscriptionStatus === 'active';

  // Calculate days remaining for trial
  const trialDaysRemaining = user.trialEndsAt 
    ? Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (isActive) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Pro Subscription Active</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                Premium
              </Badge>
            </div>
            <div className="text-sm text-green-600">
              Unlimited encounters • Full features
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isExpired) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="font-medium text-red-800">Trial Expired</div>
                <div className="text-sm text-red-600">Upgrade to continue using all features</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => upgradeMutation.mutate('basic')}
                disabled={upgradeMutation.isPending}
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isTrialUser) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="font-medium text-amber-800">
                  Free Trial - {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining
                </div>
                <div className="text-sm text-amber-600">
                  Upgrade anytime to unlock unlimited access
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => upgradeMutation.mutate('basic')}
                disabled={upgradeMutation.isPending}
              >
                Upgrade to Basic
              </Button>
              <Button 
                size="sm"
                onClick={() => upgradeMutation.mutate('pro')}
                disabled={upgradeMutation.isPending}
              >
                <Crown className="h-4 w-4 mr-1" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}