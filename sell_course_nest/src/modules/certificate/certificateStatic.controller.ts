import {
  Controller,
  Get,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { CertificateService } from './certificate.service';

@Controller('certificates') // This handles /certificates routes (not /api/certificates)
export class CertificateStaticController {
  constructor(private readonly certificateService: CertificateService) {}

  // Main certificate view endpoint - displays certificate as HTML
  @Get(':id')
  async viewCertificate(@Param('id') id: string, @Res() res: Response) {
    try {
      const certificate = await this.certificateService.findOne(id);

      const html = this.generateCertificateViewHTML(certificate, id);

      res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      });

      return res.send(html);
    } catch {
      const errorHtml = this.generateErrorHTML(id, 'Certificate not found');
      return res.status(HttpStatus.NOT_FOUND).send(errorHtml);
    }
  }

  // XML endpoint for raw XML data
  @Get(':id.xml')
  async getCertificateXMLFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const xml = await this.certificateService.generateCertificateXML(id);
      res.set({
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      });
      return res.send(xml);
    } catch {
      return res.status(HttpStatus.NOT_FOUND).send(`
        <?xml version="1.0" encoding="UTF-8"?>
        <error>
          <message>Certificate not found</message>
          <id>${id}</id>
        </error>
      `);
    }
  }

  // PDF download endpoint (public access)
  @Get(':id/download/pdf')
  async downloadCertificatePDF(@Param('id') id: string, @Res() res: Response) {
    try {
      const pdfBuffer = await this.certificateService.generateCertificatePDF(id);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      });
      return res.send(pdfBuffer);
    } catch {
      const errorHtml = this.generateErrorHTML(id, 'PDF generation failed');
      return res.status(HttpStatus.NOT_FOUND).send(errorHtml);
    }
  }

  // XML download endpoint
  @Get(':id/download/xml')
  async downloadCertificateXML(@Param('id') id: string, @Res() res: Response) {
    try {
      const xml = await this.certificateService.generateCertificateXML(id);
      res.set({
        'Content-Type': 'application/xml; charset=utf-8',
        'Content-Disposition': `attachment; filename="certificate-${id}.xml"`,
        'Cache-Control': 'public, max-age=3600',
      });

      return res.send(xml);
    } catch {
      const errorHtml = this.generateErrorHTML(id, 'XML generation failed');
      return res.status(HttpStatus.NOT_FOUND).send(errorHtml);
    }
  }

  private generateCertificateViewHTML(certificate: any, certificateId: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate - ${certificate.user.username}</title>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Open Sans', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .toolbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .certificate-info h1 {
            color: #2c3e50;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .certificate-info p {
            color: #7f8c8d;
            font-size: 16px;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-width: 120px;
            justify-content: center;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-secondary {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .btn-secondary:hover {
            background: #667eea;
            color: white;
            transform: translateY(-2px);
        }

        .btn-success {
            background: #27ae60;
            color: white;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
        }

        .btn-success:hover {
            background: #229954;
            transform: translateY(-2px);
        }

        .certificate {
            background: white;
            border-radius: 20px;
            padding: 60px 80px;
            text-align: center;
            position: relative;
            border: 8px solid #f8f9fa;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
            margin-bottom: 30px;
        }

        .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            border-radius: 12px;
            pointer-events: none;
        }

        .header {
            margin-bottom: 40px;
        }

        .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 32px;
            font-weight: bold;
        }

        .institution {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }

        .subtitle {
            font-size: 16px;
            color: #7f8c8d;
            font-weight: 300;
        }

        .title {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            font-weight: 700;
            color: #2c3e50;
            margin: 40px 0 20px;
            line-height: 1.2;
        }

        .presented-to {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 30px;
            padding: 10px 0;
            border-bottom: 3px solid #667eea;
            display: inline-block;
        }

        .completion-text {
            font-size: 18px;
            color: #2c3e50;
            line-height: 1.6;
            margin-bottom: 10px;
        }

        .course-name {
            font-size: 24px;
            font-weight: 600;
            color: #764ba2;
            margin: 20px 0 40px;
        }

        .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            padding-top: 40px;
            border-top: 2px solid #ecf0f1;
        }

        .date-section, .verification-section {
            text-align: center;
            flex: 1;
        }

        .date-label, .verification-label {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 5px;
            font-weight: 300;
        }

        .date-value, .verification-value {
            font-size: 16px;
            color: #2c3e50;
            font-weight: 600;
        }

        .signature-section {
            text-align: center;
            flex: 1;
        }

        .signature-line {
            width: 200px;
            height: 1px;
            background: #2c3e50;
            margin: 0 auto 10px;
        }

        .signature-label {
            font-size: 14px;
            color: #7f8c8d;
            font-weight: 300;
        }

        .verification-id {
            position: absolute;
            bottom: 10px;
            right: 20px;
            font-size: 10px;
            color: #bdc3c7;
            font-family: monospace;
        }

        .verification-badge {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .verification-badge h2 {
            color: #27ae60;
            margin-bottom: 10px;
            font-size: 24px;
        }

        .verification-badge p {
            color: #7f8c8d;
            font-size: 14px;
            line-height: 1.5;
        }

        .share-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            margin-top: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .share-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 20px;
        }

        .share-url {
            display: flex;
            gap: 10px;
            align-items: center;
            background: #f8f9fa;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .share-url input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 14px;
            color: #2c3e50;
            font-family: monospace;
        }

        .share-url input:focus {
            outline: none;
        }

        .status-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            background: #27ae60;
            color: white;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
            z-index: 1000;
        }

        @media print {
            body {
                background: white;
                padding: 0;
            }
            .toolbar, .verification-badge, .share-section, .status-indicator {
                display: none;
            }
            .certificate {
                box-shadow: none;
                border: 2px solid #2c3e50;
                margin: 0;
                page-break-inside: avoid;
            }
        }

        @media (max-width: 768px) {
            .certificate {
                padding: 40px 30px;
            }
            .title {
                font-size: 36px;
            }
            .recipient-name {
                font-size: 28px;
            }
            .footer {
                flex-direction: column;
                gap: 30px;
            }
            .toolbar {
                flex-direction: column;
                align-items: stretch;
                text-align: center;
            }
            .action-buttons {
                justify-content: center;
            }
        }

        /* Loading and success animations */
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .certificate, .toolbar, .verification-badge {
            animation: fadeIn 0.6s ease-out;
        }

        /* Notification styles */
        .notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px 30px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 16px;
            text-align: center;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="status-indicator">
        ✅ Certificate Verified
    </div>

    <div class="container">
        <!-- Toolbar -->
        <div class="toolbar">
            <div class="certificate-info">
                <h1>Certificate of Achievement</h1>
                <p>ID: ${certificateId} • Issued: ${new Date(certificate.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="action-buttons">
                <button onclick="downloadPDF()" class="btn btn-primary">
                    📄 Download PDF
                </button>
                <button onclick="downloadXML()" class="btn btn-secondary">
                    🗂️ Download XML
                </button>
                <button onclick="printCertificate()" class="btn btn-success">
                    🖨️ Print
                </button>
                <button onclick="copyShareUrl()" class="btn btn-secondary">
                    🔗 Copy Link
                </button>
            </div>
        </div>

        <!-- Certificate -->
        <div class="certificate" id="certificate">
            <div class="verification-id">ID: ${certificateId}</div>
            
            <div class="header">
                <div class="logo">🎓</div>
                <div class="institution">Learning Management System</div>
                <div class="subtitle">Official Certificate of Completion</div>
            </div>
            
            <div class="title">Certificate of Achievement</div>
            
            <div class="presented-to">This certificate is proudly presented to</div>
            <div class="recipient-name">${certificate.user.username}</div>
            
            <div class="completion-text">
                For successfully completing the course
            </div>
            <div class="course-name">${certificate.course.title}</div>
            
            <div class="completion-text">
                This achievement demonstrates dedication, skill, and commitment to continuous learning.
            </div>
            
            <div class="footer">
                <div class="date-section">
                    <div class="date-label">Date Issued</div>
                    <div class="date-value">${new Date(certificate.createdAt).toLocaleDateString()}</div>
                </div>
                
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <div class="signature-label">Authorized Signature</div>
                </div>
                
                <div class="verification-section">
                    <div class="verification-label">Status</div>
                    <div class="verification-value">Valid</div>
                </div>
            </div>
        </div>

        <!-- Verification Badge -->
        <div class="verification-badge">
            <h2>✅ Verified Certificate</h2>
            <p>This certificate has been verified and is authentic. You can share this URL with others to verify the authenticity of this certificate.</p>
        </div>

        <!-- Share Section -->
        <div class="share-section">
            <h3>Share This Certificate</h3>
            <div class="share-url">
                <input type="text" value="${process.env.BASE_URL || 'http://localhost:3000'}/certificates/${certificateId}" readonly id="shareUrl">
                <button onclick="copyShareUrl()" class="btn btn-secondary">Copy</button>
            </div>
            <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                Anyone with this link can view and verify this certificate.
            </p>
        </div>
    </div>

    <script>
        // Download PDF function
        async function downloadPDF() {
            showLoading('Generating PDF...');
            try {
                const response = await fetch('/certificates/${certificateId}/download/pdf');
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'certificate-${certificateId}.pdf';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showNotification('PDF downloaded successfully!');
                } else {
                    throw new Error('Failed to download PDF');
                }
            } catch (error) {
                showNotification('Failed to download PDF. Please try again.', 'error');
            }
            hideLoading();
        }

        // Download XML function
        async function downloadXML() {
            showLoading('Generating XML...');
            try {
                const response = await fetch('/certificates/${certificateId}/download/xml');
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'certificate-${certificateId}.xml';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    showNotification('XML downloaded successfully!');
                } else {
                    throw new Error('Failed to download XML');
                }
            } catch (error) {
                showNotification('Failed to download XML. Please try again.', 'error');
            }
            hideLoading();
        }

        // Print certificate function
        function printCertificate() {
            window.print();
        }

        // Copy share URL function
        function copyShareUrl() {
            const shareUrl = document.getElementById('shareUrl');
            shareUrl.select();
            shareUrl.setSelectionRange(0, 99999); // For mobile devices
            
            try {
                document.execCommand('copy');
                showNotification('Link copied to clipboard!');
            } catch (err) {
                // Fallback for newer browsers
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl.value).then(() => {
                        showNotification('Link copied to clipboard!');
                    }).catch(() => {
                        showNotification('Failed to copy link', 'error');
                    });
                } else {
                    showNotification('Failed to copy link', 'error');
                }
            }
        }

        // Utility functions
        function showLoading(message) {
            const certificate = document.getElementById('certificate');
            certificate.classList.add('loading');
            showNotification(message);
        }

        function hideLoading() {
            const certificate = document.getElementById('certificate');
            certificate.classList.remove('loading');
            hideNotification();
        }

        function showNotification(message, type = 'success') {
            // Remove existing notification
            const existing = document.querySelector('.notification');
            if (existing) {
                existing.remove();
            }

            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            
            if (type === 'error') {
                notification.style.background = 'rgba(231, 76, 60, 0.9)';
            }
            
            document.body.appendChild(notification);

            if (type !== 'loading') {
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 3000);
            }
        }

        function hideNotification() {
            const notification = document.querySelector('.notification');
            if (notification) {
                notification.remove();
            }
        }

        // Auto-focus on share URL when clicked
        document.getElementById('shareUrl').addEventListener('click', function() {
            this.select();
        });
    </script>
