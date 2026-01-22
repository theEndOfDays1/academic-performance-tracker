import { levels } from './model/data.js'; // Model: data
import { saveToDisk, loadFromDisk, clearFromDisk, levelsHistory, manageLevelsHistory, undoLastAction, updateCourseData, updateGPA, getGPAColour, getPrevCourses, calculateDegree, resetApp, handleDownload } from './model/logic.js'; // Logic: functions



// View
function showNavigation(levels) {
  // We create a wrapper for the selects and a separate action area
  document.querySelector(".level-nav-block").innerHTML = `
    <div class="nav-controls">
      <select name="level-nav" id="level-nav" class="level-nav">
        ${levels.map((level, index) => `
          <option value="${level.level}" data-index="${index}">
              ${level.level} level
          </option>
        `).join("")}
      </select>
      <span class="secondary-nav-container"></span>
    </div>

    <button onclick="resetApp()" class="reset-btn" title="Reset all data">
      Reset
    </button>
  `;
};

function showCourseOptions(hasOptions, level) {
  const container = document.querySelector(".secondary-nav-container");

  // Clear the container first so options don't stack when switching levels
  container.innerHTML = "";

  if (hasOptions === "true") {
    container.innerHTML = `
      <select class="course-option-nav"> 
        ${level.courseOptions.map((courseOption, index) => {
      return `<option data-index="${index}" value="${courseOption.name}">${courseOption.name}</option>`;
    }).join("")}
      </select>
    `;
  }
};

function showCalculator(level) {
  document.querySelector(".calculator").innerHTML = `
    ${showScore(level.gpa)}

    <div class="show-semesters">
      ${showSemesters({ ...level.semesters, currentLevel: level.level })}
    </div>
  `;
};

function showScore(gpa = 0, type =  'gpa') {
  const colour = getGPAColour(gpa);
  const isGPA = type === 'gpa';
  const stats = calculateDegree();
  
  return `
    <div class="score-container sticky-top">
      <div class="gpa-switch">
        <input type="radio" id="gpa" name="gpa-type" value="gpa" ${isGPA ? 'checked' : ''}>
        <label for="gpa">GPA</label>

        <input type="radio" id="cgpa" name="gpa-type" value="cgpa" ${!isGPA ? 'checked' : ''}>
        <label for="cgpa">CGPA</label>
        
        <span class="glider"></span>
      </div>

      <h2 class="score fz-large" style="color: ${colour}">
        ${gpa.toFixed(2)}
      </h2>
      <div class="export">
        ${!isGPA ? `<h4 style="color: #a5a5a5ff; margin: 0;">${stats.standing}</h4>` : ''}
        <div class="controls">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="#a5a5a5ff"><path d="M17 2C17.5523 2 18 2.44772 18 3V7H21C21.5523 7 22 7.44772 22 8V18C22 18.5523 21.5523 19 21 19H18V21C18 21.5523 17.5523 22 17 22H7C6.44772 22 6 21.5523 6 21V19H3C2.44772 19 2 18.5523 2 18V8C2 7.44772 2.44772 7 3 7H6V3C6 2.44772 6.44772 2 7 2H17ZM16 17H8V20H16V17ZM20 9H4V17H6V16C6 15.4477 6.44772 15 7 15H17C17.5523 15 18 15.4477 18 16V17H20V9ZM8 10V12H5V10H8ZM16 4H8V7H16V4Z"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="26" height="26" fill="#a5a5a5ff"><path d="M3 19H21V21H3V19ZM13 13.1716L19.0711 7.1005L20.4853 8.51472L12 17L3.51472 8.51472L4.92893 7.1005L11 13.1716V2H13V13.1716Z"></path></svg>
        </div>
      </div>     
    </div>
  `;
};

