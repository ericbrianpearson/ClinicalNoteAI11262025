import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EMCodingResultsProps {
  emCoding: {
    history: { level: number; description: string };
    exam: { level: number; description: string };
    mdm: { level: number; description: string };
    recommendedCode: string;
    confidence: number;
    rationale: string;
  } | null;
}

export default function EMCodingResults({ emCoding }: EMCodingResultsProps) {
  if (!emCoding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>E/M Auto-Coding Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-4">
            No E/M coding results available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCodeDescription = (code: string) => {
    const codes: Record<string, string> = {
      '99211': 'Office Visit - Established Patient (Level 1)',
      '99212': 'Office Visit - Established Patient (Level 2)',
      '99213': 'Office Visit - Established Patient (Level 3)',
      '99214': 'Office Visit - Established Patient (Level 4)',
      '99215': 'Office Visit - Established Patient (Level 5)',
    };
    return codes[code] || 'Office Visit - Established Patient';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>E/M Auto-Coding Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* History */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">{emCoding.history.level}</div>
            <div className="text-sm font-medium text-gray-700">History</div>
            <div className="text-xs text-gray-500 mt-1">{emCoding.history.description}</div>
          </div>

          {/* Examination */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{emCoding.exam.level}</div>
            <div className="text-sm font-medium text-gray-700">Examination</div>
            <div className="text-xs text-gray-500 mt-1">{emCoding.exam.description}</div>
          </div>

          {/* Decision Making */}
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600 mb-1">{emCoding.mdm.level}</div>
            <div className="text-sm font-medium text-gray-700">Decision Making</div>
            <div className="text-xs text-gray-500 mt-1">{emCoding.mdm.description}</div>
          </div>
        </div>

        {/* Final Code Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Recommended E/M Code</h4>
              <div className="text-3xl font-bold mb-1">{emCoding.recommendedCode}</div>
              <div className="text-sm opacity-90">{getCodeDescription(emCoding.recommendedCode)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Confidence</div>
              <div className="text-2xl font-bold">{emCoding.confidence}%</div>
            </div>
          </div>
        </div>

        {/* Code Justification */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">Coding Rationale</h5>
          <div className="text-sm text-gray-700">
            {emCoding.rationale}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
