import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  AlignmentType,
  WidthType,
  Header,
  Footer,
  TextWrappingType,
  HorizontalPositionAlign,
  HorizontalPositionRelativeFrom,
  VerticalPositionAlign,
  VerticalPositionRelativeFrom,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

const BASE_FONT = 'Times New Roman';
const FOOTER_FONT = 'Arial';

const reportTypeLabels = {
  'class-wise': 'Class-wise Workload',
  'teacher-wise': 'Teacher-wise Workload',
  'course-wise': 'Course-wise Workload',
};

const FOOTER_ITEMS = [
  'cs@uaf.edu.pk',
  '+92-300-1234567',
  'www.uaf.edu.pk',
  'facebook.com/uaf',
  '@uaf',
  'linkedin.com/uaf',
  'University Road, Faisalabad, Pakistan',
];

// Locks the space inside a course code (e.g. "CS 412") so it never wraps
// onto two lines inside a narrow table column — mirrors the PDF fix.
const lockCourseCode = (code) => (code || '').replace(/ /g, '\u00A0');

const fetchImageBuffer = async (path) => {
  const res = await fetch(path);
  return await res.arrayBuffer();
};

// Bakes the logo into a faded PNG (via canvas globalAlpha) so it reads as a
// genuine watermark — same 0.06 opacity used in the PDF (260pt ≈ 347px).
const createFadedImageBuffer = async (path, opacity = 0.06, size = 347) => {
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
  ctx.globalAlpha = opacity;
  ctx.drawImage(img, 0, 0, size, size);

  const dataUrl = canvas.toDataURL('image/png');
  const res = await fetch(dataUrl);
  return await res.arrayBuffer();
};

// Table cell borders matching the PDF's `th` (999999, header) / `td`
// (cccccc, body) inline styles.
const headerCellBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '999999' },
};
const bodyCellBorder = {
  top: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 2, color: 'CCCCCC' },
};

// Matches the PDF group-label box: bg #e8eef5, border 1px solid #c7d3e0
const groupLabelBorder = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: 'C7D3E0',
};

const bodyTextRun = (text) =>
  new TextRun({ text: String(text || ''), font: BASE_FONT, size: 16 });

export async function exportReportToWord({ workloadTitle, reportType, report, fileName }) {
  const [dcsLogo, uafLogo, watermarkBuffer] = await Promise.all([
    fetchImageBuffer('/dcs-logo.png'),
    fetchImageBuffer('/uaf-logo.png'),
    createFadedImageBuffer('/dcs-logo.png', 0.06, 347),
  ]);

  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

  // ============ HEADER LOGO ROW (matches the PDF letterhead — 68x68 logos) ============
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [new ImageRun({ data: dcsLogo, transformation: { width: 68, height: 68 } })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 60, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'DEPARTMENT OF COMPUTER SCIENCE',
                    bold: true,
                    size: 28,
                    color: '7A1F1F',
                    font: BASE_FONT,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'University of Agriculture Faisalabad (PARS Campus)',
                    bold: true,
                    size: 19,
                    font: BASE_FONT,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${workloadTitle} — ${reportTypeLabels[reportType]}`,
                    italics: true,
                    size: 16,
                    color: '0A7A55',
                    font: BASE_FONT,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new ImageRun({ data: uafLogo, transformation: { width: 68, height: 68 } })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // A 2px-equivalent bottom border under the header row, matching the PDF's
  // `borderBottom: '2px solid #111'`
  const headerDivider = new Paragraph({
    spacing: { after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: '111111' } },
    children: [],
  });

  // ============ WATERMARK (page Header, floats behind text, repeats every page) ============
  const pageHeader = new Header({
    children: [
      new Paragraph({
        children: [
          new ImageRun({
            data: watermarkBuffer,
            transformation: { width: 347, height: 347 },
            floating: {
              horizontalPosition: {
                relative: HorizontalPositionRelativeFrom.PAGE,
                align: HorizontalPositionAlign.CENTER,
              },
              verticalPosition: {
                relative: VerticalPositionRelativeFrom.PAGE,
                align: VerticalPositionAlign.CENTER,
              },
              wrap: { type: TextWrappingType.BEHIND_DOCUMENT_TEXT },
            },
          }),
        ],
      }),
    ],
  });

  // ============ FOOTER — double-line, pipe-separated, matches the PDF exactly ============
  const pageFooter = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        border: {
          top: { style: BorderStyle.DOUBLE, size: 6, color: '0F172A' },
          bottom: { style: BorderStyle.DOUBLE, size: 6, color: '0F172A' },
        },
        children: [
          new TextRun({
            text: FOOTER_ITEMS.join('   |   '),
            bold: true,
            size: 16,
            color: '1E293B',
            font: FOOTER_FONT,
          }),
        ],
      }),
    ],
  });

  // ============ BODY CONTENT ============
  const bodyElements = [];

  report.forEach((group) => {
    bodyElements.push(
      new Paragraph({
        spacing: { before: 240, after: 120 },
        shading: { fill: 'E8EEF5' },
        border: {
          top: groupLabelBorder,
          bottom: groupLabelBorder,
          left: groupLabelBorder,
          right: groupLabelBorder,
        },
        children: [
          new TextRun({ text: group.label, bold: true, size: 20, font: BASE_FONT, color: '111111' }),
        ],
      })
    );

    let headerCells;
    let bodyRows;

    if (reportType === 'class-wise') {
      headerCells = ['Course No.', 'Credit Hrs', 'Title of Course', 'Teacher(s)'];
      bodyRows = group.courses.map((c) => [
        lockCourseCode(c.courseCode),
        c.creditHours || '',
        c.title,
        c.teachers.map((t) => `${t.designation || ''} ${t.name} (${t.role})`).join(', '),
      ]);
    } else if (reportType === 'teacher-wise') {
      headerCells = ['Class', 'Course No.', 'Title', 'Role'];
      bodyRows = group.rows.map((r) => [r.classLabel, lockCourseCode(r.courseCode), r.title, r.role]);
    } else {
      headerCells = ['Class', 'Teacher(s)'];
      bodyRows = group.rows.map((r) => [r.classLabel, r.teachers]);
    }

    bodyElements.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: headerCells.map(
              (h) =>
                new TableCell({
                  shading: { fill: 'F5F5F5' },
                  borders: headerCellBorder,
                  margins: { top: 60, bottom: 60, left: 90, right: 90 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: h, bold: true, size: 16, font: BASE_FONT, color: '111111' }),
                      ],
                    }),
                  ],
                })
            ),
          }),
          ...bodyRows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      borders: bodyCellBorder,
                      margins: { top: 60, bottom: 60, left: 90, right: 90 },
                      children: [new Paragraph({ children: [bodyTextRun(cell)] })],
                    })
                ),
              })
          ),
        ],
      })
    );
  });

  if (report.length === 0) {
    bodyElements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 300 },
        children: [
          new TextRun({
            text: 'No data available for this selection.',
            italics: true,
            color: '888888',
            font: BASE_FONT,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: BASE_FONT },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            // Matches the PDF template's 38px/76px padding
            // (1px ≈ 15 twips at 96dpi)
            margin: {
              top: 570,
              bottom: 570,
              left: 1140,
              right: 1140,
            },
          },
        },
        headers: { default: pageHeader },
        footers: { default: pageFooter },
        children: [headerTable, headerDivider, ...bodyElements],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}