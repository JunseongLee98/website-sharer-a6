/**
 * Balanced Student Grouping Algorithm
 *
 * This module provides functionality to distribute students into groups
 * in a balanced way based on their class year (freshman, sophomore, junior, senior).
 *
 * The algorithm ensures that each group has a similar distribution of class years,
 * preventing scenarios where one group has all seniors and another has all freshmen.
 */

/**
 * Distributes students into balanced groups based on class year
 *
 * @param {Array} students - Array of student objects with {_id, name, classYear, ...}
 * @param {Number} numGroups - Number of groups to create
 * @returns {Array} Array of groups, where each group is an array of student objects
 *
 * Algorithm:
 * 1. Separate students by class year (freshman, sophomore, junior, senior)
 * 2. For each class year, distribute students round-robin across groups
 * 3. This ensures each group gets a balanced mix of all class years
 *
 * Example:
 * If there are 1 freshman, 2 sophomores, 3 juniors, and 4 seniors
 * and we want 2 groups, the result will be:
 * - Group 1: 1 freshman, 1 sophomore, 2 juniors, 2 seniors
 * - Group 2: 0 freshmen, 1 sophomore, 1 junior, 2 seniors
 */
export function createBalancedGroups(students, numGroups) {
    if (!students || students.length === 0) {
        throw new Error('No students provided');
    }

    if (!numGroups || numGroups < 1) {
        throw new Error('Number of groups must be at least 1');
    }

    if (numGroups > students.length) {
        throw new Error(`Cannot create ${numGroups} groups with only ${students.length} students`);
    }

    // Initialize empty groups
    const groups = Array.from({ length: numGroups }, () => []);

    // Separate students by class year
    const studentsByYear = {
        freshman: [],
        sophomore: [],
        junior: [],
        senior: []
    };

    students.forEach(student => {
        const year = student.classYear.toLowerCase();
        if (studentsByYear[year]) {
            studentsByYear[year].push(student);
        }
    });

    // Distribute each class year round-robin across groups
    // This ensures balanced distribution
    const classYears = ['freshman', 'sophomore', 'junior', 'senior'];

    classYears.forEach(year => {
        const studentsInYear = studentsByYear[year];
        studentsInYear.forEach((student, index) => {
            // Round-robin: assign to group (index % numGroups)
            const groupIndex = index % numGroups;
            groups[groupIndex].push(student);
        });
    });

    return groups;
}

/**
 * Get statistics about the distribution of students in groups
 *
 * @param {Array} groups - Array of groups from createBalancedGroups
 * @returns {Object} Statistics object with group sizes and class year distribution
 */
export function getGroupStatistics(groups) {
    const stats = {
        totalGroups: groups.length,
        totalStudents: 0,
        groupSizes: [],
        distributionByYear: {
            freshman: [],
            sophomore: [],
            junior: [],
            senior: []
        }
    };

    groups.forEach((group, index) => {
        stats.totalStudents += group.length;
        stats.groupSizes.push({
            groupNumber: index + 1,
            size: group.length
        });

        // Count class years in this group
        const yearCounts = {
            freshman: 0,
            sophomore: 0,
            junior: 0,
            senior: 0
        };

        group.forEach(student => {
            const year = student.classYear.toLowerCase();
            if (yearCounts[year] !== undefined) {
                yearCounts[year]++;
            }
        });

        // Add to distribution stats
        Object.keys(yearCounts).forEach(year => {
            stats.distributionByYear[year].push({
                groupNumber: index + 1,
                count: yearCounts[year]
            });
        });
    });

    return stats;
}

/**
 * Validate that groups are reasonably balanced
 *
 * @param {Array} groups - Array of groups from createBalancedGroups
 * @returns {Object} Validation result with isBalanced flag and details
 */
export function validateBalance(groups) {
    if (!groups || groups.length === 0) {
        return { isBalanced: false, reason: 'No groups provided' };
    }

    const groupSizes = groups.map(g => g.length);
    const minSize = Math.min(...groupSizes);
    const maxSize = Math.max(...groupSizes);

    // Groups are considered balanced if the difference between
    // largest and smallest group is at most 1
    const isBalanced = (maxSize - minSize) <= 1;

    return {
        isBalanced,
        minGroupSize: minSize,
        maxGroupSize: maxSize,
        difference: maxSize - minSize,
        groupSizes
    };
}
