const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const authorsRouter = require('./routes/authors');
const postsRouter = require('./routes/posts')

const app = express();

// Different ways to access paths:
// console.log({argv: process.argv})
// console.log({dirname: __dirname})
// console.log({joined: path.join(__dirname, '/public')})
// console.log({process: process.cwd()})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/authors', authorsRouter);
app.use('/posts', postsRouter);

module.exports = app;
