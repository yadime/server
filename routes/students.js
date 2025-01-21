const express = require('express');
const db = require('../config/db');
const router = express.Router();

// Fetch all students
router.get('/', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    res.json(results);
  });
});

// POST route to insert a new student
router.post('/', (req, res) => {
    const { student_id, fullname, status, year_level, section, semester, course } = req.body;
  
    // SQL query to insert a new student
    const query = `
      INSERT INTO students (student_id, fullname, status, year_level, section, semester, course)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [student_id, fullname, status, year_level, section, semester, course], (err, result) => {
      if (err) {
        console.error('Error inserting student:', err);
        return res.status(500).json({ message: 'Failed to add student' });
      }
  
      // Send success response
      res.status(200).json({ message: 'Student added successfully', studentId: result.insertId });
    });
  });

// Update student by ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, year_level, section, semester } = req.body;
  db.query(
    'UPDATE students SET status = ?, year_level = ?, section = ?, semester = ? WHERE id = ?',
    [status, year_level, section, semester, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update student' });
      }
      res.json({ message: 'Student updated successfully' });
    }
  );
});

// Delete student by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM students WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete student' });
    }
    res.json({ message: 'Student deleted successfully' });
  });
});

module.exports = router;