function showSemesters({ currentLevel, ...semesters }) {
  return Object.entries(semesters)
    .map(([semester, { courses }]) => {
      const totalCourses = courses.filter(course => !course.isElective).length;
      const totalCredits = courses.reduce(
        (sum, course) => sum + course.creditUnit,
        0
      );
      const totalQPs = courses.reduce((sum, course) => sum + course.qp, 0);
      return `
        <div class="semester ${semester
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase()}" data-semester="${semester}">
          <div class="heading">
            <div class="flex semester-info">
              <div class="fw-bold semester-title">${semester
          .replace(/([A-Z])/g, " $1")
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase())}
        </div>
				
        ${currentLevel !== 100 ? `
          <div class="add-course">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="pointer" data-semester="${semester}" fill="var(--prm-clr)" width="24" height="24"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 11H7V13H11V17H13V13H17V11H13V7H11V11Z"></path></svg>
          </div>
          ` : ``}
            </div>
            <div class="highlights">
              <div class="fw-bold h-courses">
                <span> Courses 
                  <span class="h-totals h-t_courses">${totalCourses}</span>
                </span>
              </div>
              <div class="fw-bold h-grades">
                <span>Grades</span>
              </div>
              <div class="fw-bold h-credits">
                <span>Units 
                  <span class="h-totals h-t_credits">${totalCredits}</span>
                </span>
              </div>
              <div class="fw-bold h-points">
                <span>Points 
                  <span class="h-totals h-t_qps">${totalQPs}</span>
                </span>
              </div>
            </div>
          </div>
      
          <div class="courses">
            ${showCourses(courses)}
          </div>
      
          <!--<div class="totals">
            <div class="total-courses">${totalCourses}</div>
            <div class="total-credits">${totalCredits}</div>
            <div class="total-qps">${totalQPs}</div>
          </div>-->
        </div>
      `;
    })
    .join("");
};

function showCourses(courses) {
  return courses
    .filter(course => !course.isElective) 
    .map((course, index) => {
      return `
        <div class="course-deet" data-index="${index}">
          <div class="course">${course.courseCode}</div>
          <div class="input-grade">
            <input type="text" name="grade" id="grade" maxlength="1" class="fw-bold" autocomplete="off" value="${course.grade}"/>
          </div>
          <div class="credit-unit">${course.creditUnit}</div>
          <div class="qp">${course.qp}</div>
          <div class="more menu-trigger" title="More options">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="19" height="18" fill="#808080cf"><path d="M12 3C10.9 3 10 3.9 10 5C10 6.1 10.9 7 12 7C13.1 7 14 6.1 14 5C14 3.9 13.1 3 12 3ZM12 17C10.9 17 10 17.9 10 19C10 20.1 10.9 21 12 21C13.1 21 14 20.1 14 19C14 17.9 13.1 17 12 17ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z"></path></svg>
          </div>          
        </div>
      `;
    })
    .join("");
};

function updateCourseUI(rowElement, updatedCourse) {
  rowElement.querySelector(".qp").textContent = updatedCourse.qp;

  const semesterEl = rowElement.closest(".semester");

  const allQpElements = semesterEl.querySelectorAll(".qp");
  const allCreditElements = semesterEl.querySelectorAll(".credit-unit");

  let totalQPs = 0;
  allQpElements.forEach((el) => (totalQPs += parseFloat(el.textContent) || 0));

  let totalCredits = 0;
  allCreditElements.forEach((el) => (totalCredits += parseFloat(el.textContent) || 0));

  semesterEl.querySelector(".h-t_qps").textContent = totalQPs;
  semesterEl.querySelector(".h-t_credits").textContent = totalCredits;

  updateGPADisplay();
};

function updateGPADisplay() {
  const lIdx = document.querySelector(".level-nav")?.selectedIndex || 0;
  const oIdx = document.querySelector(".course-option-nav")?.selectedIndex || 0;

  // Always update the underlying data for the current level
  const currentGPA = updateGPA(lIdx, oIdx);
  
  // Check which mode the user is currently looking at
  const activeToggle = document.querySelector('input[name="gpa-type"]:checked')?.value;
  const display = document.querySelector(".score");
  const exportH4 = document.querySelector(".export h4");

  if (display) {
    if (activeToggle === 'cgpa') {
      const stats = calculateDegree();
      display.textContent = stats.cgpa.toFixed(2);
      display.style.color = getGPAColour(stats.cgpa);
      if (exportH4) {
        exportH4.textContent = stats.standing;
        exportH4.style.display = 'block';
      }
    } else {
      display.textContent = currentGPA.toFixed(2);
      display.style.color = getGPAColour(currentGPA);
      if (exportH4) exportH4.style.display = 'none';
    }
  }
};

