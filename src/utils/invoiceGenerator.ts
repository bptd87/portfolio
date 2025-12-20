import QRCode from 'qrcode';
import { Invoice } from '../types/business';
import { createClient } from './supabase/client';

export const generateInvoicePDF = async (invoice: Invoice, companyName: string, paymentInfo?: string, qrUrl?: string) => {
  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  // Fetch branding settings
  const supabase = createClient();
  const { data: settings } = await supabase.from('app_settings').select('*').eq('id', 1).single();
  
  const businessName = settings?.business_name || 'BRANDON P. DAVIS';
  const businessWeb = settings?.business_website || 'brandonptdavis.com';
  const footerNote = settings?.invoice_footer_note || 'Thank you for your business.';
  const bAddr = settings?.business_address || { street: '', city: 'Los Angeles', state: 'CA', country: 'USA' };

  const doc = new JsPDF();
  
  // Colors
  const accentColor = [16, 185, 129]; // Emerald 500
  const darkColor = [24, 24, 27]; // Zinc 900
  const lightText = [113, 113, 122]; // Zinc 500

  // -- Logo / Brand Header --
  doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.rect(0, 0, 210, 50, 'F');

  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName.toUpperCase(), 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text('DESIGN & TECHNOLOGY', 14, 28);
  
  // Business Address under Title
  doc.setTextColor(180, 180, 180);
  doc.setFontSize(9);
  let headerY = 35;
  if (bAddr.street) { doc.text(bAddr.street, 14, headerY); headerY += 4; }
  doc.text(`${bAddr.city}, ${bAddr.state} ${bAddr.zip || ''}`, 14, headerY);

  // Invoice Number block (Right aligned in header)
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE', 196, 20, { align: 'right' });
  doc.setFontSize(14);
  doc.setTextColor(200, 200, 200);
  doc.text(`#${invoice.number}`, 196, 28, { align: 'right' });

  // -- Info Stats --
  let y = 65;
  
  doc.setFontSize(10);
  doc.setTextColor(lightText[0], lightText[1], lightText[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO', 14, y);
  doc.text('DATE OF ISSUE', 120, y);
  doc.text('TOTAL DUE', 196, y, { align: 'right' });

  y += 7;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(companyName, 14, y);
  
  // Client Address
  if (invoice.company?.address) {
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');
      const addr = invoice.company.address;
      const addressLines = [
          addr.street,
          `${addr.city ? addr.city + ',' : ''} ${addr.state || ''} ${addr.zip || ''}`,
          addr.country !== 'USA' ? addr.country : null
      ].filter(Boolean);
      
      addressLines.forEach(line => {
          if(line) {
            doc.text(line, 14, y);
            y += 5;
          }
      });
      // Adjust y back up if address was short to align with date
      y = Math.max(y, 72); 
  }
  
  // Date and Total on right
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.issue_date, 120, 72);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(`$${invoice.total_amount?.toFixed(2)}`, 196, 72, { align: 'right' });

  // -- Table --
  // Using items if available in the extended invoice object
  const items = (invoice as any).items || (invoice as any).invoice_items || [
    { description: 'Design & Development Services', quantity: 1, unit_price: invoice.total_amount, amount: invoice.total_amount }
  ];

  const tableData = items.map((item: any) => [
    item.description,
    item.quantity,
    `$${(item.unit_price || 0).toFixed(2)}`,
    `$${(item.amount || 0).toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: y + 10,
    head: [['DESCRIPTION', 'QTY / HRS', 'RATE', 'AMOUNT']],
    body: tableData,
    theme: 'plain', // Cleaner look
    headStyles: { 
        fillColor: [250, 250, 250], 
        textColor: [100, 100, 100], 
        fontStyle: 'bold', 
        lineWidth: 0,
        cellPadding: 4
    },
    columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30, halign: 'right' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 30, halign: 'right' }
    },
    styles: { 
        font: 'helvetica', 
        fontSize: 10, 
        cellPadding: 4, 
        lineColor: [240, 240, 240],
        lineWidth: { bottom: 0.1 } 
    },
    foot: [['', '', 'TOTAL', `$${invoice.total_amount?.toFixed(2)}`]],
    footStyles: { 
        fillColor: [255, 255, 255], 
        textColor: accentColor, 
        fontSize: 12,
        fontStyle: 'bold', 
        halign: 'right',
        cellPadding: 8
    }
  });

  // -- Payment & Footer --
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  // Left Side: Payment Info
  const effectiveQrUrl = qrUrl || (invoice as any).payment_qr_url;

  if (paymentInfo || effectiveQrUrl) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('PAYMENT METHOD', 14, finalY);
      
      try {
        if (effectiveQrUrl) {
           const img = new Image();
           img.src = effectiveQrUrl;
           img.crossOrigin = "Anonymous";
           await new Promise((resolve) => {
               img.onload = resolve;
               img.onerror = resolve; 
           });
           doc.addImage(img, 'PNG', 14, finalY + 5, 30, 30);
        } else if (paymentInfo && !effectiveQrUrl) {
           // Case 2: Text ID (Zelle) -> Generate QR only if no image
           const qrDataUrl = await QRCode.toDataURL(paymentInfo, { width: 100, margin: 1, color: { dark: '#18181b', light: '#ffffff' } });
           doc.addImage(qrDataUrl, 'PNG', 14, finalY + 5, 30, 30);
        }
      } catch (e) {
          console.error("QR Error", e);
      }

      if (paymentInfo) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100);
          doc.text(`Zelle / ID: ${paymentInfo}`, 50, finalY + 20);
      }
  }

  // Right Side: Notes
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150);
  
  doc.text(businessWeb, 196, pageHeight - 20, { align: 'right' });
  doc.text(footerNote, 196, pageHeight - 15, { align: 'right' });

  // Save via browser
  doc.save(`Invoice_${invoice.number}.pdf`);
};
