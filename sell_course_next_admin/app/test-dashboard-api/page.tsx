'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { clientDashboardApi } from '../../lib/client-dashboard-api';
import { validateDashboardData } from '../../lib/dashboard-utils';

const TestDashboardApi: React.FC = () => {
  const [results, setResults] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const testEndpoint = async (name: string, apiCall: () => Promise<unknown>) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: '' }));
    try {
      const result = await apiCall();
      setResults(prev => ({ ...prev, [name]: result }));
      console.log(`✅ ${name} success:`, result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setErrors(prev => ({ ...prev, [name]: errorMessage }));
      console.error(`❌ ${name} failed:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const tests = [
    {
      name: 'overview',
      label: 'Dashboard Overview',
      call: () => clientDashboardApi.getDashboardOverview(),
    },
    {
      name: 'revenue',
      label: 'Revenue Analytics',
      call: () => clientDashboardApi.getRevenueAnalytics(),
    },
    {
      name: 'users',
      label: 'User Statistics',
      call: () => clientDashboardApi.getUserStatistics(),
    },
    {
      name: 'courses',
      label: 'Course Performance',
      call: () => clientDashboardApi.getCoursePerformance(),
    },
    {
      name: 'enrollments',
      label: 'Enrollment Trends',
      call: () => clientDashboardApi.getEnrollmentTrends(),
    },
    {
      name: 'activities',
      label: 'Recent Activities',
      call: () => clientDashboardApi.getRecentActivities(10),
    },
    {
      name: 'health',
      label: 'Health Check',
      call: () => clientDashboardApi.checkHealth(),
    },
    {
      name: 'all',
      label: 'All Dashboard Data',
      call: () => clientDashboardApi.getAllDashboardData(),
    },
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await testEndpoint(test.name, test.call);
      // Add small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const clearCache = async () => {
    await testEndpoint('clearCache', () => clientDashboardApi.clearDashboardCache());
  };

  const validation = results.all ? validateDashboardData(results.all) : null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard API Test</h1>
        <div className="flex gap-2">
          <Button onClick={runAllTests} disabled={Object.values(loading).some(Boolean)}>
            Run All Tests
          </Button>
          <Button onClick={clearCache} variant="outline">
            Clear Cache
          </Button>
        </div>
      </div>

      {/* Validation Results */}
      {validation && (
        <Card className={`border-2 ${validation.isValid ? 'border-green-500' : 'border-red-500'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Data Validation
              <Badge variant={validation.isValid ? 'default' : 'destructive'}>
                {validation.isValid ? 'Valid' : 'Invalid'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!validation.isValid && (
              <div className="mb-4">
                <h4 className="font-semibold text-red-600">Missing Fields:</h4>
                <ul className="list-disc list-inside">
                  {validation.missingFields.map(field => (
                    <li key={field} className="text-red-600">{field}</li>
                  ))}
                </ul>
              </div>
            )}
            {validation.warnings.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-600">Warnings:</h4>
                <ul className="list-disc list-inside">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-600">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <Card key={test.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.label}</CardTitle>
                <div className="flex items-center gap-2">
                  {loading[test.name] && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {test.name in results && results[test.name] != null && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Success
                    </Badge>
                  )}
                  {errors[test.name] && (
                    <Badge variant="destructive">
                      Error
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  onClick={() => testEndpoint(test.name, test.call)}
                  disabled={loading[test.name]}
                  size="sm"
                  className="w-full"
                >
                  {loading[test.name] ? 'Testing...' : 'Test Endpoint'}
                </Button>

                {errors[test.name] && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">Error:</p>
                    <p className="text-sm text-red-600">{errors[test.name]}</p>
                  </div>
                )}

                {test.name in results && results[test.name] != null && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-600">Response:</p>
                    <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(results[test.name], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Test Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tests.length}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(results).length}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.keys(errors).filter(key => errors[key]).length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.keys(loading).filter(key => loading[key]).length}
              </div>
              <div className="text-sm text-gray-600">Running</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestDashboardApi;