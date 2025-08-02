"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardHeader } from "../ui/card";
import { Award, Search, RefreshCw, Calendar, Eye } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getCertificatesByUserId, 
  getCertificateDisplayUrl, 
  Certificate 
} from "@/app/api/profile/certificate";

interface CertificateCardProps {
  certificate: Certificate;
  onViewCertificate: (certificateId: string) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onViewCertificate,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {certificate.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-3">
              {certificate.course.title}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Issued on {formatDate(certificate.createdAt)}</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <Award className="h-3 w-3 mr-1" />
            Certified
          </Badge>
        </div>

        <div className="bg-muted/30 rounded-lg p-3 mb-4">
          <div className="text-xs text-muted-foreground mb-1">Certificate ID</div>
          <div className="font-mono text-sm">{certificate.certificateId}</div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => onViewCertificate(certificate.certificateId)}
            variant="default"
            size="sm"
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Certificate
          </Button>
        </div>
      </div>
    </Card>
  );
};

export function CertificateSection() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "course" | "title">("date");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto sign-out on session expiry
  useEffect(() => {
    if (session?.expires) {
      const expireTime = new Date(session.expires).getTime();
      const currentTime = Date.now();
      if (currentTime >= expireTime) {
        signOut();
      } else {
        const timeout = setTimeout(() => signOut(), expireTime - currentTime);
        return () => clearTimeout(timeout);
      }
    }
  }, [session]);

  // Fetch certificates function
  const fetchCertificates = useCallback(async (showSuccessToast = false) => {
    if (!session?.user?.id || !session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const certificatesData = await getCertificatesByUserId(
        session.accessToken,
        session.user.id
      );

      setCertificates(certificatesData);

      if (showSuccessToast) {
        toast({
          title: "Certificates updated",
          description: "Your certificates have been refreshed successfully.",
          variant: "default",
        });
      }
    } catch (err) {
      console.error("Error fetching certificates:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not fetch certificates. Please try again.";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, session?.accessToken, toast]);

  // Initial fetch on mount
  useEffect(() => {
    fetchCertificates(false);
  }, [fetchCertificates]);

  // Filter certificates based on search query
  const filteredCertificates = certificates.filter(cert =>
    cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort certificates based on selected criteria
  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "course":
        return a.course.title.localeCompare(b.course.title);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Manual refresh handler
  const handleRefresh = () => {
    fetchCertificates(true);
  };

  // View certificate handler
  const handleViewCertificate = (certificateId: string) => {
    const displayUrl = getCertificateDisplayUrl(certificateId);
    window.open(displayUrl, '_blank', 'noopener,noreferrer');
  };


  // Loading state
  if (loading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          <h2 className="text-2xl font-bold">My Certificates</h2>
        </CardHeader>
        <div className="p-6 text-center py-12">
          <div className="animate-spin h-12 w-12 border-2 border-b-transparent rounded-full border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your certificates...</p>
        </div>
      </Card>
    );
  }

  // Not signed in state
  if (!session?.user) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          <h2 className="text-2xl font-bold">My Certificates</h2>
        </CardHeader>
        <div className="p-6 text-center py-12">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Please login to view your certificates</h3>
          <p className="text-muted-foreground">
            Sign in to access your course completion certificates
          </p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error && !loading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          <h2 className="text-2xl font-bold">My Certificates</h2>
        </CardHeader>
        <div className="p-6 text-center py-12">
          <div className="text-destructive mb-4">
            <Award className="h-12 w-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Failed to load certificates</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Main component render
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            <h2 className="text-2xl font-bold">My Certificates</h2>
            <span className="text-sm text-muted-foreground">
              ({certificates.length} certificates)
            </span>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {certificates.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates or courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={sortBy === "date" ? "default" : "outline"} 
                onClick={() => setSortBy("date")}
                size="sm"
              >
                Latest
              </Button>
              <Button 
                variant={sortBy === "course" ? "default" : "outline"} 
                onClick={() => setSortBy("course")}
                size="sm"
              >
                Course
              </Button>
              <Button 
                variant={sortBy === "title" ? "default" : "outline"} 
                onClick={() => setSortBy("title")}
                size="sm"
              >
                Title
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <div className="p-6">
        {sortedCertificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery ? "No certificates found" : "No certificates yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Complete courses to earn certificates and showcase your achievements"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCertificates.map((certificate) => (
              <div key={certificate.certificateId} className="relative">
                <CertificateCard
                  certificate={certificate}
                  onViewCertificate={handleViewCertificate}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}