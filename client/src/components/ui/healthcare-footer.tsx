import React from 'react';
import { Shield, Phone, Mail, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface HealthcareFooterProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export function HealthcareFooter({ variant = 'full', className = '' }: HealthcareFooterProps) {
  const healthcareResources = [
    {
      title: 'HHS HIPAA Guidelines',
      url: 'https://www.hhs.gov/hipaa/for-professionals/index.html',
      description: 'Official HIPAA compliance guidelines from Health & Human Services'
    },
    {
      title: 'CMS Documentation Standards',
      url: 'https://www.cms.gov/medicare/regulations-guidance/guidance/manuals/internet-only-manuals-ioms',
      description: 'Medicare documentation and billing guidance'
    },
    {
      title: 'FDA Digital Health Center',
      url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence',
      description: 'Digital health technology regulatory guidance'
    },
    {
      title: 'AMA AI in Medicine Guidelines',
      url: 'https://www.ama-assn.org/practice-management/digital/augmented-intelligence-ai-medicine',
      description: 'Professional standards for AI in clinical practice'
    },
    {
      title: 'AAPC Medical Coding Resources',
      url: 'https://www.aapc.com/resources/medical-coding/',
      description: 'Professional medical coding standards and education'
    }
  ];

  const securityFrameworks = [
    {
      title: 'NIST Cybersecurity Framework',
      url: 'https://www.nist.gov/cyberframework',
      description: 'National cybersecurity standards and guidelines'
    },
    {
      title: 'AICPA SOC 2 Guidelines',
      url: 'https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report',
      description: 'Service organization security control standards'
    }
  ];

  if (variant === 'compact') {
    return (
      <Card className={`border-healthcare/20 ${className}`}>
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-healthcare" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-green" />
                <span className="text-sm font-medium">SOC 2 Certified</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="text-medical">Enterprise Support</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <a href="mailto:info@health-scribe.net" className="text-medical hover:underline">
                  info@health-scribe.net
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <footer className={`bg-muted/30 border-t border-border mt-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-medical">Health Scribe AI</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              HIPAA-compliant AI-powered clinical documentation platform designed for healthcare professionals.
              Streamline your workflow with enterprise-grade security and 24/7 support.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-healthcare" />
                <span className="text-sm font-medium">HIPAA Compliant & SOC 2 Type II Certified</span>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Healthcare Technology Solutions</div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-medical" />
                    <span className="text-medical">Enterprise Support</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-medical" />
                    <a href="mailto:info@health-scribe.net" className="text-medical hover:underline">
                      info@health-scribe.net
                    </a>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  24/7 support available for healthcare professionals
                </div>
              </div>
            </div>
          </div>

          {/* Healthcare Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Healthcare Compliance Resources</h3>
            <div className="space-y-3">
              {healthcareResources.map((resource, index) => (
                <div key={index} className="group">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm hover:text-medical transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium group-hover:underline">{resource.title}</div>
                      <div className="text-xs text-muted-foreground">{resource.description}</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Security Standards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security & Compliance</h3>
            <div className="space-y-3">
              {securityFrameworks.map((framework, index) => (
                <div key={index} className="group">
                  <a
                    href={framework.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 text-sm hover:text-medical transition-colors"
                  >
                    <ExternalLink className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium group-hover:underline">{framework.title}</div>
                      <div className="text-xs text-muted-foreground">{framework.description}</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
            
            <div className="pt-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  SOC 2 Type II
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Audited annually • Zero data breaches • 99.9% uptime SLA
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-muted-foreground">
              © 2024 Health Scribe AI. All rights reserved. HIPAA compliant clinical documentation platform.
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Enterprise Healthcare Technology</span>
              <span>•</span>
              <span>24/7 Professional Support</span>
              <span>•</span>
              <span>SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}