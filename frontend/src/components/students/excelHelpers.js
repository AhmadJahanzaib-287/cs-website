import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

/**
 * Maps arbitrary header names to known student schema keys
 */
const normalizeHeader = (header) => {
  if (!header) return '';
  const clean = String(header).toLowerCase().replace(/[^a-z0-9]/g, '');

  if (/^(regno|rollno|registration|reg|roll|studentid|id)$/.test(clean)) return 'regNo';
  if (/^(name|studentname|fullname|student)$/.test(clean)) return 'name';
  if (/^(fathername|father|guardianname)$/.test(clean)) return 'fatherName';
  if (/^(degree|program|discipline|department)$/.test(clean)) return 'degree';
  if (/^(session|shift|timing)$/.test(clean)) return 'session';
  if (/^(academicsession|batch|year|sessionyears)$/.test(clean)) return 'academicSession';
  if (/^(semester|sem|term)$/.test(clean)) return 'semester';
  if (/^(section|sec)$/.test(clean)) return 'section';
  if (/^(gender|sex)$/.test(clean)) return 'gender';
  if (/^(email|emailaddress|mail)$/.test(clean)) return 'email';
  if (/^(phone|contact|phonenumber|cell|mobile)$/.test(clean)) return 'phone';
  if (/^(cnic|bform|identity|nic)$/.test(clean)) return 'cnic';
  if (/^(guardianphone|emergencycontact|fatherphone)$/.test(clean)) return 'guardianPhone';
  if (/^(address|city|domicile)$/.test(clean)) return 'address';
  if (/^(status|enrollmentstatus)$/.test(clean)) return 'status';
  if (/^(cgpa|gpa|marks)$/.test(clean)) return 'cgpa';

  return clean;
};

/**
 * Generate and download a styled Excel Template for importing class students
 */
