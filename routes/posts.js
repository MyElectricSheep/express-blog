const express = require("express");
const path = require("path");
const posts = express.Router();
const { body, validationResult } = require("express-validator");
const { create, read, deleteData } = require("../utilities/utils");
// One way to get access to a JSON file is to require it... but it will be read only once when the app loads!
// const mockPosts = require('../data/mockPosts.json')

// Better way is through fs.readFile; because the file will be accessed every time we need it
// https://medium.com/@osiolabs/read-write-json-files-with-node-js-92d03cc82824

const mockPostsPath = path.join(process.cwd(), "/data/mockPosts.json");
const mockAuthorsPath = path.join(process.cwd(), "/data/mockAuthors.json");

/* GET All Posts. Authors is an optional param that attaches the author info to each individual post */
posts.get("/:authors?", async (req, res) => {
  // Here read() is a reusable utility function that will use fs.readFile to access the file
  // to which we give a path and return the data it contains
  // You can use it the classic Callback way
  read(mockPostsPath, ({ errors: postErrors, data: postData }) => {
    const result = [];
    if (postErrors) return res.status(500).send(postErrors.customMessage);
    if (!req.params.authors) return res.status(200).send(postData);

    read(mockAuthorsPath, ({ errors: authorErrors, data: authorData }) => {
      if (authorErrors) return res.status(500).send(authorErrors.customMessage);
      postData.forEach((post) => {
        const author = authorData.find(
          (author) => author.id === post.author_id
        );
        const combinedData = {
          ...post,
          author,
        };
        result.push(combinedData);
      });
      res.status(200).send(result);
    });
  });

  // Or the Promises way
  // const { data, errors } =  await read(mockPostsPath)
  // console.log(data)
  // if (errors) return res.status(500).send(errors.customMessage)
  // res.status(200).send(data)
});

// Using express-validator to check user input
// https://express-validator.github.io/docs/index.html
posts.post(
  "/",
  [
    body("title").not().isEmpty().isLength({ min: 5 }),
    body("content").not().isEmpty().isLength({ min: 10 }),
    body("author_id").not().isEmpty().isInt(),
    body("main_pic").optional().isLength({ min: 2 }),
    body("created_at").not().isEmpty().isDate(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    read(mockAuthorsPath, ({ errors: authorErrors, data: authorData }) => {
      if (authorErrors) return res.status(500).send(authorErrors.customMessage);
      const author = authorData.find(
        (author) => author.id === parseInt(req.body.author_id, 10)
      );
      if (!author) res.status(404).send("There's no author with that ID");
      create(
        mockPostsPath,
        req.body,
        ({ errors: postErrors, data: postData }) => {
          if (postErrors) return res.status(500).send(postErrors.customMessage);
          res.status(200).send(postData);
        }
      );
    });
  }
);

// DELETE SECTION
posts.delete("/:id?", (req, res) => {
  if (!req.params.id)
    return res.status(400).send("An ID is required to delete a post");
    console.log({mockPostsPath})
    
  read(mockPostsPath, ({ errors: postErrors, data: postData }) => {
    console.log({postErrors})
    if (postErrors) return res.status(500).send(postErrors.customMessage);
    const post = postData.find(
      (post) => post.id === parseInt(req.params.id, 10)
    );
    if (!post) return res.status(404).send("No post matches the provided ID");
    const filteredPosts = postData.filter(
      (post) => post.id !== parseInt(req.params.id, 10)
    );
    deleteData(
      mockPostsPath,
      filteredPosts,
      ({ errors: deleteErrors, data: deleteData }) => {
        if (deleteErrors)
          return res.status(500).send(deleteErrors.customMessage);
        res.status(200).send(post);
      }
    );
  });
});

module.exports = posts;
