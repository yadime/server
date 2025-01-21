const express = require('express');

const router = express.Router();

// GET all courses
router.get('/', (req, res) => {
  const query = 'SELECT * FROM advising';
  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error fetching courses');
    }
    res.json(result); // Send courses as JSON
  });
});


// Insert new course
router.post('/', (req, res) => {
  const { course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab, remarks } = req.body;
  const query = 'INSERT INTO advising (course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab, remarks], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting course');
    }
    res.send('Course added successfully');
  });
});

// Update a course
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab, remarks } = req.body;
  const query = `
      UPDATE advising SET
      course_code = ?, course_title = ?, credit_unit_lec = ?, credit_unit_lab = ?, contact_hours_lec = ?, contact_hours_lab = ?, remarks = ?
      WHERE course_id = ?
  `;
  db.query(query, [course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab, remarks, id], (err, result) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.json({ message: 'Course updated successfully' });
  });
});

// Delete an instructor
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM advising WHERE course_id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred while deleting course' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'course not found' });
    }
    res.json({ message: 'course deleted successfully' });
  });
});

module.exports = router;