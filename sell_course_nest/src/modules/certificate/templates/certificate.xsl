<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>
    
    <xsl:template match="/">
        <html xmlns="http://www.w3.org/1999/xhtml">
            <head>
                <meta charset="UTF-8"/>
                <title>Certificate of Completion</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&amp;family=Open+Sans:wght@300;400;600&amp;display=swap');
                    
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
                        justify-content: center;
                        align-items: center;
                        padding: 20px;
                    }
                    
                    .certificate {
                        background: white;
                        width: 800px;
                        max-width: 95vw;
                        padding: 60px 80px;
                        border-radius: 20px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                        text-align: center;
                        position: relative;
                        border: 8px solid #f8f9fa;
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
                    
                    .print-button {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 25px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        transition: all 0.3s ease;
                    }
                    
                    .print-button:hover {
                        background: #5a67d8;
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                    }
                    
                    @media print {
                        body {
                            background: white;
                            padding: 0;
                        }
                        .certificate {
                            box-shadow: none;
                            border: 2px solid #2c3e50;
                            margin: 0;
                            width: 100%;
                            max-width: none;
                        }
                        .print-button {
                            display: none;
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
                    }
                </style>
            </head>
            <body>
                <button class="print-button" onclick="window.print()">📄 Print Certificate</button>
                
                <div class="certificate">
                    <div class="verification-id">ID: <xsl:value-of select="certificate/id"/></div>
                    
                    <div class="header">
                        <div class="logo">🎓</div>
                        <div class="institution">Learning Management System</div>
                        <div class="subtitle">Official Certificate of Completion</div>
                    </div>
                    
                    <div class="title">Certificate of Achievement</div>
                    
                    <div class="presented-to">This certificate is proudly presented to</div>
                    <div class="recipient-name">
                        <xsl:value-of select="certificate/user/name"/>
                    </div>
                    
                    <div class="completion-text">
                        For successfully completing the course
                    </div>
                    <div class="course-name">
                        <xsl:value-of select="certificate/course/name"/>
                    </div>
                    
                    <div class="completion-text">
                        This achievement demonstrates dedication, skill, and commitment to continuous learning.
                    </div>
                    
                    <div class="footer">
                        <div class="date-section">
                            <div class="date-label">Date Issued</div>
                            <div class="date-value">
                                <xsl:value-of select="substring(certificate/issuedDate, 1, 10)"/>
                            </div>
                        </div>
                        
                        <div class="signature-section">
                            <div class="signature-line"></div>
                            <div class="signature-label">Authorized Signature</div>
                        </div>
                        
                        <div class="verification-section">
                            <div class="verification-label">Status</div>
                            <div class="verification-value">
                                <xsl:value-of select="certificate/verification/status"/>
                            </div>
                        </div>
                    </div>
                </div>
                
                <script>
                    // Auto print functionality for PDF generation
                    if (window.location.search.includes('print=true')) {
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 1000);
                        }
                    }
                </script>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>