export const downloadSampleTemplate = async (classDefaults = {}) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DCS PARS - UAF';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Students');

  // Columns definition
  worksheet.columns = [
    { header: 'Roll / Reg No *', key: 'regNo', width: 18 },
    { header: 'Student Name *', key: 'name', width: 24 },
    { header: 'Father Name', key: 'fatherName', width: 22 },
    { header: 'Degree / Program', key: 'degree', width: 24 },
    { header: 'Batch / Session', key: 'academicSession', width: 16 },
    { header: 'Semester', key: 'semester', width: 14 },
    { header: 'Shift (Morning/Evening)', key: 'session', width: 22 },
    { header: 'Section', key: 'section', width: 12 },
    { header: 'Gender', key: 'gender', width: 12 },
    { header: 'Email Address', key: 'email', width: 26 },
    { header: 'Phone Number', key: 'phone', width: 18 },
    { header: 'CNIC / B-Form', key: 'cnic', width: 20 },
    { header: 'Guardian Phone', key: 'guardianPhone', width: 18 },
    { header: 'City / Address', key: 'address', width: 26 },
  ];

  // Style Header Row
  const headerRow = worksheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF172E6E' }, // DCS Navy Blue
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
      bottom: { style: 'medium', color: { argb: 'FF0E7490' } },
      right: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    };
  });

  const targetDegree = classDefaults.degree || 'BS Computer Science';
  const targetBatch = classDefaults.academicSession || '2023-2027';
  const targetSemester = classDefaults.semester || '4th';
  const targetSession = classDefaults.session || 'Morning';
  const targetSection = classDefaults.section || 'A';

  // Sample Rows
  const sampleRows = [
    {
      regNo: '2023-AG-8001',
      name: 'Muhammad Ahmad',
      fatherName: 'Tariq Mehmood',
      degree: targetDegree,
      academicSession: targetBatch,
      semester: targetSemester,
      session: targetSession,
      section: targetSection,
      gender: 'Male',
      email: 'ahmad.2023@example.com',
      phone: '0300-1234567',
      cnic: '33100-1234567-1',
      guardianPhone: '0301-9876543',
      address: 'Faisalabad',
    },
    {
      regNo: '2023-AG-8002',
      name: 'Fatima Zahra',
      fatherName: 'Muhammad Arshad',
      degree: targetDegree,
      academicSession: targetBatch,
      semester: targetSemester,
      session: targetSession,
      section: targetSection,
      gender: 'Female',
      email: 'fatima.2023@example.com',
      phone: '0321-7654321',
      cnic: '33102-7654321-2',
      guardianPhone: '0322-1239876',
      address: 'Jhang',
    },
    {
      regNo: '2023-AG-8003',
      name: 'Ali Hassan',
      fatherName: 'Ghulam Rasool',
      degree: targetDegree,
      academicSession: targetBatch,
      semester: targetSemester,
      session: targetSession,
      section: targetSection,
      gender: 'Male',
      email: 'ali.2023@example.com',
      phone: '0345-1122334',
      cnic: '33104-1122334-3',
      guardianPhone: '0346-5566778',
      address: 'Toba Tek Singh',
    },
  ];

  sampleRows.forEach((row) => {
    const newRow = worksheet.addRow(row);
    newRow.height = 22;
    newRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 10 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const sanitizedClass = `${targetDegree}_${targetSemester}_${targetSession}_Sec${targetSection}`.replace(/\s+/g, '_');
  saveAs(blob, `DCS_Students_Template_${sanitizedClass}.xlsx`);
};

/**
 * Parse uploaded Excel or CSV file
 */
export const parseExcelFile = async (file, classDefaults = {}) => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error('The uploaded Excel file does not contain any worksheets.');
  }

  // 1. Identify Header Row (row 1)
  const headerMap = {};
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const rawVal = cell.value ? String(cell.value).trim() : '';
    const key = normalizeHeader(rawVal);
    if (key) {
      headerMap[colNumber] = key;
    }
  });

  if (!Object.values(headerMap).includes('regNo') && !Object.values(headerMap).includes('name')) {
    throw new Error(
      'Could not detect required columns ("Roll / Reg No" and "Student Name"). Please download and use our sample template.'
    );
  }

  const parsedStudents = [];
  const errors = [];

  // 2. Iterate data rows starting from row 2
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const rowData = {};
    let hasAnyData = false;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headerMap[colNumber];
      if (!key) return;

      let val = cell.value;
      // Handle rich text or hyperlinks from Excel
      if (val && typeof val === 'object') {
        if (val.text) val = val.text;
        else if (val.result) val = val.result;
        else val = String(val);
      }

      if (val !== null && val !== undefined && String(val).trim() !== '') {
        rowData[key] = String(val).trim();
        hasAnyData = true;
      }
    });

    if (!hasAnyData) return; // ignore completely blank rows

    const rawRegNo = rowData.regNo;
    const rawName = rowData.name;

    if (!rawRegNo || !rawName) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: Missing required ${!rawRegNo ? 'Roll / Reg No' : 'Student Name'}`,
        data: rowData,
      });
      return;
    }

    const regNo = String(rawRegNo).trim().toUpperCase();
    const name = String(rawName).trim();

    // Fill defaults if missing in the excel sheet
    const degree = rowData.degree || classDefaults.degree || 'BS Computer Science';
    const academicSession = rowData.academicSession || classDefaults.academicSession || '2023-2027';
    const semester = rowData.semester || classDefaults.semester || '1st';
    const rawSession = rowData.session || classDefaults.session || 'Morning';
    const session = String(rawSession).toLowerCase().includes('even') ? 'Evening' : 'Morning';
    const section = (rowData.section || classDefaults.section || 'A').toUpperCase();

    parsedStudents.push({
      regNo,
      name,
      fatherName: rowData.fatherName || '',
      degree,
      academicSession,
      semester,
      session,
      section,
      gender: rowData.gender || 'Male',
      email: rowData.email || '',
      phone: rowData.phone || '',
      cnic: rowData.cnic || '',
      guardianPhone: rowData.guardianPhone || '',
      address: rowData.address || '',
      status: rowData.status || 'Active',
      cgpa: rowData.cgpa || '',
    });
  });

  return {
    students: parsedStudents,
    totalParsed: parsedStudents.length,
    errorCount: errors.length,
    errors,
  };
};

/**
 * Export list of students to styled Excel
 */
export const exportStudentsToExcel = async (students = [], title = 'DCS Enrolled Students Directory') => {
  if (!students.length) return;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DCS PARS';
  const worksheet = workbook.addWorksheet('Students List');

  // Title block
  worksheet.mergeCells('A1:L1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = `Department of Computer Science (PARS) - ${title}`;
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF172E6E' },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 36;

  worksheet.mergeCells('A2:L2');
  const subCell = worksheet.getCell('A2');
  subCell.value = `Exported on: ${new Date().toLocaleString()} · Total Students: ${students.length}`;
  subCell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF334155' } };
  subCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  };
  subCell.alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(2).height = 20;

  // Header Row at row 4
  const headers = [
    { header: '#', key: 'index', width: 6 },
    { header: 'Reg / Roll No', key: 'regNo', width: 18 },
    { header: 'Student Name', key: 'name', width: 22 },
    { header: 'Father Name', key: 'fatherName', width: 22 },
    { header: 'Degree', key: 'degree', width: 22 },
    { header: 'Semester', key: 'semester', width: 12 },
    { header: 'Shift', key: 'session', width: 12 },
    { header: 'Sec', key: 'section', width: 8 },
    { header: 'Batch', key: 'academicSession', width: 14 },
    { header: 'Contact Phone', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Status', key: 'status', width: 12 },
  ];

  const headerRow = worksheet.getRow(4);
  headerRow.height = 26;
  headers.forEach((h, idx) => {
    const cell = headerRow.getCell(idx + 1);
    cell.value = h.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF0E7490' }, // Teal
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
    };
    worksheet.getColumn(idx + 1).width = h.width;
  });

  // Data Rows
  students.forEach((stu, index) => {
    const row = worksheet.addRow([
      index + 1,
      stu.regNo,
      stu.name,
      stu.fatherName || '—',
      stu.degree,
      stu.semester,
      stu.session,
      stu.section,
      stu.academicSession || '—',
      stu.phone || '—',
      stu.email || '—',
      stu.status || 'Active',
    ]);
    row.height = 20;

    const isEven = index % 2 === 0;
    row.eachCell((cell, colNumber) => {
      cell.font = { size: 9 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 || colNumber === 6 || colNumber === 7 || colNumber === 8 || colNumber === 12 ? 'center' : 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      if (isEven) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8FAFC' },
        };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const sanitized = title.replace(/[^a-zA-Z0-9_-]/g, '_');
  saveAs(blob, `${sanitized}.xlsx`);
};

