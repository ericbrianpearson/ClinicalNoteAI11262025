import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Plus, Settings, Trash2, RefreshCw, CheckCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface EHRSystem {
  id: number;
  systemType: string;
  systemName: string;
  endpoint: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export default function EHRSettings() {
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    systemType: "epic",
    systemName: "",
    endpoint: "",
    apiKey: "",
  });

  const { data: systems = [] } = useQuery<EHRSystem[]>({
    queryKey: ["/api/ehr/systems"],
  });

  const connectMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest("POST", "/api/ehr/connect", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ehr/systems"] });
      setShowConnectForm(false);
      setFormData({ systemType: "epic", systemName: "", endpoint: "", apiKey: "" });
    },
  });

  const syncMutation = useMutation({
    mutationFn: (systemId: number) =>
      apiRequest("POST", `/api/ehr/sync/${systemId}`, { syncType: "bidirectional" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ehr/systems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ehr/sync"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (systemId: number) =>
      apiRequest("DELETE", `/api/ehr/systems/${systemId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ehr/systems"] });
    },
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    connectMutation.mutate(formData);
  };

  const systemTypeOptions = [
    { value: "epic", label: "Epic Systems" },
    { value: "cerner", label: "Cerner" },
    { value: "athena", label: "Athena" },
    { value: "fhir", label: "FHIR Standard" },
    { value: "medidata", label: "Medidata" },
    { value: "allscripts", label: "Allscripts" },
    { value: "nextgen", label: "NextGen Healthcare" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              EHR Integration Settings
            </CardTitle>
            <Button
              onClick={() => setShowConnectForm(!showConnectForm)}
              className="gap-2"
              data-testid="button-add-ehr"
            >
              <Plus className="h-4 w-4" />
              Connect EHR System
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showConnectForm && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <form onSubmit={handleConnect} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">EHR System Type</label>
                      <select
                        value={formData.systemType}
                        onChange={(e) =>
                          setFormData({ ...formData, systemType: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                        data-testid="select-ehr-type"
                      >
                        {systemTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">System Name</label>
                      <Input
                        placeholder="e.g., Main Hospital Epic"
                        value={formData.systemName}
                        onChange={(e) =>
                          setFormData({ ...formData, systemName: e.target.value })
                        }
                        data-testid="input-ehr-name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">API Endpoint</label>
                    <Input
                      type="url"
                      placeholder="https://api.ehrvendor.com/fhir"
                      value={formData.endpoint}
                      onChange={(e) =>
                        setFormData({ ...formData, endpoint: e.target.value })
                      }
                      data-testid="input-ehr-endpoint"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">API Key (Optional)</label>
                    <Input
                      type="password"
                      placeholder="Your EHR API key"
                      value={formData.apiKey}
                      onChange={(e) =>
                        setFormData({ ...formData, apiKey: e.target.value })
                      }
                      data-testid="input-ehr-apikey"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={connectMutation.isPending}
                      className="flex-1"
                      data-testid="button-confirm-connect"
                    >
                      {connectMutation.isPending ? "Connecting..." : "Connect System"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConnectForm(false)}
                      className="flex-1"
                      data-testid="button-cancel-connect"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {systems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No EHR systems connected yet</p>
              <p className="text-sm">Connect your first EHR system to enable bi-directional sync</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(systems as EHRSystem[]).map((system: EHRSystem) => (
                <Card key={system.id} className="border-gray-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="font-medium text-lg">{system.systemName}</p>
                        <p className="text-sm text-gray-500">{system.systemType.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Endpoint</p>
                        <p className="text-sm font-mono truncate">{system.endpoint}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <Badge variant="outline" className="bg-green-50">
                            {system.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Last Sync</p>
                        <p className="text-sm">
                          {system.lastSyncAt
                            ? new Date(system.lastSyncAt).toLocaleDateString()
                            : "Never"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => syncMutation.mutate(system.id)}
                        disabled={syncMutation.isPending}
                        className="gap-1"
                        data-testid={`button-sync-ehr-${system.id}`}
                      >
                        <RefreshCw className="h-3 w-3" />
                        {syncMutation.isPending ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(system.id)}
                        disabled={deleteMutation.isPending}
                        className="gap-1 text-red-600 hover:text-red-700"
                        data-testid={`button-delete-ehr-${system.id}`}
                      >
                        <Trash2 className="h-3 w-3" />
                        Disconnect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FHIR Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">FHIR Compliance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            Health Scribe AI is FHIR R4 compliant and supports bi-directional integration with:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Patient resources with full demographics and contact info</li>
            <li>Encounter data with structured visit information</li>
            <li>Observation resources for clinical findings and vitals</li>
            <li>Clinical entity extraction with SNOMED CT, ICD-10, and RxNorm coding</li>
          </ul>
          <p className="text-xs text-gray-600 mt-3">
            Access our FHIR API at <code className="bg-white px-2 py-1 rounded">/api/fhir</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