function showModal(modalContent) {
  return `
    <div class="modal">
      <dialog class="card">
        <div class="close-modal">
          <!-- &times; -->
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path></svg>
        </div>
        ${modalContent}
      </dialog>
    </div>
  `;
};

function closeModal() {
  const modal = document.querySelector('.modal');
  modal?.remove();
};

function showPrevCourses({ prevLevels, prevSemesters }, targetLevelIdx, targetSemester) {
  // 1. The Memory (State)
  let selectedCodes = [];
  let activeIndex = 0;

  // 2. The Course Renderer (Helper)
  const renderCourses = (index) => {
    return prevSemesters[index].courses.map((course) => {
      const isChecked = selectedCodes.includes(course.courseCode) ? 'checked' : '';
      return `
        <label class="prev-course-deet">
          <input type="checkbox" name="${course.courseCode}" ${isChecked}>
          <span class="code">${course.courseCode}</span>
          <span class="credit">${course.creditUnit}</span>
        </label>
      `;
    }).join('');
  };

  // 3. The HTML Template (Defined BEFORE it is used)
  const prevCoursesHTML = `
    <div class="nav-level">
      ${prevSemesters.map((prevSemester, index) => {
    const activeClass = index === activeIndex ? 'active' : '';
    return `<a href="#" class="fw-bold nav-link ${activeClass}" data-index="${index}">${prevSemester.level} Level</a>`;
  }).join('')}
    </div>
    <div class="prev-courses">
      ${renderCourses(activeIndex)}
    </div>
    <div class="cta-block">
      <a href="#" class="cta-btn" id="confirm-add-courses" 
         data-level-idx="${targetLevelIdx}" 
         data-semester="${targetSemester}">Confirm</a>
    </div>
  `;

  // 4. Setup Event Listeners after the Modal hits the DOM
  setTimeout(() => {
    const modal = document.querySelector('.modal');
    if (!modal) return;

    // Track selections in the memory array
    modal.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        const code = e.target.name;
        if (e.target.checked) {
          if (!selectedCodes.includes(code)) selectedCodes.push(code);
        } else {
          selectedCodes = selectedCodes.filter(c => c !== code);
        }
      }
    });

    // Handle Tab Switching
    modal.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        activeIndex = parseInt(e.target.dataset.index);

        modal.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');

        modal.querySelector('.prev-courses').innerHTML = renderCourses(activeIndex);
      });
    });

    // HANDLE CONFIRM (The proper way, passing our memory array)
    modal.querySelector('#confirm-add-courses').addEventListener('click', (e) => {
      e.preventDefault();
      // Now we pass the memory array 'selectedCodes' to our logic!
      confirmSelection(targetLevelIdx, targetSemester, selectedCodes);
    });

  }, 0);

  // 5. Finally, return the modal with the HTML we defined in step 3
  return showModal(prevCoursesHTML);
};

function showCourseMenu() {
  return `
    <div class="active-popup-menu">
      <div class="menu-item about">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
        </svg>
        <span>About</span>
      </div>
      <div class="menu-item remove">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
        </svg>
        <span>Remove</span>
      </div>
    </div>
  `;
};

