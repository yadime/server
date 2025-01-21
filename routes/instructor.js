const express = require('express');
const db = require('../config/db');
const router = express.Router();

// API Route to Fetch Data from the 'instructor' Table
router.get('/', (req, res) => {
    const query = 'SELECT * FROM instructor';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

// Add a new instructor
router.post('/', (req, res) => {
    const { firstname, lastname, email, department } = req.body;

    if (!firstname || !lastname || !email || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        INSERT INTO instructor (firstname, lastname, email, department)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [firstname, lastname, email, department], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while adding the instructor' });
        }
        res.status(201).json({ message: 'Instructor added successfully', instructor_id: result.insertId });
    });
});

// Update an instructor
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, department } = req.body;

    if (!firstname || !lastname || !email || !department) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        UPDATE instructor SET
        firstname = ?, lastname = ?, email = ?, department = ?
        WHERE instructor_id = ?
    `;
    db.query(query, [firstname, lastname, email, department, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while updating the instructor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor updated successfully' });
    });
});

// Delete an instructor
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM instructor WHERE instructor_id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while deleting the instructor' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor deleted successfully' });
    });
});

module.exports = router;