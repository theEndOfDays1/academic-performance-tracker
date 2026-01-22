import { levels } from './data.js';

export let levelsHistory = null;

export function manageLevelsHistory(){
  levelsHistory = JSON.parse(JSON.stringify(levels));
};

export function saveToDisk() {
  localStorage.setItem('cgpa_data', JSON.stringify(levels));
};

export function loadFromDisk() {
  const saved = localStorage.getItem('cgpa_data');
  if (saved) {
    const parsedData = JSON.parse(saved);
    levels.length = 0; 
    levels.push(...parsedData); 
  }
};

export function clearFromDisk() {
  localStorage.removeItem('cgpa_data');
  location.reload();
};

export function undoLastAction() {
  if (!levelsHistory) return false; // Return false if nothing happened

  levels.length = 0; 
  levels.push(...levelsHistory);
  levelsHistory = null;
  saveToDisk();

  return true; 
};

export function updateCourseData(path, grade) {
  const { levelIdx, optionIdx, semester, courseIdx } = path;

  const dataSource =
    optionIdx !== undefined
      ? levels[levelIdx].courseOptions[optionIdx]
      : levels[levelIdx];

  const course = dataSource.semesters[semester].courses[courseIdx];

  // Update the data
  course.grade = grade.toUpperCase();
  course.qp =
    ({ A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }[grade] || 0) *
    course.creditUnit;

  return course;
};

export function updateGPA(levelIndex = 0, optionIndex = 0) {
  const isOptionLevel = levels[levelIndex].courseOptions !== undefined;

  const dataSource = isOptionLevel
    ? levels[levelIndex].courseOptions[optionIndex]
    : levels[levelIndex];

  const levelCourses = [
    ...dataSource.semesters.firstSemester.courses,
    ...dataSource.semesters.secondSemester.courses
  ];

  let tqp = 0, tcu = 0;
  levelCourses.forEach(({ creditUnit, grade, qp }) => {
    if (grade !== '') {
      tqp += qp;
      tcu += creditUnit;
    }
  });

  // 2. Save the GPA back to the dataSource so the UI can find it
  dataSource.gpa = tcu > 0 ? (tqp / tcu) : 0;

  return dataSource.gpa;
}

export function getGPAColour(gpa) {
  const colors = {
    low: { r: 205, g: 92, b: 92, a: 0.75 }, 
    middle: { r: 238, g: 170, b: 80, a: 0.75 },
    high: { r: 100, g: 170, b: 100, a: 0.75 },
  };

  let r, g, b;

  if (gpa <= 2.5) {
    const ratio = gpa / 2.5;
    r = colors.low.r + ratio * (colors.middle.r - colors.low.r);
    g = colors.low.g + ratio * (colors.middle.g - colors.low.g);
    b = colors.low.b + ratio * (colors.middle.b - colors.low.b);
  } else {
    const ratio = (gpa - 2.5) / 2.5;
    r = colors.middle.r + ratio * (colors.high.r - colors.middle.r);
    g = colors.middle.g + ratio * (colors.high.g - colors.middle.g);
    b = colors.middle.b + ratio * (colors.high.b - colors.middle.b);
  }

  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.75)`;
}

export function getPrevCourses(levelIndex = 1, semester = 'firstSemester') {
  const prevLevels = levels.slice(0, levelIndex);
  const prevSemesters = [];


  prevLevels.forEach((prevLevel, index) => {
    prevSemesters.push(
      {
        level: prevLevel.level,
        semester,
        courses: prevLevel.semesters[semester].courses,
      }
    );
  });

  return { prevLevels, prevSemesters };
};

export function calculateDegree() {
  let totalQP = 0;
  let totalCU = 0;

  levels.forEach(level => {
    // Determine the source based on the stored activeOptionIndex
    const source = level.courseOptions
      ? level.courseOptions[level.activeOptionIndex || 0]
      : level;

    const semesters = [source.semesters.firstSemester, source.semesters.secondSemester];

    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        if (course.grade !== "" && course.grade !== null) {
          totalQP += course.qp;
          totalCU += course.creditUnit;
        }
      });
    });
  });

  const cgpa = totalCU > 0 ? (totalQP / totalCU) : 0;

  let standing = "Fail";
  if (cgpa >= 4.5) standing = "1st Class";
  else if (cgpa >= 3.5) standing = "2nd Class Upper (2:1)";
  else if (cgpa >= 2.4) standing = "2nd Class Lower (2:2)";
  else if (cgpa >= 1.5) standing = "3rd Class";
  else if (cgpa >= 1.0) standing = "Pass";

  return { cgpa, totalCU, totalQP, standing };
}

export function resetApp() {
  if (confirm("Are you sure? This will delete all your grades and custom courses!")) {
    localStorage.removeItem('cgpa_data'); 
    location.reload(); 
  };
};

export function handleDownload() {
  const element = document.querySelector('.calculator');
  
  const opt = {
    margin:       10,
    filename:     'Academic_Performance_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // New Promise-based usage:
  html2pdf().set(opt).from(element).save();
};