function showUndoToast(message) {
  document.querySelector('.undo-toast')?.remove();

  const toastHTML = `
    <div class="undo-toast">
      <span>${message}</span>
      <button class="undo-btn">UNDO</button>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', toastHTML);

  // Auto-remove after 6 seconds
  setTimeout(() => {
    document.querySelector('.undo-toast')?.classList.add('fade-out');
    setTimeout(() => document.querySelector('.undo-toast')?.remove(), 500);
  }, 6000);
};

function aboutCourse(course) {
  return `
    <h4>${course.courseCode}</h4>
    <h2>${course.courseTitle || 'Course Details'}</h2>
    <p>${course.description || 'No description available for this course yet.'}</p>
    <div> 
      <a href="${course.link || '#'}" target="_blank" class="cta-btn">Learn More</a>
    </div>
  `;
};

function handlePrint() {
  const scoreArea = document.querySelector('.score-container').innerHTML;
  const tableArea = document.querySelector('.show-semesters').innerHTML;
  
  // 2. Open a temporary window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
      <html>
        <head>
          <title>GPA Report</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            .score { font-size: 32px; font-weight: bold; text-align: center; }
            .semester { margin-bottom: 30px; border-bottom: 1px solid #eee; }
            .course-deet { display: flex; justify-content: space-between; padding: 5px 0; }
            .gpa-switch, .controls, .add-course, .menu-trigger { display: none !important; }
          </style>
        </head>
        <body>
          ${scoreArea}
          ${tableArea}
        </body>
      </html>
  `);
  printWindow.document.close();
  printWindow.print();
};



// Controller
function runDefault() {
  loadFromDisk();
  showNavigation(levels);
  showCalculator(levels[0]);

  runChanges();
};

