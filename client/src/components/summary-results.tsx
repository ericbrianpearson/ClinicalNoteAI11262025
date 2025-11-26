import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryResultsProps {
  summary: {
    keyFindings: string[];
    diagnosis: string;
    differentialDiagnosis: Array<{
      condition: string;
      probability: number;
      reasoning: string;
    }>;
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
    };
    treatment: string;
  } | null;
}

export default function SummaryResults({ summary }: SummaryResultsProps) {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No summary available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI-Generated Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Key Findings */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 mb-2">Key Findings</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {summary.keyFindings.map((finding, index) => (
                <li key={index}>{finding}</li>
              ))}
            </ul>
          </div>

          {/* Primary Assessment */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-700 mb-2">Primary Assessment</h4>
            <div className="text-sm text-gray-700">
              {summary.diagnosis}
            </div>
          </div>
        </div>

        {/* Differential Diagnosis */}
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-purple-700 mb-3">Differential Diagnosis</h4>
          <div className="space-y-3">
            {summary.differentialDiagnosis?.map((diff, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{diff.condition}</h5>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${diff.probability}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-purple-600">{diff.probability}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">{diff.reasoning}</p>
              </div>
            )) || <p className="text-sm text-gray-500">No differential diagnoses available</p>}
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="bg-amber-50 rounded-lg p-4">
          <h4 className="font-medium text-amber-700 mb-2">Treatment Plan</h4>
          <div className="text-sm text-gray-700">
            {summary.treatment}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
