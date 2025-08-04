"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { certificateApi } from "../../app/api/certificates/certificate";

export function CertificateTestDialog() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleTest = async () => {
    if (!certificateId.trim()) {
      alert("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log("🧪 Testing certificate API with ID:", certificateId);
      const response = await certificateApi.verifyCertificate(certificateId);
      console.log("📋 API Response:", response);
      setResult(response);
    } catch (error) {
      console.error("❌ API Test Error:", error);
      setResult({ error: "Failed to verify certificate", details: error });
    } finally {
      setLoading(false);
    }
  };

  const testIds = ["CERT-123456", "CERT-789012", "CERT-345678", "CERT-INVALID"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <TestTube className="h-4 w-4" />
          Test API
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Certificate API Test
          </DialogTitle>
          <DialogDescription>
            Test the certificate verification API with different certificate IDs
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Test Form */}
          <Card>
            <CardHeader>
              <CardTitle>Test Certificate Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter certificate ID (e.g., CERT-123456)"
                  value={certificateId}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCertificateId(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTest} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    "Test API"
                  )}
                </Button>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quick test IDs:</p>
                <div className="flex flex-wrap gap-2">
                  {testIds.map((id) => (
                    <Button
                      key={id}
                      variant="outline"
                      size="sm"
                      onClick={() => setCertificateId(id)}
                    >
                      {id}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Information */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
                </div>
                <div>
                  <strong>Environment:</strong> {process.env.NODE_ENV}
                </div>
                <div>
                  <strong>Endpoint:</strong> /api/public/certificate/verify
                </div>
                <div>
                  <strong>Mock Data:</strong> 
                  <Badge variant="secondary" className="ml-2">
                    Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Response */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>API Response</CardTitle>
                  {result.success !== undefined && (
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Error
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><strong>Valid Test IDs:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><code>CERT-123456</code> - Valid certificate (Advanced React Development)</li>
                <li><code>CERT-789012</code> - Valid certificate (Node.js Fundamentals)</li>
                <li><code>CERT-345678</code> - Revoked certificate (Python Web Development)</li>
                <li><code>CERT-INVALID</code> - Invalid certificate ID</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