function runChanges() {
  document.body.addEventListener("change", (e) => {
    if (e.target.className === "level-nav") {

      document.querySelector(".course-option-nav")?.remove();

      const index = e.target.selectedIndex;
      const level = levels[index];
      const hasOptions = level.courseOptions ? "true" : "false";

      showCourseOptions(hasOptions, level);

      if (hasOptions === "true") {
        const lastActive = level.activeOptionIndex || 0;

        const optNav = document.querySelector(".course-option-nav");
        if (optNav) optNav.selectedIndex = lastActive;

        showCalculator(level.courseOptions[lastActive]);
      } else {
        showCalculator(level);
      }

      updateGPADisplay();
    } else if (e.target.className === "course-option-nav") {
      const levelIndex = document.querySelector(".level-nav").selectedIndex;
      const level = levels[levelIndex];

      const selectedIndex = e.target.selectedIndex;
      level.activeOptionIndex = selectedIndex; 

      saveToDisk(); 

      const courseOption = level.courseOptions[selectedIndex];
      showCalculator(courseOption);
      updateGPADisplay(); 
    }

    if (e.target.name === "gpa-type") {
      const isCGPA = e.target.value === "cgpa";
      
      // 1. Get the current Level and Option indexes
      const lIdx = document.querySelector(".level-nav").selectedIndex;
      const oIdx = document.querySelector(".course-option-nav")?.selectedIndex || 0;
      
      // 2. Calculate both possible values
      const currentLevelGPA = updateGPA(lIdx, oIdx);
      const gradStats = calculateDegree();
      
      // 3. Target the UI elements
      const scoreDisplay = document.querySelector(".score");
      const exportArea = document.querySelector(".export");
      
      // 4. Update the View based on selection
      if (isCGPA) {
        scoreDisplay.textContent = gradStats.cgpa.toFixed(2);
        scoreDisplay.style.color = getGPAColour(gradStats.cgpa);
        
        if (!exportArea.querySelector('h4')) {
          exportArea.insertAdjacentHTML('afterbegin', 
            `<h4 style="color: #a5a5a5ff; margin: 0;">${gradStats.standing}</h4>`
          );
        } else {
          exportArea.querySelector('h4').textContent = gradStats.standing;
          exportArea.querySelector('h4').style.display = 'block';
        }
      } else {
        scoreDisplay.textContent = currentLevelGPA.toFixed(2);
        scoreDisplay.style.color = getGPAColour(currentLevelGPA);
        
        const standingLabel = exportArea.querySelector('h4');
        if (standingLabel) standingLabel.style.display = 'none';
      }
    }
  });

  //Add carry over courses to the current level semester.
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('.close-modal') || e.target.classList.contains('modal')) {
      closeModal();
    };

    if (e.target.id === 'confirm-add-courses') {
      e.preventDefault();

      const targetLevelIdx = e.target.dataset.levelIdx;
      const targetSemester = e.target.dataset.semester;

      confirmSelection(targetLevelIdx, targetSemester);
    };

    const trigger = e.target.closest('.menu-trigger');

    const existingMenu = document.querySelector('.active-popup-menu');
    existingMenu?.remove();

    if (trigger) {
      e.stopPropagation();

      // 1. Get references
      const row = trigger.closest('.course-deet');
      const courseIdx = row.dataset.index;
      const semesterContainer = row.closest('.semester');
      const semesterName = semesterContainer.dataset.semester;

      // 2. Create and Inject Menu
      const menuHTML = showCourseMenu();

      document.body.insertAdjacentHTML('beforeend', menuHTML);
      const menu = document.querySelector('.active-popup-menu');

      menu.addEventListener('click', (e) => {
        const item = e.target.closest('.menu-item');
        if (!item) return;

        // Get common data needed for both actions
        const lIdx = document.querySelector(".level-nav").selectedIndex;
        const level = levels[lIdx];
        const oIdx = document.querySelector(".course-option-nav")?.selectedIndex || 0;
        const source = level.courseOptions ? level.courseOptions[oIdx] : level;
        const course = source.semesters[semesterName].courses[courseIdx];

        if (item.classList.contains('about')) {
          document.body.insertAdjacentHTML('beforeend', showModal(aboutCourse(course)));
          menu.remove();
        }

        if (item.classList.contains('remove')) {
          // levelsHistory = JSON.parse(JSON.stringify(levels));
          manageLevelsHistory();
          source.semesters[semesterName].courses.splice(courseIdx, 1);

          saveToDisk();
          menu.remove();
          showCalculator(source);
          updateGPADisplay();
          showUndoToast("Course removed");


          const undoBtn = document.querySelector('.undo-btn');
          if (undoBtn) {
            undoBtn.onclick = () => {
              const success = undoLastAction(); 
              
              if (success) {
                const lIdx = document.querySelector(".level-nav")?.selectedIndex || 0;
                const oIdx = document.querySelector(".course-option-nav")?.selectedIndex || 0;
                const level = levels[lIdx];
                const source = level.courseOptions ? level.courseOptions[oIdx] : level;

                showCalculator(source);
                updateGPADisplay();
                document.querySelector('.undo-toast')?.remove();
              }
            };
          };
        }
      });

      // Smart Positioning of the menu based on viewport
      const rect = trigger.getBoundingClientRect();
      const scrollY = window.scrollY;
      const menuHeight = 90; 

      const nextHeader = semesterContainer.nextElementSibling;
      const boundary = nextHeader ? nextHeader.getBoundingClientRect().top : window.innerHeight;

      let topPosition = rect.bottom + scrollY;
      if (rect.bottom + menuHeight > boundary) {
        topPosition = rect.top + scrollY - menuHeight;
        menu.classList.add('pop-up'); 
      }

      const menuWidth = 170;
      const padding = 10;
      const viewportWidth = window.innerWidth;

      let leftPosition = rect.right - menuWidth;

      if (leftPosition < padding) {
        leftPosition = padding;
      }

      if (leftPosition + menuWidth > viewportWidth - padding) {
        leftPosition = viewportWidth - menuWidth - padding;
      }

      Object.assign(menu.style, {
        top: `${topPosition}px`,
        left: `${leftPosition}px`,
        width: `${menuWidth}px`
      });
    };

    const controls = e.target.closest('.controls svg');
    if (!controls) return;

    const isPrint = controls.querySelector('path[d^="M17 2"]'); 
    const isDownload = controls.querySelector('path[d^="M3 19"]'); 

    if (isPrint) handlePrint();
    if (isDownload) handleDownload();
  });


  document.querySelector('.calculator').addEventListener('click', (e) => {
    const addCourseBtn = e.target.closest('.add-course svg');
    if (!addCourseBtn) return;

    const levelNav = document.querySelector(".level-nav");
    const levelIndex = levelNav.selectedIndex;
    const semester = addCourseBtn.dataset.semester;

    const prevData = getPrevCourses(levelIndex, semester);

    document.body.insertAdjacentHTML('beforeend', showPrevCourses(prevData, levelIndex, semester));
  });


  calculate();
};

