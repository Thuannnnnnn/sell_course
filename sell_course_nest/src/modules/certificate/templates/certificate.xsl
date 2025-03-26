<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <html>
      <head>
        <title>Chứng Chỉ</title>
        <link rel="stylesheet" href="/certificates/certificate.css"/>
      </head>
      <body>
        <div class="certificate-container">
          <div class="header">
            <h1 class="certificate-title">
              <xsl:value-of select="certificate/title"/>
            </h1>
            <div class="certificate-id">
              ID: <xsl:value-of select="certificate/id"/>
            </div>
          </div>
          
          <div class="content">
            <div class="section">
              <h2 class="section-title">Thông Tin Khóa Học</h2>
              <div class="info-item">
                <span class="label">Mã khóa học:</span>
                <span class="value"><xsl:value-of select="certificate/course/id"/></span>
              </div>
              <div class="info-item">
                <span class="label">Tên khóa học:</span>
                <span class="value"><xsl:value-of select="certificate/course/name"/></span>
              </div>
            </div>
            
            <div class="section">
              <h2 class="section-title">Thông Tin Người Nhận</h2>
              <div class="info-item">
                <span class="label">Mã người dùng:</span>
                <span class="value"><xsl:value-of select="certificate/user/id"/></span>
              </div>
              <div class="info-item">
                <span class="label">Họ tên:</span>
                <span class="value"><xsl:value-of select="certificate/user/name"/></span>
              </div>
              <div class="info-item">
                <span class="label">Email:</span>
                <span class="value"><xsl:value-of select="certificate/user/email"/></span>
              </div>
            </div>
          </div>
          
          <div class="verification">
            <div class="verification-status">
              Trạng thái: <xsl:value-of select="certificate/verification/status"/>
            </div>
            <div>
              Xác thực lúc: <xsl:value-of select="certificate/verification/verifiedAt"/>
            </div>
          </div>
          
          <div class="footer">
            <div>Ngày cấp: <xsl:value-of select="certificate/issuedDate"/></div>
            <div>Chứng chỉ này được cấp bởi hệ thống quản lý khóa học</div>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 