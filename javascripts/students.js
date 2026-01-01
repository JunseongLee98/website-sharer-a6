/**
 * Student Grouping JavaScript
 * Handles the frontend logic for managing students and creating balanced groups
 */

// Global variable to store parsed CSV data
let parsedCSVData = null;

// Initialize the page
async function init() {
    console.log('Student Grouping page initialized');
    await loadStudents();
}

// Load all students from the database
async function loadStudents() {
    try {
        const response = await fetchJSON(`/api/${apiVersion}/students`);

        if (response.status === 'success') {
            displayStudents(response.data);
        } else {
            showError('Failed to load students');
        }
    } catch (error) {
        console.error('Error loading students:', error);
        showError('Error loading students. See console for details.');
    }
}

// Display students in the list
function displayStudents(students) {
    const studentsList = document.getElementById('studentsList');
    const studentCount = document.getElementById('studentCount');

    if (!students || students.length === 0) {
        studentsList.innerHTML = '<p class="text-muted">No students added yet. Add your first student above!</p>';
        studentCount.textContent = '0';
        return;
    }

    // Count students by class year
    const counts = {
        freshman: 0,
        sophomore: 0,
        junior: 0,
        senior: 0
    };

    students.forEach(student => {
        counts[student.classYear] = (counts[student.classYear] || 0) + 1;
    });

    // Display summary
    const summary = `
        <div class="alert alert-info mb-3">
            <strong>Class Distribution:</strong>
            <span class="ms-3">Freshmen: ${counts.freshman}</span>
            <span class="ms-3">Sophomores: ${counts.sophomore}</span>
            <span class="ms-3">Juniors: ${counts.junior}</span>
            <span class="ms-3">Seniors: ${counts.senior}</span>
        </div>
    `;

    // Display student cards
    const studentsHtml = students.map(student => `
        <div class="student-card">
            <div class="student-info">
                <strong>${escapeHTML(student.name)}</strong>
                <span class="class-badge ${student.classYear}">${student.classYear.toUpperCase()}</span>
                ${student.email ? `<br><small class="text-muted">${escapeHTML(student.email)}</small>` : ''}
                ${student.studentId ? `<small class="text-muted ms-2">ID: ${escapeHTML(student.studentId)}</small>` : ''}
            </div>
            <button class="btn btn-sm btn-danger" onclick="deleteStudent('${student._id}')">Delete</button>
        </div>
    `).join('');

    studentsList.innerHTML = summary + studentsHtml;
    studentCount.textContent = students.length;
}

