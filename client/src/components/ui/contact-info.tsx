import { Mail, Phone, MapPin, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactInfoProps {
  variant?: "full" | "compact" | "inline";
  showTitle?: boolean;
}

export function ContactInfo({ variant = "full", showTitle = true }: ContactInfoProps) {
  const contactData = {
    name: "Eric Pearson",
    title: "CEO & President",
    phone: "(706) 618-0236",
    email: "info@nexxusbridge.com",
    company: "NexxusBridge Healthcare AI",
    website: "https://nexxusbridge.com"
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Mail className="h-4 w-4" />
          <a 
            href={`mailto:${contactData.email}`}
            className="hover:text-primary transition-colors"
          >
            {contactData.email}
          </a>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          <a 
            href={`tel:${contactData.phone}`}
            className="hover:text-primary transition-colors"
          >
            {contactData.phone}
          </a>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {showTitle && (
          <div>
            <h4 className="font-semibold text-foreground">{contactData.name}</h4>
            <p className="text-sm text-muted-foreground">{contactData.title}</p>
          </div>
        )}
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`mailto:${contactData.email}`}
              className="text-primary hover:underline"
            >
              {contactData.email}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`tel:${contactData.phone}`}
              className="text-primary hover:underline"
            >
              {contactData.phone}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {showTitle && (
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">{contactData.name}</h3>
              <p className="text-muted-foreground">{contactData.title}</p>
              <p className="text-sm text-muted-foreground">{contactData.company}</p>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <a 
                  href={`mailto:${contactData.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contactData.email}
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Phone</p>
                <a 
                  href={`tel:${contactData.phone}`}
                  className="text-sm text-primary hover:underline"
                >
                  {contactData.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              className="w-full" 
              onClick={() => window.open(`mailto:${contactData.email}?subject=Healthcare AI Platform Inquiry`, '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ContactInfo;