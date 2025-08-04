"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { CheckCircle, XCircle, Search, Loader2, Award, Calendar, User, GraduationCap } from "lucide-react";
import { certificateApi } from "../../app/api/certificates/certificate";

interface CertificateInfo {
  certificateId: string;
  courseName: string;
  studentName: string;
  issueDate: string;
  instructorName: string;
  score?: number;
  isValid: boolean;
  verificationDate: string;
}

export function CertificateVerify() {
  const [certificateId, setCertificateId] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certificateId.trim()) {
      setError("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    setError(null);
    setCertificateInfo(null);

    try {
      // Call the actual API
      const response = await certificateApi.verifyCertificate(certificateId);
      
      if (response.success && response.certificate) {
        const cert = response.certificate;
        const certificateInfo: CertificateInfo = {
          certificateId: cert.certificateId,
          courseName: cert.courseName,
          studentName: cert.studentName,
          issueDate: cert.issueDate,
          instructorName: cert.instructorName,
          score: cert.score,
          isValid: cert.isValid && !cert.isRevoked,
          verificationDate: new Date().toISOString()
        };
        setCertificateInfo(certificateInfo);
      } else {
        setError(response.error || "Certificate not found. Please check the certificate ID and try again.");
      }
    } catch {
      setError("An error occurred while verifying the certificate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Certificate Verification</CardTitle>
          </div>
          <CardDescription>
            Enter a certificate ID to verify its authenticity and view details
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Verification Form */}
          <form onSubmit={handleVerify} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter certificate ID (e.g., CERT-123456)"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !certificateId.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Verify
            </Button>
          </form>

          {/* Error Message */}
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          {/* Certificate Information */}
          {certificateInfo && (
            <div className="space-y-4">
              {/* Validation Status */}
              {/* Validation Status */}
              <div className={`flex items-center gap-2 p-3 rounded-md border ${certificateInfo.isValid 
                ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
              }`}>
                {certificateInfo.isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <p className={`text-sm font-medium ${certificateInfo.isValid 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
                }`}>
                  {certificateInfo.isValid 
                    ? "✅ Certificate is valid and authentic" 
                    : "❌ Certificate is invalid or has been revoked"
                  }
                </p>
              </div>
              {/* Certificate Details */}
              {certificateInfo.isValid && (
                <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-green-800 dark:text-green-200">
                        Certificate Details
                      </CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Course</p>
                          <p className="text-sm text-muted-foreground">{certificateInfo.courseName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Student</p>
                          <p className="text-sm text-muted-foreground">{certificateInfo.studentName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Issue Date</p>
                          <p className="text-sm text-muted-foreground">{formatDate(certificateInfo.issueDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Instructor</p>
                          <p className="text-sm text-muted-foreground">{certificateInfo.instructorName}</p>
                        </div>
                      </div>
                    </div>

                    {certificateInfo.score && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Final Score</span>
                          <Badge variant={certificateInfo.score >= 80 ? "default" : "secondary"}>
                            {certificateInfo.score}%
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Certificate ID: {certificateInfo.certificateId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Verified on: {formatDate(certificateInfo.verificationDate)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Having trouble? Contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
