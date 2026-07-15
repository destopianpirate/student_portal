import * as XLSX from 'xlsx';

export const fetchAndParseMessMenu = async () => {
  const response = await fetch(encodeURI('/Mess Menu May 2026.xlsx'));
  if (!response.ok) throw new Error(`Failed to fetch mess menu: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets['Menu'] || workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error('No valid sheet found in mess menu file');
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const meals = {
    Breakfast: { time: '07:45 AM - 10:00 AM', items: {} },
    Lunch: { time: '12:15 PM - 2:15 PM', items: {} },
    Snacks: { time: '04:30 PM - 05:45 PM', items: {} },
    Dinner: { time: '7:30 PM - 9:30 PM', items: {} }
  };

  let currentMeal = null;
  let headerRow = false;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const firstCell = String(row[0] || '').trim();
    const lowerFirst = firstCell.toLowerCase();

    // Detect meal section headers (must contain times in parentheses or after dashes)
    if (lowerFirst.startsWith('breakfast') && (firstCell.includes('(') || firstCell.includes('-'))) {
      currentMeal = 'Breakfast';
      const timeMatch = firstCell.match(/\((.+)\)/);
      if (timeMatch) meals.Breakfast.time = timeMatch[1];
      headerRow = true;
      continue;
    } else if (lowerFirst.startsWith('lunch') && (firstCell.includes('(') || firstCell.includes('-'))) {
      currentMeal = 'Lunch';
      const timeMatch = firstCell.match(/(\d.+)/);
      if (timeMatch) meals.Lunch.time = timeMatch[1].trim();
      headerRow = true;
      continue;
    } else if (lowerFirst.startsWith('snack') && (firstCell.includes('(') || firstCell.includes('-'))) {
      currentMeal = 'Snacks';
      const timeMatch = firstCell.match(/(\d.+)/);
      if (timeMatch) meals.Snacks.time = timeMatch[1].trim();
      headerRow = true;
      continue;
    } else if (lowerFirst.startsWith('dinner') && (firstCell.includes('(') || firstCell.includes('-'))) {
      currentMeal = 'Dinner';
      const timeMatch = firstCell.match(/(\d.+)/);
      if (timeMatch) meals.Dinner.time = timeMatch[1].trim();
      headerRow = true;
      continue;
    }

    // Skip header rows (Day, Monday, Tuesday, ...)
    if (firstCell === 'Day') {
      headerRow = false;
      continue;
    }

    // Skip title row and empty meal
    if (!currentMeal || /^MESS MENU/i.test(firstCell)) continue;

    // Parse item rows
    if (row.length > 1 && firstCell) {
      const category = firstCell;
      days.forEach((day, idx) => {
        const value = row[idx + 1];
        if (value && String(value).trim()) {
          if (!meals[currentMeal].items[day]) meals[currentMeal].items[day] = [];
          meals[currentMeal].items[day].push({
            category,
            item: String(value).trim()
          });
        }
      });
    }
  }

  return { meals, days };
};
