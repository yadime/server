const express = require('express');
const db = require('../config/db');
const router = express.Router();


//fetch enrollment page
router.get('/', (req, res) => {
    const query = 'SELECT * FROM enrollment';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});

// Endpoint to handle enrollment form submission
router.post('/', (req, res) => {
    const formData = req.body;

    const query = `
        INSERT INTO enrollment (
            applicantType,
            courseSelection,
            firstName,
            surname,
            middleName,
            suffix,
            dob,
            civilStatus,
            sex,
            nationality,
            contactNumber,
            houseNumber,
            barangay,
            subdivision,
            municipality,
            province,
            zipCode,
            fatherName,
            fatherOccupation,
            motherName,
            motherOccupation,
            guardianName,
            guardianContact,
            guardianOccupation,
            disability,
            indigenousGroup,
            appointmentDate,
            appointmentTime
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [
            formData.applicantType,
            formData.courseSelection,
            formData.firstName,
            formData.surname,
            formData.middleName,
            formData.suffix || '',
            formData.dob,
            formData.civilStatus,
            formData.sex,
            formData.nationality,
            formData.contactNumber,
            formData.houseNumber,
            formData.barangay,
            formData.subdivision,
            formData.municipality,
            formData.province,
            formData.zipCode,
            formData.fatherName,
            formData.fatherOccupation,
            formData.motherName,
            formData.motherOccupation,
            formData.guardianName,
            formData.guardianContact,
            formData.guardianOccupation,
            formData.disability || false,
            formData.indigenousGroup || false,
            formData.appointmentDate,
            formData.appointmentTime,
        ],
        (err, results) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.status(500).send('Failed to insert data.');
                return;
            }
            console.log('Data inserted successfully:', results);
            res.status(200).send('Data inserted successfully.');
        }
    );
});

// Delete an instructor
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM enrollment WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while deleting the enrollment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'enrollment not found' });
        }
        res.json({ message: 'enrollment deleted successfully' });
    });
});

module.exports = router;