// Add a new student
async function addStudent() {
    const name = document.getElementById('nameInput').value.trim();
    const classYear = document.getElementById('classYearSelect').value;
    const email = document.getElementById('emailInput').value.trim();
    const studentId = document.getElementById('studentIdInput').value.trim();

    // Validation
    if (!name) {
        showError('Student name is required');
        return;
    }

    if (!classYear) {
        showError('Class year is required');
        return;
    }

    try {
        const response = await fetchJSON(`/api/${apiVersion}/students`, {
            method: 'POST',
            body: {
                name,
                classYear,
                email,
                studentId
            }
        });

        if (response.status === 'success') {
            showSuccess(`Student ${name} added successfully!`);
            clearForm();
            await loadStudents();
        } else {
            showError('Failed to add student');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        showError('Error adding student. See console for details.');
    }
}

// Delete a student
async function deleteStudent(studentId) {
    if (!confirm('Are you sure you want to delete this student?')) {
        return;
    }

    try {
        const response = await fetchJSON(`/api/${apiVersion}/students/${studentId}`, {
            method: 'DELETE'
        });

        if (response.status === 'success') {
            showSuccess('Student deleted successfully');
            await loadStudents();
        } else {
            showError('Failed to delete student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        showError('Error deleting student. See console for details.');
    }
}

// Delete all students
async function deleteAllStudents() {
    if (!confirm('Are you sure you want to delete ALL students? This cannot be undone!')) {
        return;
    }

    try {
        const response = await fetchJSON(`/api/${apiVersion}/students`, {
            method: 'DELETE'
        });

        if (response.status === 'success') {
            showSuccess(`Deleted ${response.data.deletedCount} students`);
            await loadStudents();
        } else {
            showError('Failed to delete students');
        }
    } catch (error) {
        console.error('Error deleting students:', error);
        showError('Error deleting students. See console for details.');
    }
}

// Create balanced groups
async function createGroups() {
    const numGroups = parseInt(document.getElementById('numGroupsInput').value);

    if (!numGroups || numGroups < 1) {
        showError('Number of groups must be at least 1');
        return;
    }

    try {
        const response = await fetchJSON(`/api/${apiVersion}/students/group`, {
            method: 'POST',
            body: {
                numGroups
            }
        });

        if (response.status === 'success') {
            displayGroups(response.data);
            showSuccess('Groups created successfully!');
        } else {
            showError('Failed to create groups: ' + (response.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error creating groups:', error);
        showError('Error creating groups. ' + error.message);
    }
}

// Display the generated groups
function displayGroups(data) {
    const { groups, statistics, balance } = data;

    const groupsSection = document.getElementById('groupsSection');
    const groupsStats = document.getElementById('groupsStats');
    const groupsDisplay = document.getElementById('groupsDisplay');

    // Show the groups section
    groupsSection.classList.remove('d-none');

    // Display statistics
    const balanceMessage = balance.isBalanced
        ? '✓ Groups are well balanced!'
        : `⚠ Group sizes vary (${balance.minGroupSize} to ${balance.maxGroupSize} students)`;

    groupsStats.innerHTML = `
        <strong>Statistics:</strong><br>
        Total Students: ${statistics.totalStudents}<br>
        Total Groups: ${statistics.totalGroups}<br>
        Balance: ${balanceMessage}<br>
        Group Sizes: ${balance.groupSizes.join(', ')} students
    `;

    // Display each group
    const groupsHtml = groups.map((group, index) => {
        // Count class years in this group
        const yearCounts = {
            freshman: 0,
            sophomore: 0,
            junior: 0,
            senior: 0
        };

        group.forEach(student => {
            yearCounts[student.classYear] = (yearCounts[student.classYear] || 0) + 1;
        });

        const studentsHtml = group.map(student => `
            <div class="student-card" style="background-color: white;">
                <div class="student-info">
                    <strong>${escapeHTML(student.name)}</strong>
                    <span class="class-badge ${student.classYear}">${student.classYear.toUpperCase()}</span>
                    ${student.email ? `<br><small class="text-muted">${escapeHTML(student.email)}</small>` : ''}
                </div>
            </div>
        `).join('');

        return `
            <div class="group-container">
                <div class="group-header">Group ${index + 1} (${group.length} students)</div>
                <div class="group-stats">
                    Freshmen: ${yearCounts.freshman} |
                    Sophomores: ${yearCounts.sophomore} |
                    Juniors: ${yearCounts.junior} |
                    Seniors: ${yearCounts.senior}
                </div>
                <div class="mt-2">
                    ${studentsHtml}
                </div>
            </div>
        `;
    }).join('');

    groupsDisplay.innerHTML = groupsHtml;

    // Scroll to groups section
    groupsSection.scrollIntoView({ behavior: 'smooth' });
}

// Clear the add student form
function clearForm() {
    document.getElementById('nameInput').value = '';
    document.getElementById('classYearSelect').value = '';
    document.getElementById('emailInput').value = '';
    document.getElementById('studentIdInput').value = '';
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorInfo');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');

    setTimeout(() => {
        errorDiv.classList.add('d-none');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.getElementById('successInfo');
    successDiv.textContent = message;
    successDiv.classList.remove('d-none');

    setTimeout(() => {
        successDiv.classList.add('d-none');
    }, 3000);
}

// CSV Import Functions

// Handle CSV file selection
function handleCSVFileSelect(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.name.endsWith('.csv')) {
        showError('Please select a CSV file');
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        try {
            parsedCSVData = parseCSV(content);
            displayCSVPreview(parsedCSVData);
            document.getElementById('importBtn').disabled = false;
        } catch (error) {
            showError('Error parsing CSV: ' + error.message);
            parsedCSVData = null;
            document.getElementById('importBtn').disabled = true;
        }
    };

    reader.onerror = function() {
        showError('Error reading file');
        parsedCSVData = null;
        document.getElementById('importBtn').disabled = true;
    };

    reader.readAsText(file);
}

// Parse CSV content
function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Validate required columns
    if (!header.includes('name') || !header.includes('classyear')) {
        throw new Error('CSV must have "name" and "classYear" columns');
    }

    const nameIndex = header.indexOf('name');
    const classYearIndex = header.indexOf('classyear');
    const emailIndex = header.indexOf('email');
    const studentIdIndex = header.indexOf('studentid');

    // Parse data rows
    const students = [];
    const validYears = ['freshman', 'sophomore', 'junior', 'senior'];

    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());

        if (values.length < 2) {
            continue;
        }

        const name = values[nameIndex];
        const classYear = values[classYearIndex]?.toLowerCase();

        if (!name) {
            throw new Error(`Row ${i + 1}: Name is required`);
        }

        if (!classYear || !validYears.includes(classYear)) {
            throw new Error(`Row ${i + 1}: Invalid class year "${classYear}". Must be: freshman, sophomore, junior, or senior`);
        }

        const student = {
            name,
            classYear,
            email: emailIndex >= 0 ? values[emailIndex] : '',
            studentId: studentIdIndex >= 0 ? values[studentIdIndex] : ''
        };

        students.push(student);
    }

    if (students.length === 0) {
        throw new Error('No valid student data found in CSV');
    }

    return students;
}

// Display CSV preview
function displayCSVPreview(students) {
    const previewDiv = document.getElementById('csvPreview');
    const previewContent = document.getElementById('csvPreviewContent');
    const previewCount = document.getElementById('csvPreviewCount');

    previewDiv.classList.remove('d-none');

    // Count by class year
    const counts = {
        freshman: 0,
        sophomore: 0,
        junior: 0,
        senior: 0
    };

    students.forEach(student => {
        counts[student.classYear] = (counts[student.classYear] || 0) + 1;
    });

    const previewHtml = students.slice(0, 10).map(student => `
        <div class="mb-1">
            <strong>${escapeHTML(student.name)}</strong> -
            <span class="class-badge ${student.classYear}">${student.classYear.toUpperCase()}</span>
            ${student.email ? `<small class="text-muted ms-2">${escapeHTML(student.email)}</small>` : ''}
        </div>
    `).join('');

    previewContent.innerHTML = previewHtml;

    if (students.length > 10) {
        previewContent.innerHTML += '<div class="mt-2 text-muted">...and ' + (students.length - 10) + ' more</div>';
    }

    previewCount.textContent = `Total: ${students.length} students (Freshmen: ${counts.freshman}, Sophomores: ${counts.sophomore}, Juniors: ${counts.junior}, Seniors: ${counts.senior})`;
}

// Import students from parsed CSV data
async function importStudentsFromCSV() {
    if (!parsedCSVData || parsedCSVData.length === 0) {
        showError('No CSV data to import');
        return;
    }

    const importBtn = document.getElementById('importBtn');
    importBtn.disabled = true;
    importBtn.textContent = 'Importing...';

    try {
        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (const student of parsedCSVData) {
            try {
                const response = await fetchJSON(`/api/${apiVersion}/students`, {
                    method: 'POST',
                    body: student
                });

                if (response.status === 'success') {
                    successCount++;
                } else {
                    failCount++;
                    errors.push(`${student.name}: ${response.error || 'Unknown error'}`);
                }
            } catch (error) {
                failCount++;
                errors.push(`${student.name}: ${error.message}`);
            }
        }

        if (failCount > 0) {
            showError(`Imported ${successCount} students, ${failCount} failed. Check console for details.`);
            console.error('Import errors:', errors);
        } else {
            showSuccess(`Successfully imported ${successCount} students!`);
        }

        await loadStudents();

        document.getElementById('csvFileInput').value = '';
        document.getElementById('csvPreview').classList.add('d-none');
        parsedCSVData = null;

    } catch (error) {
        console.error('Error importing students:', error);
        showError('Error importing students. See console for details.');
    } finally {
        importBtn.disabled = false;
        importBtn.textContent = 'Import Students';
    }
}

// Download sample CSV file
function downloadSampleCSV() {
    const csvContent = `name,classYear,email,studentId
John Doe,freshman,john.doe@example.com,12345
Jane Smith,sophomore,jane.smith@example.com,12346
Bob Johnson,junior,bob.j@example.com,12347
Alice Williams,senior,alice.w@example.com,12348
Charlie Brown,freshman,charlie.b@example.com,12349
Diana Prince,sophomore,diana.p@example.com,12350
Eve Davis,junior,eve.d@example.com,12351
Frank Miller,senior,frank.m@example.com,12352`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'students_sample.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('Sample CSV file downloaded!');
}