function confirmSelection(levelIdx, semester) {
  const selectedBoxes = document.querySelectorAll('.prev-course-deet input:checked');
  const currentLevel = levels[levelIdx];
  const optIdx = document.querySelector(".course-option-nav")?.selectedIndex || 0;

  const targetSource = currentLevel.courseOptions ? currentLevel.courseOptions[optIdx] : currentLevel;
  const targetSemester = targetSource.semesters[semester];

  const maxLimit = targetSemester.creditLoad || targetSource.creditLoad || 24;

  let currentUnits = targetSemester.courses.reduce((sum, c) => sum + c.creditUnit, 0);

  selectedBoxes.forEach(box => {
    const courseCode = box.name;
    const isDuplicate = targetSemester.courses.some(c => c.courseCode === courseCode);

    if (isDuplicate) return;

    let original;
    levels.forEach(lvl => {
      let searchArea = [];
      if (lvl.semesters) {
        searchArea = [...lvl.semesters.firstSemester.courses, ...lvl.semesters.secondSemester.courses];
      } else if (lvl.courseOptions) {
        lvl.courseOptions.forEach(opt => {
          searchArea.push(...opt.semesters.firstSemester.courses, ...opt.semesters.secondSemester.courses);
        });
      }
      const found = searchArea.find(c => c.courseCode === courseCode);
      if (found) original = found;
    });

    if (original) {
      if (currentUnits + original.creditUnit <= maxLimit) {
        const cloned = { ...original, grade: '', qp: 0 }; // Reset grade/qp for the new semester
        targetSemester.courses.push(cloned);
        currentUnits += original.creditUnit;
      } else {
        alert(`Limit reached! Semester capacity is ${maxLimit} units.`);
      }
    }
  });

  saveToDisk();
  showCalculator(targetSource);
  closeModal();
};

function calculate() {
  const calculator = document.querySelector(".calculator");

  calculator.addEventListener("keydown", (e) => {
    if (e.target.name !== "grade") return;

    const allInputs = Array.from(document.querySelectorAll('input[name="grade"]'));
    const currentIndex = allInputs.indexOf(e.target);

    if (e.key === "Backspace" && e.target.value === "" && currentIndex > 0) {
      e.preventDefault();

      const prevInput = allInputs[currentIndex - 1];

      prevInput.value = "";
      prevInput.scrollIntoView({ behavior: "smooth", block: "center" });

      prevInput.focus();

      const row = prevInput.closest(".course-deet");
      const path = {
        levelIdx: document.querySelector(".level-nav").selectedIndex,
        optionIdx: document.querySelector(".course-option-nav")?.selectedIndex,
        semester: prevInput.closest("[data-semester]").dataset.semester,
        courseIdx: row.dataset.index,
      };
      updateCourseUI(row, updateCourseData(path, ""));
      saveToDisk();
    }
  });

  calculator.addEventListener("input", (e) => {
    if (e.target.name !== "grade") return;

    const input = e.target;
    // 1. Clean the data (happens after character is in the box)
    input.value = input.value.toUpperCase().replace(/[^A-F]/g, "");

    // 2. Your Path/UI Logic
    const row = input.closest(".course-deet");
    const path = {
      levelIdx: document.querySelector(".level-nav").selectedIndex,
      optionIdx: document.querySelector(".course-option-nav")?.selectedIndex,
      semester: input.closest("[data-semester]").dataset.semester,
      courseIdx: row.dataset.index,
    };
    updateCourseUI(row, updateCourseData(path, input.value));
    updateGPA(path.levelIdx, path.optionIdx);

    saveToDisk();


    // 3. Jump Forward
    const allInputs = Array.from(document.querySelectorAll('input[name="grade"]'));
    const currentIndex = allInputs.indexOf(input);

    if (input.value && currentIndex < allInputs.length - 1) {
      allInputs[currentIndex + 1].focus();
      allInputs[currentIndex + 1].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
};

window.resetApp = resetApp;
window.clearFromDisk = clearFromDisk;
runDefault();
