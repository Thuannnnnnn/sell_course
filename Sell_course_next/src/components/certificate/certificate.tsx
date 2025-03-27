import React, { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  type Certificate,
  getCertificateById,
} from "@/app/api/certificate/certificate";

interface CertificateProps {
  id: string;
}

const Certificate = ({ id }: CertificateProps) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (certificateRef.current) {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const ratio = Math.min(
        pdfWidth / canvas.width,
        pdfHeight / canvas.height
      );

      const imgWidth = canvas.width * ratio;
      const imgHeight = canvas.height * ratio;

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      pdf.save(`certificate-${certificate?.user.username}.pdf`);
    }
  };

  useEffect(() => {
    const fetchCertificate = async () => {
      const certificate = await getCertificateById(id);
      setCertificate(certificate);
    };
    fetchCertificate();
  }, [id]);

  return (
    <div>
      <div ref={certificateRef} className="container pm-certificate-container">
        <div className="outer-border"></div>
        <div className="inner-border"></div>

        <div className="pm-certificate-border col-xs-12">
          <div className="row pm-certificate-header">
            <div className="pm-certificate-title cursive col-xs-12 text-center">
              <h2>Course Master Certificate</h2>
            </div>
          </div>

          <div className="row pm-certificate-body">
            <div className="pm-certificate-block">
              <div className="col-xs-12">
                <div className="row">
                  <div className="col-xs-2"></div>
                  <div className="pm-certificate-name underline margin-0 col-xs-8 text-center">
                    <span className="pm-name-text bold">
                      {certificate?.user.username}
                    </span>
                  </div>
                  <div className="col-xs-2"></div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-xs-2"></div>
                  <div className="pm-earned col-xs-8 text-center">
                    <span className="pm-earned-text padding-0 block cursive">
                      has earned
                    </span>
                    <span className="pm-credits-text block bold sans">
                      {certificate?.course.title}
                    </span>
                  </div>
                  <div className="col-xs-2"></div>
                  <div className="col-xs-12"></div>
                </div>
              </div>

              <div className="col-xs-12">
                <div className="row">
                  <div className="col-xs-2"></div>
                  <div className="pm-course-title col-xs-8 text-center">
                    <span className="pm-earned-text block cursive">
                      while completing the training course entitled
                    </span>
                  </div>
                  <div className="col-xs-2"></div>
                </div>
              </div>
            </div>
            <div className="col-xs-12">
              <div className="row">
                <div className="pm-certificate-footer">
                  <div className="col-xs-4 pm-certified col-xs-4 text-center">
                    <span className="pm-credits-text block sans">
                      FPT University CanTho, 123 Nguyen Van Cu, Can Tho
                    </span>
                    <span className="pm-empty-space block underline"></span>
                  </div>
                  <div className="col-xs-4"></div>
                  <div className="col-xs-4 pm-certified col-xs-4 text-center">
                    <span className="pm-credits-text block sans">
                      Date Completed{" "}
                      {certificate?.createdAt
                        ? new Date(certificate.createdAt).toLocaleDateString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button onClick={downloadPDF} className="download-btn">
          Tải chứng chỉ (PDF)
        </button>
      </div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css?family=Open+Sans|Pinyon+Script|Rochester");

        .cursive {
          font-family: "Pinyon Script", cursive;
        }

        .sans {
          font-family: "Open Sans", sans-serif;
        }

        .bold {
          font-weight: bold;
        }

        .block {
          display: block;
        }

        .underline {
          border-bottom: 1px solid #777;
          padding: 5px;
          margin-bottom: 15px;
        }

        .margin-0 {
          margin: 0;
        }

        .padding-0 {
          padding: 0;
        }

        .pm-empty-space {
          height: 40px;
          width: 100%;
        }

        .pm-certificate-container {
          position: relative;
          width: 800px;
          height: 600px;
          background-color: #618597;
          padding: 30px;
          color: #333;
          font-family: "Open Sans", sans-serif;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .outer-border {
          width: 100%;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          border: 2px solid #fff;
        }

        .inner-border {
          width: calc(100% - 64px);
          height: calc(100% - 64px);
          position: absolute;
          left: 32px;
          top: 32px;
          border: 2px solid #fff;
        }

        .pm-certificate-border {
          width: calc(100% - 72px);
          height: calc(100% - 72px);
          position: absolute;
          left: 36px;
          top: 36px;
          background-color: #fff;
          border: 1px solid #e1e5f0;
        }

        .pm-certificate-block {
          width: 650px;
          height: 200px;
          position: relative;
          left: 50%;
          margin-left: -325px;
          top: 70px;
          margin-top: 0;
        }

        .pm-certificate-header {
          margin-bottom: 10px;
        }

        .pm-certificate-title {
          position: relative;
          top: 40px;
        }

        .pm-certificate-title h2 {
          font-size: 34px !important;
        }

        .pm-certificate-body {
          padding: 20px;
        }

        .pm-name-text {
          font-size: 20px;
        }

        .pm-earned {
          margin: 15px 0 20px;
        }

        .pm-earned-text {
          font-size: 20px;
        }

        .pm-credits-text {
          font-size: 15px;
        }

        .pm-certified {
          font-size: 12px;
        }

        .pm-certified .underline {
          margin-bottom: 5px;
        }

        .pm-certificate-footer {
          width: 650px;
          height: 100px;
          position: relative;
          left: 50%;
          margin-left: -325px;
          bottom: -60px;
        }

        .download-btn {
          background-color: #618597;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.3s;
        }

        .download-btn:hover {
          background-color: #4a6b7a;
        }
      `}</style>
    </div>
  );
};

export default Certificate;
