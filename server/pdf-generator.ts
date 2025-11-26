// PDF Generation Service for Patient Summary Reports
// Uses HTML-to-PDF conversion with comprehensive healthcare document structure

export interface PDFGenerationOptions {
  encounter: any;
  practitioner: any;
  generatedAt: string;
  includeCharts?: boolean;
  includeSignature?: boolean;
  preview?: boolean;
}

export async function generatePatientSummaryPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const {
    encounter,
    practitioner,
    generatedAt,
    includeCharts = false,
    includeSignature = false,
    preview = false
  } = options;

  // Generate HTML content for PDF
  const htmlContent = generatePDFHTML(encounter, practitioner, generatedAt, includeCharts, includeSignature, preview);
  
  // Convert HTML to PDF using simple HTML rendering
  // In production, use a proper PDF library like Puppeteer or PDFKit
  const pdfBuffer = Buffer.from(createSimplePDF(htmlContent), 'binary');
  
  return pdfBuffer;
}

function generatePDFHTML(
  encounter: any,
  practitioner: any,
  generatedAt: string,
  includeCharts: boolean,
  includeSignature: boolean,
  preview: boolean
): string {
  const currentDate = new Date(generatedAt).toLocaleDateString();
  const encounterDate = new Date(encounter.date).toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Clinical Encounter Summary - ${encounter.patientId}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .header {
      border-bottom: 2px solid #1A73E8;
      padding-bottom: 15px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #1A73E8;
      margin: 0;
      font-size: 24px;
    }
    .header .facility {
      font-size: 16px;
      color: #666;
      margin-top: 5px;
    }
    .patient-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .patient-info h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 16px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    .section h3 {
      color: #1A73E8;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-bottom: 15px;
      font-size: 14px;
    }
    .diagnosis-list {
      margin-left: 20px;
    }
    .diagnosis-item {
      margin-bottom: 8px;
      padding: 8px;
      background: #f0f8ff;
      border-left: 3px solid #1A73E8;
    }
    .code-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
    }
    .code-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
    }
    .code-item {
      text-align: center;
      padding: 10px;
      background: white;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .code-value {
      font-size: 18px;
      font-weight: bold;
      color: #1A73E8;
    }
    .recommendations {
      background: #fff8e1;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #ddd;
      padding-top: 15px;
      font-size: 10px;
      color: #666;
    }
    .signature-section {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    .watermark {
      opacity: 0.3;
      color: #ccc;
      font-size: 48px;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      z-index: -1;
    }
    @media print {
      body { margin: 0; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  ${preview ? '<div class="watermark">PREVIEW</div>' : ''}
  
  <!-- Header -->
  <div class="header">
    <h1>Clinical Encounter Summary</h1>
    <div class="facility">${practitioner.facility}</div>
    <div style="float: right; text-align: right;">
      <div><strong>Generated:</strong> ${currentDate}</div>
      <div><strong>Document ID:</strong> ${encounter.id}-${Date.now()}</div>
    </div>
    <div style="clear: both;"></div>
  </div>

  <!-- Patient Information -->
  <div class="patient-info">
    <h2>Patient Information</h2>
    <div class="info-grid">
      <div>
        <div class="info-item">
          <span class="info-label">Patient ID:</span> ${encounter.patientId}
        </div>
        <div class="info-item">
          <span class="info-label">Encounter Date:</span> ${encounterDate}
        </div>
        <div class="info-item">
          <span class="info-label">Encounter Type:</span> ${encounter.encounterType}
        </div>
      </div>
      <div>
        <div class="info-item">
          <span class="info-label">Provider:</span> ${practitioner.name}, ${practitioner.credentials}
        </div>
        <div class="info-item">
          <span class="info-label">NPI:</span> ${practitioner.npi}
        </div>
        <div class="info-item">
          <span class="info-label">Facility:</span> ${practitioner.facility}
        </div>
      </div>
    </div>
  </div>

  <!-- Chief Complaint & History -->
  <div class="section">
    <h3>Chief Complaint & Clinical Documentation</h3>
    ${encounter.transcriptionText ? `
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0;">Transcribed Documentation:</h4>
        <p style="line-height: 1.6;">${encounter.transcriptionText}</p>
      </div>
    ` : '<p><em>No transcription available</em></p>'}
  </div>

  <!-- Clinical Summary -->
  ${encounter.summary ? `
  <div class="section">
    <h3>Clinical Assessment</h3>
    
    <div style="margin-bottom: 20px;">
      <h4>Primary Diagnosis:</h4>
      <div class="diagnosis-item">
        ${encounter.summary.diagnosis}
      </div>
    </div>

    ${encounter.summary.keyFindings && encounter.summary.keyFindings.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <h4>Key Clinical Findings:</h4>
      <ul>
        ${encounter.summary.keyFindings.map((finding: string) => `<li>${finding}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${encounter.summary.differentialDiagnosis && encounter.summary.differentialDiagnosis.length > 0 ? `
    <div style="margin-bottom: 20px;">
      <h4>Differential Diagnoses:</h4>
      <div class="diagnosis-list">
        ${encounter.summary.differentialDiagnosis.map((dx: any) => `
          <div class="diagnosis-item">
            <strong>${dx.condition}</strong> (${dx.probability}% probability)
            <br><em>${dx.reasoning}</em>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${encounter.summary.treatment ? `
    <div>
      <h4>Treatment Plan:</h4>
      <div style="background: #e8f5e8; padding: 15px; border-radius: 8px;">
        ${encounter.summary.treatment}
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <!-- Medical Coding -->
  ${encounter.emCoding ? `
  <div class="section">
    <h3>Medical Coding & Billing</h3>
    <div class="code-section">
      <div class="code-grid">
        <div class="code-item">
          <div class="code-value">${encounter.emCoding.recommendedCode}</div>
          <div>CPT Code</div>
        </div>
        <div class="code-item">
          <div class="code-value">${encounter.emCoding.confidence}%</div>
          <div>AI Confidence</div>
        </div>
        <div class="code-item">
          <div class="code-value">Level ${encounter.emCoding.mdm.level}</div>
          <div>Complexity</div>
        </div>
      </div>
      <div style="margin-top: 15px;">
        <h4>Coding Rationale:</h4>
        <p>${encounter.emCoding.rationale}</p>
        <div style="font-size: 11px; color: #666; margin-top: 10px;">
          <strong>History:</strong> ${encounter.emCoding.history.description} (Level ${encounter.emCoding.history.level}) |
          <strong>Exam:</strong> ${encounter.emCoding.exam.description} (Level ${encounter.emCoding.exam.level}) |
          <strong>MDM:</strong> ${encounter.emCoding.mdm.description} (Level ${encounter.emCoding.mdm.level})
        </div>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- AI Recommendations -->
  ${encounter.aiRecommendations && encounter.aiRecommendations.length > 0 ? `
  <div class="section">
    <h3>AI-Generated Clinical Recommendations</h3>
    <div class="recommendations">
      <ul>
        ${encounter.aiRecommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
  </div>
  ` : ''}

  <!-- Next Steps -->
  ${encounter.nextSteps && encounter.nextSteps.length > 0 ? `
  <div class="section">
    <h3>Next Steps & Follow-up</h3>
    <ol>
      ${encounter.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
    </ol>
  </div>
  ` : ''}

  ${includeSignature ? `
  <!-- Digital Signature Section -->
  <div class="signature-section">
    <h3>Provider Attestation</h3>
    <p>I attest that this clinical documentation accurately represents the patient encounter and my clinical assessment.</p>
    <div style="margin-top: 30px;">
      <div style="border-bottom: 1px solid #333; width: 300px; display: inline-block;"></div>
      <div style="margin-top: 5px;">
        <strong>${practitioner.name}, ${practitioner.credentials}</strong><br>
        NPI: ${practitioner.npi}<br>
        Date: ${currentDate}
      </div>
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <div style="text-align: center;">
      <p><strong>NexxusBridge Healthcare AI</strong> | HIPAA-Compliant Clinical Documentation System</p>
      <p>Generated on ${currentDate} | Document Version 1.0 | 
         Contact: info@nexxusbridge.com | Phone: (706) 618-0236</p>
      <p><em>This document contains confidential patient health information protected under HIPAA.</em></p>
    </div>
  </div>
</body>
</html>`;
}

function createSimplePDF(htmlContent: string): string {
  // Simplified PDF creation - in production, use a proper PDF library
  // This creates a basic representation that browsers can handle
  const pdfHeader = '%PDF-1.4\n';
  const pdfContent = `
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${htmlContent.length}
>>
stream
${htmlContent}
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000086 00000 n 
0000000159 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${200 + htmlContent.length}
%%EOF`;

  return pdfHeader + pdfContent;
}