import React, { Component, ReactNode } from 'react';
import { AlertTriangle, Mail, Phone, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class LinkErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Link Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-200">
                    Resource Temporarily Unavailable
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {this.props.fallbackMessage || 
                     "This resource is temporarily unavailable. Please contact support for assistance."}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => this.setState({ hasError: false })}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open('mailto:info@nexxusbridge.com?subject=Resource Access Issue', '_blank')}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open('tel:(706) 618-0236', '_blank')}
                    className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping external links
export function withLinkErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallbackMessage?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <LinkErrorBoundary fallbackMessage={fallbackMessage}>
        <Component {...props} />
      </LinkErrorBoundary>
    );
  };
}

// Safe external link component
interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  title?: string;
  fallbackMessage?: string;
}

export function SafeExternalLink({ 
  href, 
  children, 
  className = "",
  target = "_blank",
  rel = "noopener noreferrer",
  title,
  fallbackMessage
}: SafeLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    try {
      // Validate URL before opening
      new URL(href);
    } catch (error) {
      e.preventDefault();
      console.error('Invalid URL:', href, error);
      // Show error notification or fallback behavior
      window.open(`mailto:info@nexxusbridge.com?subject=Broken Link Report&body=The following link appears to be broken: ${href}`, '_blank');
    }
  };

  return (
    <LinkErrorBoundary fallbackMessage={fallbackMessage}>
      <a
        href={href}
        target={target}
        rel={rel}
        className={className}
        title={title}
        onClick={handleClick}
      >
        {children}
      </a>
    </LinkErrorBoundary>
  );
}

export default LinkErrorBoundary;