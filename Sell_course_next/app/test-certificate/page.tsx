"use client";
import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { certificateApi } from "../api/certificates/certificate";

export default function CertificateTestPage() {
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    if (!certificateId.trim()) {
      alert("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await certificateApi.verifyCertificate(certificateId);
      setResult(response);
    } catch (error) {
      setResult({ error: "Failed to verify certificate", details: error });
    } finally {
      setLoading(false);
    }
  };

  const testIds = ["CERT-123456", "CERT-789012", "CERT-345678", "CERT-INVALID"];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Certificate API Test</h1>
      
      <Card className="mb-6">
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
              {loading ? "Testing..." : "Test API"}
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

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Backend URL:</strong> {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Endpoint:</strong> /api/public/certificate/verify</p>
          <p><strong>Mock Data Available:</strong> CERT-123456, CERT-789012, CERT-345678</p>
        </CardContent>
      </Card>
    </div>
  );
}
