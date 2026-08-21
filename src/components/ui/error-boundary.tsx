"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
  title?: string;
  description?: string;
  retryLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        title = "Something went wrong",
        description = "An unexpected error occurred. Please try again.",
        retryLabel = "Try Again",
        onRetry,
      } = this.props;

      return (
        <Card className="mx-auto max-w-md mt-8">
          <CardHeader className="items-center text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertTriangle className="size-6 text-destructive" />
            </div>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">{description}</p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-left text-muted-foreground">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                onRetry?.();
              }}
            >
              {retryLabel}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
