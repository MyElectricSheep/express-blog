const fs = require("fs");
// const fs = require("fs").promises;

const errors = (msg, details) => {
  return {
    customMessage: msg,
    details,
  };
};

const read = async (path, callback) => {
  // The classic callback approach
  let result = {};
  fs.readFile(path, "utf8", (err, jsonString) => {
    if (err) {
      result.errors = errors(
        "An error was encountered while accessing the resources",
        err
      );
      return callback(result);
    }
    try {
      result.data = JSON.parse(jsonString);
      callback(result);
    } catch (e) {
      result.errors = errors(
        "An error was encountered while parsing the resources",
        err
      );
      callback(result);
    }
  });

  //   let result = {};

  // With Promises
  // return fs.readFile(path, 'utf8')
  //   .then(data => {
  //       try {
  //           result.data = JSON.parse(data)
  //       } catch (err) {
  //           result.errors = errors("An error was encountered while accessing the resources", err)
  //       }
  //       return result
  //   })
  //   .catch(err => result.errors = errors("An error was encountered while accessing the resources", err))

  // With Async/Await
  //   try {
  //     result.data = JSON.parse(await fs.readFile(path, "utf8")) ;
  //   } catch (err) {
  //     result.errors = errors(
  //         "An error was encountered while accessing the resources",
  //         err
  //       );
  //   }
  //   return result;
};

const create = (path, newPost, callback) => {
  read(path, (postData) => {
    if (postData.errors) return callback(postData);
    newPost.id = postData.data.length + 1;
    postData.data.push(newPost);
    fs.writeFile(path, JSON.stringify(postData.data), "utf-8", (err) => {
      if (err) {
        postData.errors = errors(
          "An error was encountered while writing new information to the target resource",
          err
        );
        return callback(postData);
      }
      console.log("Post created successfully!");
      callback(postData);
    });
  });
};

// The update utility function works the same
// for posts.delete and posts.update
// and is used for both
const update = (path, data, callback) => {
  let result = {};
  fs.writeFile(path, JSON.stringify(data), "utf-8", (err) => {
    if (err) {
      result.errors = errors(
        "An error was encountered while updating data from the target resource",
        err
      );
      return callback(result);
    }
    result.data = data;
    console.log("Updated successfully!");
    callback(result);
  });
};

module.exports = { create, read, update };
