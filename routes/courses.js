const express = require('express');

const router = express.Router();

// API Route to Fetch Data from the 'CS courses' Table
router.get('/', (req, res) => {
    const query = 'SELECT * FROM courses';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

// Add a new course
router.post('/', (req, res) => {
    const { course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab } = req.body;
    const query = `
        INSERT INTO courses (course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(query, [course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json({ message: 'Course added successfully', course_id: result.insertId });
    });
});

// Update a course
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab } = req.body;
    const query = `
        UPDATE courses SET
        course_code = ?, course_title = ?, credit_unit_lec = ?, credit_unit_lab = ?, contact_hours_lec = ?, contact_hours_lab = ?
        WHERE course_id = ?
    `;
    db.query(query, [course_code, course_title, credit_unit_lec, credit_unit_lab, contact_hours_lec, contact_hours_lab, id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json({ message: 'Course updated successfully' });
    });
});

// Delete a course
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM courses WHERE course_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json({ message: 'Course deleted successfully' });
    });
});


module.exports = router;