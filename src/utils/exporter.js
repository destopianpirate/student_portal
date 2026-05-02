import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportToExcel = async (timetable, days, timeslots, selectedCourses) => {
  const workbook = new ExcelJS.Workbook();
  
  // --- Sheet 1: Timetable ---
  const worksheet = workbook.addWorksheet('Timetable');

  // Set up columns (First column for time slots, then days)
  const columns = [
    { header: 'Time Slot', key: 'time', width: 20 },
    ...days.map(day => ({ header: day, key: day, width: 30 }))
  ];
  worksheet.columns = columns;

  // Color generator for courses
  const getCourseColor = (courseCode) => {
    const colors = [
      'FFe0f2fe', 'FFdbeafe', 'FFede9fe', 'FFf3e8ff', 'FFfae8ff', 
      'FFfce7f3', 'FFffe4e6', 'FFffedd5', 'FFfef3c7', 'FFecfccb', 'FFdcfce7'
    ];
    let hash = 0;
    for (let i = 0; i < courseCode.length; i++) {
      hash = courseCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Add data
  timeslots.forEach(time => {
    if (time === "13:00 - 14:00") {
      const row = worksheet.addRow({ time: time });
      row.getCell(2).value = "LUNCH BREAK";
      worksheet.mergeCells(`B${row.number}:${String.fromCharCode(65 + days.length)}${row.number}`);
      row.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
      row.getCell(2).font = { bold: true };
      row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFEFEF' } };
      return;
    }

    const rowData = { time: time };
    days.forEach(day => {
      const entries = timetable[day] && timetable[day][time];
      if (entries && entries.length > 0) {
        rowData[day] = entries.map(e => {
          let str = `${e.code}\n${e.title}\n${e.type}`;
          if (e.venue) str += `\n${e.venue}`;
          return str;
        }).join('\n---\n');
      }
    });
    const row = worksheet.addRow(rowData);
    row.height = 80;

    // Apply color for subjects
    days.forEach((day, index) => {
      const colNum = index + 2;
      const entries = timetable[day] && timetable[day][time];
      if (entries && entries.length > 0) {
        const cell = row.getCell(colNum);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: getCourseColor(entries[0].code) }
        };
      }
    });
  });

  // Formatting for Sheet 1
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.eachCell((cell, colNumber) => {
      cell.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
      // No borders as per user request
    });
  });

  // --- Sheet 2: Courses ---
  const coursesSheet = workbook.addWorksheet('Courses');
  
  coursesSheet.columns = [
    { header: 'Course Code', key: 'code', width: 15 },
    { header: 'Course Title', key: 'title', width: 40 },
    { header: 'Credits', key: 'credits', width: 10 },
    { header: 'Professor Name', key: 'instructor', width: 35 }
  ];

  coursesSheet.getRow(1).font = { bold: true };
  coursesSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };

  let totalCredits = 0;
  selectedCourses.forEach(c => {
    coursesSheet.addRow({
      code: c.code,
      title: c.title,
      credits: c.credits,
      instructor: c.instructor
    });
    totalCredits += (parseFloat(c.credits) || 0);
  });

  // Add total credits row
  const totalRow = coursesSheet.addRow({
    title: 'TOTAL CREDITS',
    credits: totalCredits
  });
  totalRow.font = { bold: true };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFF00' } // Yellow background for total
  };

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), 'Generated_Timetable.xlsx');
};
