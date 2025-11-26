import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ReviewOfSystemsProps {
  reviewOfSystems: {
    constitutional?: string[];
    cardiovascular?: string[];
    respiratory?: string[];
    gastrointestinal?: string[];
    genitourinary?: string[];
    musculoskeletal?: string[];
    neurological?: string[];
    psychiatric?: string[];
    endocrine?: string[];
    hematologic?: string[];
    allergic?: string[];
    integumentary?: string[];
  } | null;
}

export default function ReviewOfSystems({ reviewOfSystems }: ReviewOfSystemsProps) {
  if (!reviewOfSystems || Object.keys(reviewOfSystems).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-gray-400" />
            Review of Systems
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No review of systems data extracted from encounter
          </div>
        </CardContent>
      </Card>
    );
  }

  const systemLabels = {
    constitutional: { name: "Constitutional", color: "bg-red-100 text-red-700" },
    cardiovascular: { name: "Cardiovascular", color: "bg-red-100 text-red-700" },
    respiratory: { name: "Respiratory", color: "bg-blue-100 text-blue-700" },
    gastrointestinal: { name: "Gastrointestinal", color: "bg-orange-100 text-orange-700" },
    genitourinary: { name: "Genitourinary", color: "bg-yellow-100 text-yellow-700" },
    musculoskeletal: { name: "Musculoskeletal", color: "bg-green-100 text-green-700" },
    neurological: { name: "Neurological", color: "bg-purple-100 text-purple-700" },
    psychiatric: { name: "Psychiatric", color: "bg-pink-100 text-pink-700" },
    endocrine: { name: "Endocrine", color: "bg-indigo-100 text-indigo-700" },
    hematologic: { name: "Hematologic", color: "bg-teal-100 text-teal-700" },
    allergic: { name: "Allergic/Immunologic", color: "bg-cyan-100 text-cyan-700" },
    integumentary: { name: "Integumentary", color: "bg-emerald-100 text-emerald-700" },
  };

  const positiveFindings = Object.entries(reviewOfSystems).filter(([_, symptoms]) => 
    symptoms && symptoms.length > 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Review of Systems
          <Badge variant="outline" className="ml-auto">
            {positiveFindings.length} system{positiveFindings.length !== 1 ? 's' : ''} with findings
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {positiveFindings.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            All systems reviewed - no positive findings documented
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positiveFindings.map(([systemKey, symptoms]) => {
              const system = systemLabels[systemKey as keyof typeof systemLabels];
              return (
                <div key={systemKey} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{system.name}</h4>
                    <Badge className={`text-xs ${system.color}`}>
                      {symptoms?.length} finding{symptoms?.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <ul className="space-y-1">
                    {symptoms?.map((symptom, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Summary section */}
        {positiveFindings.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">ROS Summary</h4>
            <p className="text-sm text-gray-700">
              Review of systems significant for {positiveFindings.map(([systemKey]) => 
                systemLabels[systemKey as keyof typeof systemLabels].name.toLowerCase()
              ).join(', ')} findings. All other systems reviewed and negative.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}