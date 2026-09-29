import React from 'react';

const th = { border: '1px solid #999', padding: '6px 9px', textAlign: 'left', fontWeight: 'bold' };
const td = { border: '1px solid #ccc', padding: '6px 9px', verticalAlign: 'top' };

const reportTypeLabels = {
  'class-wise': 'Class-wise Workload',
  'teacher-wise': 'Teacher-wise Workload',
  'course-wise': 'Course-wise Workload',
};

export default function WorkloadReportPrintable({ innerRef, workloadTitle, reportType, report }) {
  return (
    <div
      ref={innerRef}
      style={{
        width: '794px',
        background: '#ffffff',
        color: '#111111',
        fontFamily: '"Times New Roman", Times, serif',
        position: 'relative',
        padding: '38px 76px 60px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #111',
          paddingBottom: '12px',
          marginBottom: '22px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <img src="/dcs-logo.png" alt="DCS" style={{ width: '68px', height: '68px', objectFit: 'contain' }} />
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{ fontSize: '19px', fontWeight: 'bold', color: '#7a1f1f', margin: 0, letterSpacing: '0.5px' }}>
            DEPARTMENT OF COMPUTER SCIENCE
          </h1>
          <p style={{ fontSize: '12.5px', fontWeight: 'bold', margin: '3px 0' }}>
            University of Agriculture Faisalabad (PARS Campus)
          </p>
          <p style={{ fontSize: '10.5px', fontStyle: 'italic', color: '#0a7a55', margin: 0 }}>
            {workloadTitle} — {reportTypeLabels[reportType]}
          </p>
        </div>
        <img src="/uaf-logo.png" alt="UAF" style={{ width: '68px', height: '68px', objectFit: 'contain' }} />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {report.length === 0 && (
          <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', padding: '30px 0' }}>
            No data available for this selection.
          </p>
        )}

        {report.map((group, i) => (
          <div key={i} style={{ marginBottom: '22px', pageBreakInside: 'avoid' }}>
            <h3
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                background: '#e8eef5',
                padding: '7px 11px',
                margin: '0 0 6px',
                border: '1px solid #c7d3e0',
              }}
            >
              {group.label}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {reportType === 'class-wise' && (
                    <>
                      <th style={th}>Course No.</th>
                      <th style={th}>Credit Hrs</th>
                      <th style={th}>Title of Course</th>
                      <th style={th}>Teacher(s)</th>
                    </>
                  )}
                  {reportType === 'teacher-wise' && (
                    <>
                      <th style={th}>Class</th>
                      <th style={th}>Course No.</th>
                      <th style={th}>Title</th>
                      <th style={th}>Role</th>
                    </>
                  )}
                  {reportType === 'course-wise' && (
                    <>
                      <th style={th}>Class</th>
                      <th style={th}>Teacher(s)</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {reportType === 'class-wise' &&
                  group.courses.map((c, j) => (
                    <tr key={j}>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        {c.courseCode.replace(/ /g, '\u00A0')}
                      </td>
                      <td style={td}>{c.creditHours}</td>
                      <td style={td}>{c.title}</td>
                      <td style={td}>
                        {c.teachers
                          .map((t) => `${t.designation || ''} ${t.name} (${t.role})`)
                          .join(', ')}
                      </td>
                    </tr>
                  ))}
                {reportType === 'teacher-wise' &&
                  group.rows.map((r, j) => (
                    <tr key={j}>
                      <td style={td}>{r.classLabel}</td>
                      <td style={{ ...td, whiteSpace: 'nowrap' }}>
                        {r.courseCode.replace(/ /g, '\u00A0')}
                      </td>
                      <td style={td}>{r.title}</td>
                      <td style={td}>{r.role}</td>
                    </tr>
                  ))}
                {reportType === 'course-wise' &&
                  group.rows.map((r, j) => (
                    <tr key={j}>
                      <td style={td}>{r.classLabel}</td>
                      <td style={td}>{r.teachers}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

    </div>
  );
}