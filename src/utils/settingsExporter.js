import { jsPDF } from 'jspdf';

const GRADE_POINTS = {
  'A+': 11, 'A': 10, 'A-': 9, 'B': 8, 'B-': 7, 'C': 6,
  'C-': 5, 'D': 4, 'E': 2, 'F': 0, 'I': null, 'W': null,
};

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
};

export const handleDownloadData = (currentUser, userProfile, addNotification) => {
  if (!userProfile) return;
  try {
    const notes = JSON.parse(localStorage.getItem('student_notes') || '[]');
    const events = JSON.parse(localStorage.getItem('custom_events') || '[]');
    const certificates = JSON.parse(localStorage.getItem('student_certificates') || '[]');
    const projects = JSON.parse(localStorage.getItem('student_projects') || '[]');
    const rawGrades = JSON.parse(localStorage.getItem(`grades_${currentUser.uid}`) || '[]');
    const timetableCourses = JSON.parse(localStorage.getItem(`courses_${currentUser.uid}`) || '[]');
    
    // Reconcile/sync running semester courses from timetable to grades before export
    const runningSemName = userProfile.semester;
    let finalGrades = [...rawGrades];
    if (runningSemName) {
      const savedCoursesJSON = localStorage.getItem(`courses_${currentUser.uid}`);
      const timetableCoursesList = savedCoursesJSON ? JSON.parse(savedCoursesJSON) : (userProfile.selectedCourses || []);
      
      const exists = finalGrades.some(sem => sem.name === runningSemName);
      if (!exists) {
        finalGrades.push({ id: Date.now(), name: runningSemName, courses: [], isSynced: true });
      }
      
      finalGrades = finalGrades.map(sem => {
        if (sem.name === runningSemName) {
          const syncedCourses = timetableCoursesList.map(tc => {
            const fullName = `${tc.code} - ${tc.title}`;
            const existing = sem.courses?.find(c => c.name === fullName || c.name.startsWith(tc.code));
            return {
              id: existing?.id || tc.id || Date.now() + Math.random(),
              name: fullName,
              credits: parseInt(tc.credits) || 0,
              grade: '' // Clear/ensure empty grade for running semester
            };
          });
          return { ...sem, courses: syncedCourses, isSynced: true };
        }
        return sem;
      });
      
      finalGrades.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });
    }
    
    const fullBackup = {
      collegeEmail: currentUser?.email || '',
      profile: userProfile,
      notes: notes,
      customEvents: events,
      certificates: certificates,
      projects: projects,
      grades: finalGrades,
      timetableCourses: timetableCourses,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
      portal: "AcadX"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${userProfile.username || 'student'}_profile_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification('success', 'Backup Exported', 'All profile details, notes, calendar events, projects, and grades downloaded in JSON.');
  } catch (e) {
    console.error('JSON export failed:', e);
    alert('Failed to export profile details.');
  }
};

