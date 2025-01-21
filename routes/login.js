const express = require('express');

const router = express.Router();
const app = express();

//create a route to the server that will register the user
app.post('/register', (req, res) => {
    // get the variables sent from the user
    const sentEmail = req.body.Email
    const sentUserName = req.body.UserName
    const sentPassword = req.body.Password

    //create a SQL statement to insert the user to the database table users
    const SQL = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)'
    const Values = [sentEmail, sentUserName, sentPassword]

    //Query to execute the SQL statement stated above
    db.query(SQL, Values, (err, results) => {
        if (err) {
            console.error('Error inserting user:', err);
            res.status(500).send(err); // Send error response
        } else {
            console.log('User inserted successfully');
            res.send({ message: 'User added!' });
        }
    });

})

//Login these credentials from a registered user
app.post('/login', (req, res) => {
    const sentloginUserName = req.body.LoginUserName
    const sentLoginPassword = req.body.LoginPassword

    //create a SQL statement to insert the user to the database table users
    const SQL = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const Values = [sentloginUserName, sentLoginPassword]

    //Query to execute the sql statement above 
    db.query(SQL, Values, (err, results) => {
        if (err) {
            res.send({ error: err });
        } if (results.length > 0) {
            res.send(results)
        }
        else {
            res.send({ message: `Credentials Don't match!` })
        }
    });

})


module.exports = router;