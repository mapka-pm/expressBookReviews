const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 6: Register User
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) { 
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

// --- HELPER FUNCTIONS FOR ASYNC TASKS ---
function getBooksAsync() {
    return new Promise((resolve, reject) => {
        resolve(books);
    });
}

function getBookByISBNAsync(isbn) {
    return new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });
}

function getBooksByAuthorAsync(author) {
    return new Promise((resolve, reject) => {
        let output = [];
        for (const [key, value] of Object.entries(books)) {
            if (value.author === author) {
                output.push(value);
            }
        }
        if(output.length > 0){
            resolve(output);
        } else {
            reject("Author not found");
        }
    });
}

function getBooksByTitleAsync(title) {
    return new Promise((resolve, reject) => {
        let output = [];
        for (const [key, value] of Object.entries(books)) {
            if (value.title === title) {
                output.push(value);
            }
        }
        if(output.length > 0){
            resolve(output);
        } else {
            reject("Title not found");
        }
    });
}

// Task 1 & 10: Get all books (Async/Await)
public_users.get('/', async function (req, res) {
    try {
        const allBooks = await getBooksAsync();
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        return res.status(500).json({message: "Error retrieving books"});
    }
});


public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    getBookByISBNAsync(isbn)
        .then((book) => res.status(200).json(book))
        .catch((err) => res.status(404).json({message: err}));
});


public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const booksByAuthor = await getBooksByAuthorAsync(author);
        return res.status(200).json(booksByAuthor);
    } catch (error) {
        return res.status(404).json({message: error});
    }
});


public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const booksByTitle = await getBooksByTitleAsync(title);
        return res.status(200).json(booksByTitle);
    } catch (error) {
        return res.status(404).json({message: error});
    }
});

// Task 5: Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({message: "Book not found"});
    }
});

module.exports.general = public_users;