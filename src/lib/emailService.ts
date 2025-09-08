// Email service integration with Supabase edge function

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendEmail(emailData: EmailData): Promise<EmailResponse> {
  try {
    console.log('Sending email to:', emailData.to);
    
    const response = await fetch(
      'https://lhdwtrfowovkpqwbixbg.supabase.co/functions/v1/3a50f702-d5e9-4ec7-8b7f-d19d46af98ca',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZHd0cmZvd292a3Bxd2JpeGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4NjM4MzEsImV4cCI6MjA1MDQzOTgzMX0.TQqSzlpbJYOhHOKJdWgYqHgNvxKhEGqYJHVCiW7IXEM'
        },
        body: JSON.stringify(emailData)
      }
    );

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('Email result:', result);
    return result;
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export function generatePaysEmailContent(paysData: any): string {
  const { shooterPayments, commission, speciesBreakdown } = paysData;
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Pays Report - ${new Date().toLocaleDateString()}</h2>
      
      <h3 style="color: #007bff; margin-top: 30px;">Shooter Payments</h3>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Shooter</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Roos</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Kg</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Rate</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Payment (inc GST)</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  shooterPayments.forEach((payment: any) => {
    html += `
      <tr>
        <td style="border: 1px solid #dee2e6; padding: 12px;">${payment.shooter}</td>
        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${payment.roos}</td>
        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${payment.kg.toFixed(2)}</td>
        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">$${payment.rate.toFixed(2)}/kg</td>
        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right; font-weight: bold;">$${payment.payment.toFixed(2)}</td>
      </tr>
    `;
  });
  
  const totalPayments = shooterPayments.reduce((sum: number, p: any) => sum + p.payment, 0);
  
  html += `
        <tr style="background-color: #e9ecef; font-weight: bold;">
          <td style="border: 1px solid #dee2e6; padding: 12px;" colspan="4">Total Shooter Payments</td>
          <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">$${totalPayments.toFixed(2)}</td>
        </tr>
        </tbody>
      </table>
      
      <h3 style="color: #007bff; margin-top: 30px;">Commission Details</h3>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>Commission Rate:</strong> ${commission.rate}c per kg</p>
        <p style="margin: 5px 0;"><strong>Total Commission (inc GST):</strong> <span style="font-size: 18px; color: #007bff;">$${commission.total.toFixed(2)}</span></p>
      </div>
      
      <h3 style="color: #007bff; margin-top: 30px;">Species Breakdown</h3>
      <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Species</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Roos</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">Kg</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  speciesBreakdown.forEach((species: any) => {
    html += `
      <tr>
        <td style="border: 1px solid #dee2e6; padding: 12px;">${species.species}</td>
        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${species.roos}</td>
        <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${species.kg.toFixed(2)}</td>
      </tr>
    `;
  });
  
  const totalRoos = speciesBreakdown.reduce((sum: number, s: any) => sum + s.roos, 0);
  const totalKg = speciesBreakdown.reduce((sum: number, s: any) => sum + s.kg, 0);
  
  html += `
        <tr style="background-color: #e9ecef; font-weight: bold;">
          <td style="border: 1px solid #dee2e6; padding: 12px;">Total</td>
          <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${totalRoos}</td>
          <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${totalKg.toFixed(2)}</td>
        </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; padding: 15px; background-color: #d4edda; border-radius: 5px; border-left: 4px solid #28a745;">
        <p style="margin: 0; font-size: 14px; color: #155724;">This report was generated automatically from the Inventory Management System on ${new Date().toLocaleString()}.</p>
      </div>
    </div>
  `;
  
  return html;
}
