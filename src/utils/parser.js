import * as XLSX from 'xlsx';

export const fetchAndParseTimetable = async () => {
  const response = await fetch('/Timetable.xlsx');
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // --- Parse Time Slots Mapping ---
  const slotsSheet = workbook.Sheets['Time Slots'];
  const slotsData = XLSX.utils.sheet_to_json(slotsSheet, { header: 1 });
  const slotMapping = {}; // e.g. { 'A1': { day: 'Monday', time: '8:30 – 9:50' } }
  
  // Find the header row in Time Slots
  let timeSlotHeaders = [];
  let startRow = 0;
  for (let i = 0; i < slotsData.length; i++) {
    if (slotsData[i][0] === 'Slot') {
      timeSlotHeaders = slotsData[i];
      startRow = i + 1;
      break;
    }
  }

  const dayMap = {
    'M': 'Monday',
    'T': 'Tuesday',
    'W': 'Wednesday',
    'Th': 'Thursday',
    'F': 'Friday'
  };

  const orderedTimeSlots = [];

  for (let i = startRow; i < slotsData.length; i++) {
    const row = slotsData[i];
    if (!row || !row[0]) break; // Empty row marks end of timetable grid
    
    const timeStr = row[0];
    if (timeStr === 'Lunch Break') continue;
    
    orderedTimeSlots.push(timeStr);

    for (let col = 1; col < timeSlotHeaders.length; col++) {
      const slotCode = row[col];
      const dayShort = timeSlotHeaders[col];
      if (slotCode && dayMap[dayShort]) {
        slotMapping[slotCode.trim()] = {
          day: dayMap[dayShort],
          time: timeStr
        };
      }
    }
  }

  // --- Parse Courses ---
  const coursesSheet = workbook.Sheets['Time table'];
  const data = XLSX.utils.sheet_to_json(coursesSheet, { header: 1 });

  const courses = [];
  
  // Header mapping:
  // 0: Course Number
  // 1: Course Name
  // 5: Credits
  // 6: Name of Instructors
  // 10: Lecture
  // 11: Tutorial
  // 12: Lab

  let currentGroup = 'Other Courses';

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    // Detect group headers (e.g. "First Year (2026)")
    if (row[0] && !row[1] && typeof row[0] === 'string') {
      currentGroup = row[0].trim();
      continue;
    }

    if (!row[0] || !row[1]) continue;

    const courseBase = {
      code: row[0],
      title: row[1],
      credits: row[5] || 0,
      instructor: row[6] || 'Unknown',
      group: currentGroup,
      slots: []
    };

    const processSlot = (cell, type) => {
      if (!cell) return;
      
      const parts = cell.split('\n');
      if (parts.length < 1) return;

      const slotStr = parts[0];
      const venueRaw = parts[1] ? parts[1].replace(/[()]/g, '') : '';
      
      let venue = venueRaw;
      if (venue && !venue.toLowerCase().includes('auditorium') && !venue.toLowerCase().includes('lab')) {
        venue = `AB ${venue}`;
      }

      // Hide venue if it's Lab/Tutorial and contains comma (multiple places)
      if ((type === 'Lab' || type === 'Tutorial') && venue.includes(',')) {
        venue = ''; // Don't show
      }

      const slotNames = slotStr.split(',').map(s => s.trim());
      slotNames.forEach(slotName => {
        if (!slotName) return;
        
        const mapped = slotMapping[slotName];
        if (mapped) {
          courseBase.slots.push({
            type,
            venue,
            day: mapped.day,
            time: mapped.time,
            original: slotName
          });
        }
      });
    };

    processSlot(row[10], 'Lecture');
    processSlot(row[11], 'Tutorial');
    processSlot(row[12], 'Lab');

    if (courseBase.slots.length > 0) {
      courses.push(courseBase);
    }
  }

  return { courses, orderedTimeSlots, days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] };
};
