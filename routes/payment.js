const express = require('express');

const router = express.Router();

// API Route to Fetch Data from the 'payments' Table
router.get('/', (req, res) => {
    const query = 'SELECT * FROM payments'; // Ensure your table name matches
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.json(results);
    });
});


// Create a new payment record
router.post('/', (req, res) => {
    const formData = req.body;

    const { student_id, student_name, year_level, section, amount_paid } = req.body;
    if (!student_id || !student_name || !year_level || !section|| !amount_paid) {
        return res.status(400).json({ message: 'All fields are required' });
    }
  
    const query = `
      INSERT INTO payments (student_id, student_name, year_level, section, amount_paid) 
      VALUES (?, ?, ?, ?, ?)
    `;
  
    db.query(query, [formData.student_id, formData.student_name, formData.year_level, formData.section, formData.amount_paid], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: 'Failed to insert payment record.' });
      } else {
        res.status(201).json({ message: 'Payment record created successfully.', id: result.insertId });
      }
    });
  });


// Update payment
router.put('/:id', (req, res) => {
    const { id } = req.params;  // Get the id from the URL parameter
    const { student_id, student_name, year_level, section, amount_paid } = req.body;

    if (!student_id || !student_name || !year_level || !section || !amount_paid) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const query = `
        UPDATE payments SET
        student_id = ?, student_name = ?, year_level = ?, section = ?, amount_paid = ?
        WHERE id = ?
    `;
    db.query(query, [student_id, student_name, year_level, section, amount_paid, id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while updating the payment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'payment not found' });
        }
        res.json({ message: 'payment updated successfully' });
    });
});


// Delete payment
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM payments WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'An error occurred while deleting payment' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'payment not found' });
        }
        res.json({ message: 'payment deleted successfully' });
    });
});

module.exports = router;