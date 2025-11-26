import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Mic, 
  Camera, 
  FileText, 
  Users,
  X 
} from 'lucide-react';

interface FloatingActionButtonProps {
  onNewEncounter?: () => void;
  onVoiceRecord?: () => void;
  onImageCapture?: () => void;
  onNewPatient?: () => void;
}

export default function FloatingActionButton({
  onNewEncounter,
  onVoiceRecord,
  onImageCapture,
  onNewPatient
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      icon: FileText,
      label: 'New Encounter',
      onClick: onNewEncounter,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Mic,
      label: 'Voice Record',
      onClick: onVoiceRecord,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      icon: Camera,
      label: 'Capture Image',
      onClick: onImageCapture,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      icon: Users,
      label: 'New Patient',
      onClick: onNewPatient,
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {/* Action Menu */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={action.label}
                className="flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-lg">
                  <CardContent className="px-3 py-2">
                    <span className="text-sm font-medium whitespace-nowrap">
                      {action.label}
                    </span>
                  </CardContent>
                </Card>
                <Button
                  size="lg"
                  className={`h-12 w-12 rounded-full shadow-lg ${action.color} text-white`}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                >
                  <IconComponent className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 ${
          isOpen 
            ? 'bg-red-600 hover:bg-red-700 rotate-45' 
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}