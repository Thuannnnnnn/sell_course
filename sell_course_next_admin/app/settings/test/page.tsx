"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { toast } from "sonner";
import { versionSettingApi } from "../../api/settings/version-setting";
import { logoSettingApi } from "../../api/settings/logo-setting";
import { carouselSettingApi } from "../../api/settings/carousel-setting";

export default function TestSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testVersionSettings = async () => {
    setIsLoading(true);
    addResult("🔄 Testing Version Settings API...");

    try {
      // Test GET all
      const versions = await versionSettingApi.getAll();
      addResult(`✅ GET all versions: ${versions.length} found`);

      // Test CREATE
      const newVersion = await versionSettingApi.create({
        VersionSettingtitle: "Test Version " + Date.now(),
        isActive: false
      });
      addResult(`✅ CREATE version: ${newVersion.versionSettingId}`);

      // Test UPDATE
      const updatedVersion = await versionSettingApi.update(newVersion.versionSettingId, {
        VersionSettingtitle: "Updated Test Version",
        isActive: true
      });
      addResult(`✅ UPDATE version: ${updatedVersion.VersionSettingtitle}`);

      // Test GET by ID
      const version = await versionSettingApi.getById(newVersion.versionSettingId);
      addResult(`✅ GET version by ID: ${version.VersionSettingtitle}`);

      // Test DELETE
      await versionSettingApi.delete(newVersion.versionSettingId);
      addResult(`✅ DELETE version: ${newVersion.versionSettingId}`);

      toast.success("Version Settings API test completed!");
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Version Settings API test failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const testLogoSettings = async () => {
    setIsLoading(true);
    addResult("🔄 Testing Logo Settings API...");

    try {
      // Test GET all
      const logos = await logoSettingApi.getAll();
      addResult(`✅ GET all logos: ${logos.length} found`);

      toast.success("Logo Settings API test completed!");
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Logo Settings API test failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const testCarouselSettings = async () => {
    setIsLoading(true);
    addResult("🔄 Testing Carousel Settings API...");

    try {
      // Test GET all
      const carousels = await carouselSettingApi.getAll();
      addResult(`✅ GET all carousels: ${carousels.length} found`);

      toast.success("Carousel Settings API test completed!");
    } catch (error) {
      addResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("Carousel Settings API test failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Test Settings APIs</h1>
          <p className="text-muted-foreground">Test all settings API endpoints</p>
        </div>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Version Settings</CardTitle>
            <CardDescription>Test version settings CRUD operations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testVersionSettings} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Testing..." : "Test Version API"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logo Settings</CardTitle>
            <CardDescription>Test logo settings API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testLogoSettings} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Testing..." : "Test Logo API"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carousel Settings</CardTitle>
            <CardDescription>Test carousel settings API</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testCarouselSettings} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Testing..." : "Test Carousel API"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}