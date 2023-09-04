const fs = require('fs');
const uuid = require('uuid');
const path = require('path');
const express = require('express');

// Express.js server creation
const app = express();

// Connection to our held notes
const DBnotes = require('./db/db.json');

// PORT variable, process.env.PORT is for Heroku 
// 3001 works for local deployment
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Get routes, sending user to index.html / notes.hmtl
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// Get route for reading db.json and returning those notes
app.get('/api/notes', (req, res) => {
    const notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'));
    res.json(notes);
});

// Post route to add notes to the db.json file and return new notes to the client
app.post('/api/notes', (req, res) => {
    const {title, text} = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid.v4(),
        };

        DBnotes.push(newNote);
        fs.writeFileSync('./db/db.json', JSON.stringify(DBnotes, null, 4));
        res.json(DBnotes);
    }
});

// Delete route, deletes a note
app.delete('/api/notes/:id', (req, res) => {
    const noteID = req.params.id;
    const deleteThisNote = DBnotes.find((note) => note.id === noteID);

    DBnotes.splice(deleteThisNote, 1);
    fs.writeFileSync('./db/db.json', JSON.stringify(DBnotes, null, 4));
    res.json(DBnotes);
});

// Wildcard route, returns users to index.html if an incorrect url is typed in
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});


// app.listen starts the server
app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});