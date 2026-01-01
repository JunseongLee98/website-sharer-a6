# Student Grouping System

A balanced student grouping feature that distributes students into groups based on their class year (freshman, sophomore, junior, senior) to ensure fair and balanced teams.

## Features

- **Add Students**: Add students with name, class year, email, and student ID
- **Balanced Distribution**: Automatically distribute students into groups ensuring each group has a balanced mix of class years
- **Smart Algorithm**: Uses round-robin distribution to prevent scenarios where one group has all seniors and another has all freshmen
- **Visual Interface**: Clean, user-friendly web interface with real-time statistics
- **Group Statistics**: See detailed breakdowns of class year distribution in each group

## How It Works

The grouping algorithm ensures balanced distribution by:

1. **Separating by Class Year**: Students are first organized by their class year (freshman, sophomore, junior, senior)
2. **Round-Robin Distribution**: For each class year, students are distributed round-robin across groups
3. **Balance Validation**: The system validates that group sizes don't vary by more than 1 student

### Example

If you have:
- 1 Freshman
- 2 Sophomores
- 3 Juniors
- 4 Seniors

And you want 2 groups, the result will be:

**Group 1:**
- 1 Freshman
- 1 Sophomore
- 2 Juniors
- 2 Seniors
- Total: 5 students

**Group 2:**
- 0 Freshmen
- 1 Sophomore
- 1 Junior
- 2 Seniors
- Total: 4 students

This ensures balanced class year distribution instead of random grouping that could result in unbalanced teams.

## Usage

### Access the Student Grouping Page

1. Navigate to `/students.html` in your browser
2. Or click "Student Grouping" in the navigation menu

### Add Students

1. Fill in the student information:
   - **Name** (required): Student's full name
   - **Class Year** (required): Select from Freshman, Sophomore, Junior, or Senior
   - **Email** (optional): Student's email address
   - **Student ID** (optional): Student identification number

2. Click "Add Student"

### Create Balanced Groups

1. Add all your students first
2. Enter the desired number of groups
3. Click "Create Balanced Groups"
4. View the generated groups with statistics showing class year distribution

### Manage Students

- **Refresh**: Reload the student list from the database
- **Delete**: Remove individual students
- **Clear All**: Delete all students (with confirmation)

## API Endpoints

The student grouping system provides the following REST API endpoints:

### GET /api/v3/students
Get all students in the database

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "classYear": "senior",
      "email": "john@example.com",
      "studentId": "12345",
      "created_date": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /api/v3/students
Add a new student

**Request Body:**
```json
{
  "name": "John Doe",
  "classYear": "senior",
  "email": "john@example.com",
  "studentId": "12345"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "classYear": "senior",
    "email": "john@example.com",
    "studentId": "12345"
  }
}
```

### DELETE /api/v3/students/:id
Delete a specific student by ID

### DELETE /api/v3/students
Delete all students

### POST /api/v3/students/group
Create balanced groups

**Request Body:**
```json
{
  "numGroups": 3
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "groups": [
      [/* array of student objects */],
      [/* array of student objects */],
      [/* array of student objects */]
    ],
    "statistics": {
      "totalGroups": 3,
      "totalStudents": 10,
      "groupSizes": [
        { "groupNumber": 1, "size": 4 },
        { "groupNumber": 2, "size": 3 },
        { "groupNumber": 3, "size": 3 }
      ],
      "distributionByYear": {
        "freshman": [...],
        "sophomore": [...],
        "junior": [...],
        "senior": [...]
      }
    },
    "balance": {
      "isBalanced": true,
      "minGroupSize": 3,
      "maxGroupSize": 4,
      "difference": 1,
      "groupSizes": [4, 3, 3]
    }
  }
}
```

## Technical Implementation

### Files Added/Modified

**Backend:**
- `models.js` - Added Student schema
- `routes/api/v3/controllers/students.js` - Student CRUD and grouping endpoints
- `routes/api/v3/utils/studentGrouping.js` - Balanced grouping algorithm
- `routes/api/v3/apiv3.js` - Registered students router

**Frontend:**
- `students.html` - Student grouping interface
- `javascripts/students.js` - Client-side logic for student management
- `index.html` - Added navigation link

### Database Schema

**Student Model:**
```javascript
{
  name: String (required),
  email: String,
  classYear: String (required, enum: ['freshman', 'sophomore', 'junior', 'senior']),
  studentId: String,
  created_date: Date (default: Date.now)
}
```

### Algorithm Details

The balanced grouping algorithm (`createBalancedGroups`) in `routes/api/v3/utils/studentGrouping.js`:

1. Validates input (students array, number of groups)
2. Separates students by class year into buckets
3. For each class year bucket:
   - Distributes students round-robin: `groupIndex = studentIndex % numGroups`
4. Returns array of groups with balanced distribution

This ensures:
- Each group gets an approximately equal number of students
- Class years are evenly distributed across groups
- Group sizes differ by at most 1 student

## Requirements

- Node.js >= 14.0.0
- MongoDB database
- Express.js
- Mongoose

## Future Enhancements

Potential improvements for the student grouping system:

- Save and name groups for future reference
- Add more attributes (GPA, major, skills) for multi-dimensional balancing
- Export groups to CSV/PDF
- Randomly shuffle within balanced constraints
- Constraint-based grouping (e.g., "no more than 2 from same major")
- Group history and analytics