export const handleExportPDF = async (currentUser, userProfile, addNotification) => {
  if (!userProfile) return;
  try {
    const doc = new jsPDF();
    const profile = userProfile;
    const notes = JSON.parse(localStorage.getItem('student_notes') || '[]');
    const events = JSON.parse(localStorage.getItem('custom_events') || '[]');
    const certificates = JSON.parse(localStorage.getItem('student_certificates') || '[]');
    const projects = JSON.parse(localStorage.getItem('student_projects') || '[]');
    const rawGrades = JSON.parse(localStorage.getItem(`grades_${currentUser.uid}`) || '[]');

    // Reconcile/sync running semester courses from timetable to grades before export
    const runningSemName = profile.semester;
    let finalGrades = [...rawGrades];
    if (runningSemName) {
      const savedCoursesJSON = localStorage.getItem(`courses_${currentUser.uid}`);
      const timetableCoursesList = savedCoursesJSON ? JSON.parse(savedCoursesJSON) : (profile.selectedCourses || []);
      
      const exists = finalGrades.some(sem => sem.name === runningSemName);
      if (!exists) {
        finalGrades.push({ id: Date.now(), name: runningSemName, courses: [], isSynced: true });
      }
      
      finalGrades = finalGrades.map(sem => {
        if (sem.name === runningSemName) {
          const syncedCourses = timetableCoursesList.map(tc => {
            const fullName = `${tc.code} - ${tc.title}`;
            const existing = sem.courses?.find(c => c.name === fullName || c.name.startsWith(tc.code));
            return {
              id: existing?.id || tc.id || Date.now() + Math.random(),
              name: fullName,
              credits: parseInt(tc.credits) || 0,
              grade: '' // Clear/ensure empty grade for running semester
            };
          });
          return { ...sem, courses: syncedCourses, isSynced: true };
        }
        return sem;
      });
      
      finalGrades.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
        const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
        return numA - numB;
      });
    }

    // Load IITGN Logo
    let logoImg = null;
    try {
      logoImg = await loadImage('/IITGN-5.png');
    } catch (e) {
      console.warn('Failed to load IITGN logo:', e);
    }

    // Helper for page breaks
    let y = 45;
    const checkPageBreak = (heightNeeded) => {
      if (y + heightNeeded > 275) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Set styling variables - Premium White Header with Orange Saffron Top Accent Bar
    doc.setFillColor(255, 153, 51); // IITGN Orange Saffron
    doc.rect(0, 0, 210, 4, 'F');

    if (logoImg) {
      doc.addImage(logoImg, 'PNG', 15, 8, 22, 22);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text("Indian Institute of Technology Gandhinagar", 42, 16);
      
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(99, 102, 241); // Indigo
      doc.text("STUDENT PROFILE & ACADEMIC PORTFOLIO", 42, 22);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Academic Session: ${new Date().getFullYear()}-${new Date().getFullYear()+1}   |   Report Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 42, 27);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text("AcadX — Academic Profile Report", 15, 18);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 15, 25);
    }

    // Divider line
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(15, 33, 195, 33);

    const drawSectionHeader = (title, num) => {
      checkPageBreak(25);
      doc.setFillColor(241, 245, 249); // Slate 100 Background Pill
      doc.rect(15, y, 180, 8, 'F');
      doc.setFillColor(99, 102, 241); // Indigo Left Border Bar
      doc.rect(15, y, 3, 8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`${num}. ${title.toUpperCase()}`, 22, y + 5.8);
      y += 13;
    };

    // Helper to draw single-column row
    const drawLeftRow = (label, val, hasPhotoOpt) => {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 35, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 35, 7, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label, 18, y + 4.8);

      doc.setFillColor(255, 255, 255);
      doc.rect(50, y, hasPhotoOpt ? 105 : 145, 7, 'F');
      doc.rect(50, y, hasPhotoOpt ? 105 : 145, 7, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(String(val || 'N/A'), 53, y + 4.8);
      y += 7;
    };

    // Helper to draw full-width two-column rows
    const drawFullRow = (label1, val1, label2, val2) => {
      // Label 1
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 35, 7, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 35, 7, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label1, 18, y + 4.8);

      // Value 1
      doc.setFillColor(255, 255, 255);
      doc.rect(50, y, 55, 7, 'F');
      doc.rect(50, y, 55, 7, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(String(val1 || 'N/A'), 53, y + 4.8);

      // Label 2
      doc.setFillColor(248, 250, 252);
      doc.rect(105, y, 35, 7, 'F');
      doc.rect(105, y, 35, 7, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(label2, 108, y + 4.8);

      // Value 2
      doc.setFillColor(255, 255, 255);
      doc.rect(140, y, 55, 7, 'F');
      doc.rect(140, y, 55, 7, 'S');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(String(val2 || 'N/A'), 143, y + 4.8);

      y += 7;
    };

    // 1. STUDENT INFORMATION (with Profile Photo if available)
    drawSectionHeader("Student Information", "1");
    
    let hasPhoto = false;
    let photoY = y;
    if (profile.profilePhotoBase64) {
      try {
        doc.addImage(profile.profilePhotoBase64, 'PNG', 160, photoY, 35, 35);
        doc.setDrawColor(99, 102, 241);
        doc.setLineWidth(0.5);
        doc.rect(159.5, photoY - 0.5, 36, 36, 'S');
        hasPhoto = true;
      } catch (e) {
        console.warn('Failed to render profile photo in PDF:', e);
      }
    }

    drawLeftRow("Full Name", profile.name || `${profile.firstName || ''} ${profile.surname || ''}`.trim(), hasPhoto);
    drawLeftRow("Roll Number", profile.rollNumber, hasPhoto);
    drawLeftRow("College Email", currentUser?.email, hasPhoto);
    drawLeftRow("Programme", profile.programme, hasPhoto);
    drawLeftRow("Branch/Department", profile.branch, hasPhoto);

    if (hasPhoto && y < photoY + 35) {
      y = photoY + 35;
    }

    y += 2;
    checkPageBreak(30);
    drawFullRow("Admission Year", profile.yearOfAdmission, "Current Year", profile.currentYear);
    drawFullRow("Active Semester", profile.semester, "Cumulative GPA", profile.cgpa);
    drawFullRow("Minor Focus", profile.minor, "Hostel & Room", `${profile.hostelName || 'N/A'}, Room ${profile.roomNumber || 'N/A'}`);
    y += 4;

    // 2. CONTACT DETAILS
    drawSectionHeader("Contact & Connection Channels", "2");
    drawFullRow("Personal Contact", profile.phone, "Personal Email", profile.gmail);
    drawFullRow("GitHub Username", profile.github, "LinkedIn ID", profile.linkedin);
    
    doc.setFillColor(248, 250, 252);
    doc.rect(15, y, 35, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, y, 35, 7, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Instagram Handle", 18, y + 4.8);

    doc.setFillColor(255, 255, 255);
    doc.rect(50, y, 145, 7, 'F');
    doc.rect(50, y, 145, 7, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(String(profile.instagram || 'N/A'), 53, y + 4.8);
    y += 12;

    // 3. RUNNING SEMESTER & REGISTERED COURSES
    drawSectionHeader("Running Semester & Registered Courses", "3");

    const runningSemObj = finalGrades.find(sem => sem.name === runningSemName);
    if (!runningSemObj || !runningSemObj.courses || runningSemObj.courses.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No registered courses found for the running semester (sync via Timetable Generator).", 18, y);
      y += 10;
    } else {
      const totalSemCredits = runningSemObj.courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
      
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 8, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(15, y, 180, 8, 'S');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(99, 102, 241);
      doc.text(`${runningSemObj.name}`, 18, y + 5.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Courses Selected: ${runningSemObj.courses.length}   |   Total Registered Credits: ${totalSemCredits}   |   SPI: — (In Progress)`, 60, y + 5.5);
      y += 12;

      // Table Header
      doc.setFillColor(99, 102, 241); // Indigo
      doc.rect(15, y, 110, 7, 'F');
      doc.rect(125, y, 35, 7, 'F');
      doc.rect(160, y, 35, 7, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text("Course Details", 18, y + 4.8);
      doc.text("Credits", 130, y + 4.8);
      doc.text("Status", 165, y + 4.8);
      
      y += 7;

      runningSemObj.courses.forEach(course => {
        checkPageBreak(8);
        
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, y, 110, 7, 'F');
        doc.rect(15, y, 110, 7, 'S');
        doc.rect(125, y, 35, 7, 'F');
        doc.rect(125, y, 35, 7, 'S');
        doc.rect(160, y, 35, 7, 'F');
        doc.rect(160, y, 35, 7, 'S');
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(15, 23, 42);
        doc.text(course.name || 'Unnamed Course', 18, y + 4.8);
        
        doc.setFont('helvetica', 'bold');
        doc.text(String(course.credits || 0), 130, y + 4.8);
        
        doc.setTextColor(99, 102, 241);
        doc.text("In Progress", 165, y + 4.8);
        y += 7;
      });
      y += 6;
    }

    // 4. COMPLETED SEMESTERS & ACADEMIC SUMMARY
    drawSectionHeader("Completed Semesters & Academic Summary", "4");

    const completedSemObjs = finalGrades.filter(sem => sem.name !== runningSemName);
    if (completedSemObjs.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No completed semesters recorded (add and manage via Academics page).", 18, y);
      y += 10;
    } else {
      completedSemObjs.forEach(sem => {
        let totalPoints = 0, totalCredits = 0;
        sem.courses.forEach(c => {
          const gp = GRADE_POINTS[c.grade];
          if (gp !== null && gp !== undefined && c.credits > 0) {
            totalPoints += gp * parseFloat(c.credits);
            totalCredits += parseFloat(c.credits);
          }
        });
        const spi = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '—';
        
        const completedCredits = sem.courses.reduce((sum, c) => {
          const gp = GRADE_POINTS[c.grade];
          return (gp !== null && gp !== undefined && gp > 0) ? sum + parseFloat(c.credits) : sum;
        }, 0);

        const neededHeight = 15 + (sem.courses.length * 7) + 12;
        checkPageBreak(neededHeight);

        doc.setFillColor(241, 245, 249);
        doc.rect(15, y, 180, 8, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, y, 180, 8, 'S');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(sem.name, 18, y + 5.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Courses: ${sem.courses.length}   |   Credits Completed: ${completedCredits}   |   SPI: `, 60, y + 5.5);
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129); // Emerald for SPI
        doc.text(spi, 145, y + 5.5);
        y += 12;

        // Table Header
        doc.setFillColor(71, 85, 105); // Slate
        doc.rect(15, y, 110, 7, 'F');
        doc.rect(125, y, 35, 7, 'F');
        doc.rect(160, y, 35, 7, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.text("Course Name", 18, y + 4.8);
        doc.text("Credits", 130, y + 4.8);
        doc.text("Grade (GP)", 165, y + 4.8);
        y += 7;

        sem.courses.forEach(course => {
          checkPageBreak(8);
          
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(226, 232, 240);
          doc.rect(15, y, 110, 7, 'F');
          doc.rect(15, y, 110, 7, 'S');
          doc.rect(125, y, 35, 7, 'F');
          doc.rect(125, y, 35, 7, 'S');
          doc.rect(160, y, 35, 7, 'F');
          doc.rect(160, y, 35, 7, 'S');
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(15, 23, 42);
          doc.text(course.name || 'Unnamed Course', 18, y + 4.8);
          
          doc.setFont('helvetica', 'bold');
          doc.text(String(course.credits || 0), 130, y + 4.8);
          
          const gpVal = GRADE_POINTS[course.grade];
          const gpStr = gpVal !== null && gpVal !== undefined ? `GP: ${gpVal.toFixed(1)}` : 'GP: —';
          doc.text(`${course.grade || '—'} (${gpStr})`, 165, y + 4.8);
          y += 7;
        });
        y += 6;
      });
    }

    // 5. PROJECTS LIST
    drawSectionHeader("Academic & Personal Projects", "5");
    if (projects.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No projects tracked yet.", 18, y);
      y += 10;
    } else {
      projects.forEach(proj => {
        const desc = proj.description || '';
        const splitDesc = doc.splitTextToSize(desc, 172);
        const needed = 15 + splitDesc.length * 4.5;
        checkPageBreak(needed);

        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, needed - 5, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(15, y, 180, needed - 5, 'S');

        doc.setFillColor(99, 102, 241);
        doc.rect(15, y, 2, needed - 5, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${proj.title || 'Untitled Project'} (${proj.status || 'General'})`, 20, y + 5.5);
        
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Course/Area: ${proj.course || 'Independent'}`, 20, y + 9.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(splitDesc, 20, y + 14.5);

        y += needed;
      });
      y += 4;
    }

    // 6. CERTIFICATES LIST
    drawSectionHeader("Earned Certificates & Awards", "6");
    if (certificates.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No certificates recorded yet.", 18, y);
      y += 10;
    } else {
      certificates.forEach(cert => {
        checkPageBreak(25);
        
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, cert.link ? 18 : 13, 'F');
        doc.rect(15, y, 180, cert.link ? 18 : 13, 'S');
        doc.setFillColor(16, 185, 129); // Emerald
        doc.rect(15, y, 2, cert.link ? 18 : 13, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${cert.title || 'Untitled Certificate'}`, 20, y + 5.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`Issued by: ${cert.issuer || 'N/A'} on ${cert.date || 'N/A'}`, 20, y + 9.5);
        
        if (cert.link) {
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(99, 102, 241);
          doc.text(`Link: ${cert.link}`, 20, y + 14.5);
        }
        
        y += cert.link ? 23 : 18;
      });
      y += 4;
    }

    // 7. NOTES LIST
    drawSectionHeader("Student Notes Summary", "7");
    if (notes.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text("No notes saved.", 18, y);
      y += 10;
    } else {
      notes.slice(0, 15).forEach(note => {
        const contentStr = (note.content || '').replace(/\n/g, ' ');
        const splitPreview = doc.splitTextToSize(contentStr, 125);
        const needed = Math.max(12, splitPreview.length * 4.5 + 8);
        
        checkPageBreak(needed);
        
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, needed - 3, 'F');
        doc.rect(15, y, 180, needed - 3, 'S');
        doc.setFillColor(245, 158, 11); // Amber
        doc.rect(15, y, 2, needed - 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(30, 41, 59);
        doc.text(`${note.title || 'Untitled Note'} (${note.course || 'General'}):`, 20, y + 5.5);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        doc.text(splitPreview, 65, y + 5.5);
        
        y += needed;
      });
      y += 4;
    }

    // 8. DIGITAL IDENTITY CARD & MESS QR
    doc.addPage();
    y = 20;

    drawSectionHeader("Digital Identity Documents", "8");
    
    if (profile.messQrBase64) {
      try {
        checkPageBreak(65);
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 80, 60, 'F');
        doc.rect(15, y, 80, 60, 'S');
        
        doc.setFillColor(255, 153, 51); // saffron accent
        doc.rect(15, y, 80, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text("MESS QR CODE", 25, y + 8);
        
        doc.addImage(profile.messQrBase64, 'PNG', 30, y + 12, 50, 45);
      } catch (e) {
        console.warn('Failed to render Mess QR in PDF:', e);
      }
    }

    if (profile.studentIdBase64) {
      try {
        doc.setDrawColor(99, 102, 241);
        doc.setFillColor(248, 250, 252);
        doc.rect(105, y, 90, 60, 'F');
        doc.rect(105, y, 90, 60, 'S');
        
        doc.setFillColor(99, 102, 241); // indigo accent
        doc.rect(105, y, 90, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text("OFFICIAL STUDENT ID CARD", 115, y + 8);

        doc.addImage(profile.studentIdBase64, 'PNG', 110, y + 12, 80, 45);
      } catch (e) {
        console.warn('Failed to render Student ID in PDF:', e);
      }
    }
    y += 65;

    // Draw footer with page numbers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 282, 195, 282);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("IITGN AcadX — Academic & Profile Report", 15, 287);
      doc.text(`Page ${i} of ${totalPages}`, 180, 287);
    }

    // Save the PDF
    doc.save(`${profile.firstName || 'student'}_full_profile_report.pdf`);
    addNotification('success', 'Full Report Exported', 'A beautifully formatted PDF report has been generated and saved.');
  } catch (e) {
    console.error('PDF export error:', e);
    alert('Failed to generate PDF report.');
  }
};
