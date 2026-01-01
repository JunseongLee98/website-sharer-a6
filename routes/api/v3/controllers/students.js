import express from 'express';
import { waitForConnection } from '../../../../models.js';
import { createBalancedGroups, getGroupStatistics, validateBalance } from '../utils/studentGrouping.js';

var router = express.Router();

// GET /api/v3/students - Get all students
router.get('/', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (!req.models || !req.models.Student) {
            return res.status(500).json({
                status: "error",
                error: "Database not connected. Please set up MongoDB Atlas."
            });
        }

        // Wait for MongoDB connection before proceeding
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: `Database connection failed: ${connectionError.message}`
            });
        }

        // Fetch all students, sorted by class year then name
        const yearOrder = { freshman: 1, sophomore: 2, junior: 3, senior: 4 };
        const students = await req.models.Student.find({}).sort({ created_date: -1 });

        // Sort by class year then name
        students.sort((a, b) => {
            const yearDiff = yearOrder[a.classYear] - yearOrder[b.classYear];
            if (yearDiff !== 0) return yearDiff;
            return a.name.localeCompare(b.name);
        });

        res.json({
            status: "success",
            data: students
        });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

// POST /api/v3/students - Add a new student
router.post('/', async (req, res) => {
    try {
        const { name, email, classYear, studentId } = req.body;

        // Validate required fields
        if (!name || !classYear) {
            return res.status(400).json({
                status: "error",
                error: "Name and class year are required"
            });
        }

        // Validate class year
        const validYears = ['freshman', 'sophomore', 'junior', 'senior'];
        if (!validYears.includes(classYear.toLowerCase())) {
            return res.status(400).json({
                status: "error",
                error: `Invalid class year. Must be one of: ${validYears.join(', ')}`
            });
        }

        // Check if MongoDB is connected
        if (!req.models || !req.models.Student) {
            return res.status(500).json({
                status: "error",
                error: "Database not connected. Please set up MongoDB Atlas."
            });
        }

        // Wait for MongoDB connection before proceeding
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: `Database connection failed: ${connectionError.message}`
            });
        }

        // Create a new Student object
        const newStudent = new req.models.Student({
            name,
            email: email || '',
            classYear: classYear.toLowerCase(),
            studentId: studentId || '',
            created_date: new Date()
        });

        // Save the student to the database
        try {
            await newStudent.save();
        } catch (saveError) {
            console.error('Error saving student:', saveError);
            return res.status(500).json({
                status: "error",
                error: `Failed to save student: ${saveError.message}`
            });
        }

        // Return success response with the created student
        res.json({
            status: "success",
            data: newStudent
        });

    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

// DELETE /api/v3/students/:id - Delete a student
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                status: "error",
                error: "Student ID is required"
            });
        }

        // Check if MongoDB is connected
        if (!req.models || !req.models.Student) {
            return res.status(500).json({
                status: "error",
                error: "Database not connected. Please set up MongoDB Atlas."
            });
        }

        // Wait for MongoDB connection before proceeding
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: `Database connection failed: ${connectionError.message}`
            });
        }

        // Delete the student
        const result = await req.models.Student.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({
                status: "error",
                error: "Student not found"
            });
        }

        res.json({
            status: "success",
            data: { deletedId: id }
        });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

// POST /api/v3/students/group - Create balanced groups
router.post('/group', async (req, res) => {
    try {
        const { numGroups } = req.body;

        if (!numGroups || numGroups < 1) {
            return res.status(400).json({
                status: "error",
                error: "Number of groups must be at least 1"
            });
        }

        // Check if MongoDB is connected
        if (!req.models || !req.models.Student) {
            return res.status(500).json({
                status: "error",
                error: "Database not connected. Please set up MongoDB Atlas."
            });
        }

        // Wait for MongoDB connection before proceeding
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: `Database connection failed: ${connectionError.message}`
            });
        }

        // Fetch all students
        const students = await req.models.Student.find({});

        if (students.length === 0) {
            return res.status(400).json({
                status: "error",
                error: "No students found in database"
            });
        }

        // Create balanced groups
        let groups;
        try {
            groups = createBalancedGroups(students, parseInt(numGroups));
        } catch (groupingError) {
            return res.status(400).json({
                status: "error",
                error: groupingError.message
            });
        }

        // Get statistics about the distribution
        const stats = getGroupStatistics(groups);
        const balance = validateBalance(groups);

        res.json({
            status: "success",
            data: {
                groups,
                statistics: stats,
                balance
            }
        });

    } catch (error) {
        console.error('Error creating groups:', error);
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

// DELETE /api/v3/students - Delete all students (for testing/reset)
router.delete('/', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (!req.models || !req.models.Student) {
            return res.status(500).json({
                status: "error",
                error: "Database not connected. Please set up MongoDB Atlas."
            });
        }

        // Wait for MongoDB connection before proceeding
        try {
            await waitForConnection();
        } catch (connectionError) {
            console.error('MongoDB connection error:', connectionError);
            return res.status(500).json({
                status: "error",
                error: `Database connection failed: ${connectionError.message}`
            });
        }

        // Delete all students
        const result = await req.models.Student.deleteMany({});

        res.json({
            status: "success",
            data: { deletedCount: result.deletedCount }
        });

    } catch (error) {
        console.error('Error deleting all students:', error);
        res.status(500).json({
            status: "error",
            error: error.message
        });
    }
});

export default router;
