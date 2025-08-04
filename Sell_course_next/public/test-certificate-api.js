/**
 * Simple test script to verify certificate API
 * Run this in browser console or Node.js environment
 */

// Test certificate verification API
async function testCertificateAPI() {
  const API_BASE_URL = "http://localhost:3000";
  
  console.log("🧪 Starting Certificate API Test...");
  console.log("API Base URL:", API_BASE_URL);
  
  // Test cases
  const testCases = [
    {
      id: "CERT-123456",
      expected: "valid",
      description: "Valid certificate - Advanced React Development"
    },
    {
      id: "CERT-789012", 
      expected: "valid",
      description: "Valid certificate - Node.js Fundamentals"
    },
    {
      id: "CERT-345678",
      expected: "revoked", 
      description: "Revoked certificate - Python Web Development"
    },
    {
      id: "CERT-INVALID",
      expected: "not_found",
      description: "Invalid certificate ID"
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.id} (${testCase.description})`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/public/certificate/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: testCase.id
        })
      });
      
      const data = await response.json();
      
      console.log(`Status: ${response.status}`);
      console.log(`Success: ${data.success}`);
      
      if (data.success) {
        console.log(`✅ Certificate found:`);
        console.log(`   - Course: ${data.certificate.courseName}`);
        console.log(`   - Student: ${data.certificate.studentName}`);
        console.log(`   - Valid: ${data.certificate.isValid}`);
        console.log(`   - Revoked: ${data.certificate.isRevoked}`);
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error(`❌ Network Error:`, error);
    }
  }
  
  console.log("\n🏁 Certificate API Test Complete!");
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testCertificateAPI };
} else {
  window.testCertificateAPI = testCertificateAPI;
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log("Certificate API Tester loaded! Run testCertificateAPI() to start testing.");
}
