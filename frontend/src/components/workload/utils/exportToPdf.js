import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

// CRITICAL: never embed the raw source logo directly — it may be several MB
// and gets re-added on every single page of a multi-page report. Drawing it
// onto a small canvas first guarantees the embedded copy is always tiny,
// regardless of how large the original PNG file is.
const getScaledImageDataUrl = async (path, size) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = path;
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  return canvas.toDataURL('image/png');
};

/**
 * Renders a DOM element to a multi-page A4 PDF and triggers a download.
 * Watermark and footer are drawn separately by jsPDF on every page (not part
 * of the captured HTML), so they stay correctly centered / bottom-anchored
 * per page regardless of how many pages the content spans.
 */
export async function exportElementToPdf(element, fileName) {
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  // Pre-scaled once, then reused (with an explicit alias) on every page —
  // this is what actually keeps the file small, not the JPEG quality/scale.
  const watermarkData = await getScaledImageDataUrl('/dcs-logo.png', 520);
  const watermarkAlias = 'workload-watermark';

  const pdf = new jsPDF('p', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const watermarkSize = 260;
  const wmX = (pageWidth - watermarkSize) / 2;
  const wmY = (pageHeight - watermarkSize) / 2;

  const drawPageDecorations = () => {
    // Watermark — centered, very low opacity, drawn on top so it never gets
    // hidden by the content image's white background. The alias forces
    // jsPDF to reuse the same embedded copy on every page instead of
    // re-storing the image data each time.
    pdf.saveGraphicsState();
    pdf.setGState(new pdf.GState({ opacity: 0.06 }));
    pdf.addImage(watermarkData, 'PNG', wmX, wmY, watermarkSize, watermarkSize, watermarkAlias);
    pdf.restoreGraphicsState();

    // ================= FOOTER =================
    const footerY = pageHeight - 42;

    pdf.setDrawColor(15, 23, 42); // slate-900
    pdf.setLineWidth(1.2);
    pdf.line(35, footerY, pageWidth - 35, footerY);

    pdf.setLineWidth(0.4);
    pdf.line(35, footerY + 3, pageWidth - 35, footerY + 3);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(30, 41, 59);

    const items = [
      'cs@uaf.edu.pk',
      '+92-300-1234567',
      'www.uaf.edu.pk',
      'facebook.com/uaf',
      '@uaf',
      'linkedin.com/uaf',
      'University Road, Faisalabad, Pakistan',
    ];

    const footerText = items.join('   |   ');

    pdf.text(footerText, pageWidth / 2, footerY + 16, { align: 'center' });

    pdf.setLineWidth(0.4);
    pdf.line(35, footerY + 24, pageWidth - 35, footerY + 24);

    pdf.setLineWidth(1.2);
    pdf.line(35, footerY + 27, pageWidth - 35, footerY + 27);
  };

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  drawPageDecorations();
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    drawPageDecorations();
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}