</body>
</html>`;
  }

  private generateErrorHTML(certificateId: string, errorMessage: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Not Found</title>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Open Sans', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .error-container {
            background: white;
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .error-icon {
            font-size: 80px;
            margin-bottom: 30px;
        }

        .error-title {
            font-size: 32px;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 20px;
        }

        .error-message {
            font-size: 18px;
            color: #7f8c8d;
            line-height: 1.6;
            margin-bottom: 10px;
        }

        .certificate-id {
            font-family: monospace;
            background: #f8f9fa;
            padding: 10px 15px;
            border-radius: 5px;
            color: #2c3e50;
            margin: 20px 0;
            font-size: 16px;
        }

        .back-button {
            display: inline-block;
            margin-top: 30px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        @media (max-width: 768px) {
            .error-container {
                padding: 40px 20px;
            }
            .error-title {
                font-size: 24px;
            }
            .error-message {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">📄❌</div>
        <h1 class="error-title">Certificate Not Found</h1>
        <p class="error-message">
            The certificate you're looking for could not be found or may have been removed.
        </p>
        <div class="certificate-id">ID: ${certificateId}</div>
        <p class="error-message">
            ${errorMessage}
        </p>
        <a href="javascript:history.back()" class="back-button">
            ← Go Back
        </a>
    </div>
</body>
</html>`;
  }
}