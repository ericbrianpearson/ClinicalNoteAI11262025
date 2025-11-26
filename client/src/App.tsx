import { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HealthcareFooter } from "@/components/ui/healthcare-footer";
import { InstallPrompt } from "@/components/InstallPrompt";
import { DeviceDetector } from "@/components/DeviceDetector";
import { MobileInstallBanner } from "@/components/MobileInstallBanner";
import { useAuth } from "@/hooks/use-auth";
import { PatientAuthProvider, usePatientAuth } from "@/hooks/use-patient-auth";
import AuthGate from "@/components/auth/auth-gate";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import HomeDemo from "@/pages/home-demo";
import PatientJourney from "@/pages/patient-journey";
import AdminDashboard from "@/pages/admin-dashboard";
import PatientAuth from "@/pages/PatientAuth";
import PatientPortal from "@/pages/PatientPortal";

function PatientPortalRoutes() {
  const { patient, isLoading } = usePatientAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return <PatientAuth />;
  }

  return <PatientPortal />;
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DeviceDetector />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <Toaster />
        <MobileInstallBanner />
        <Switch>
          {/* Public Demo Route - no authentication required */}
          <Route path="/demo">
            <main className="flex-1">
              <HomeDemo />
            </main>
            <HealthcareFooter />
          </Route>

          {/* Patient Portal Routes - separate authentication */}
          <Route path="/patient-portal">
            <PatientAuthProvider>
              <PatientPortalRoutes />
            </PatientAuthProvider>
          </Route>

          {/* Practitioner Routes - require practitioner authentication */}
          <Route>
            <AuthGate isAuthenticated={isAuthenticated} showDemo={true}>
              <main className="flex-1">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/patient-journey" component={PatientJourney} />
                  <Route path="/admin" component={AdminDashboard} />
                  <Route component={NotFound} />
                </Switch>
              </main>
              <HealthcareFooter />
            </AuthGate>
          </Route>
        </Switch>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
