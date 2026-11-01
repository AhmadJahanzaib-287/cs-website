import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

export default async function downloadApplicationPDF(element, studentRegNo, serialNumber) {
  if (!element) throw new Error('Application preview is not ready.');

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '794px';

  const clone = element.cloneNode(true);
  clone.style.transform = 'none';
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.height = '1123px';
  clone.style.boxSizing = 'border-box';
  const serialField = clone.querySelector('[data-application-serial]');
  if (serialField) serialField.textContent = serialNumber;

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123,
    });
    const pdf = new jsPDF('p', 'mm', 'a4');
    pdf.addImage(canvas.toDataURL('image/jpeg', 1), 'JPEG', 0, 0, 210, 297);
    pdf.save(`${serialNumber}_${studentRegNo || 'UAF'}_Application.pdf`);
  } finally {
    container.remove();
  }
}