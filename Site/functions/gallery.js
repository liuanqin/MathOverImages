/**
 * Functions related to the gallery.
 */
var setLikes = function(imageArray, userID, callback) {
  var imageArrayClone = imageArray.slice(0, imageArray.length);
  var errorsArray = [];
  for(var image = 0; image < imageArrayClone.length; image++) {
    (function(currentIndex){
      filedatabase.hasLiked(userID, imageArrayClone[currentIndex].imageid, function(liked, error) {
        imageArrayClone[currentIndex].liked = liked;
        errorsArray.push(error); 
      });
    })(image);
  }
  callback(imageArrayClone, errorsArray);
}

var filedatabase;
module.exports.buildRandomPage = (function(req, res, database) {
  filedatabase=database;
  module.exports.getRandomImages (9, function(images, error){
    var userid = (req.session.user) ? req.session.user.userid : null;
    setLikes(images, userid, function(imageArray, errorArray){
      res.render('../public/views/gallery.jade',{
        loggedIn: req.session.loggedIn,
        user: req.session.user,
        images: imageArray,
        currentPage: req.params.pageNumber,
        type: "random"
      });
    });
  });
});

module.exports.buildRecentsPage = function(req, res, database) {
  filedatabase=database;
  module.exports.getRecentImages(9, req.params.pageNumber, function(images, nextPage,  error) {
    var userid = (req.session.user) ? req.session.user.userid : null;
    setLikes(images, userid, function(imageArray, errorArray){
      res.render('../public/views/gallery.jade',{
        loggedIn: req.session.loggedIn,
        user: req.session.user,
        images: imageArray,
        currentPage: req.params.pageNumber,
        type: "recent"
      });
    });
  });
};

/**
 * Access random images in the gallery.
 */
/*
  Procedure:
  gallery.getRandomImages(count, callback));
  Purpose:
  Grabs random images from the image table and returns the information
  Parameters:
  count, how many images to return
  callback, a function describing what to do with the results
  Produces:
  images, an array of image objects
  error, if there is one.
  Pre-conditions:
  None
  Post-conditions:
  None
*/
module.exports.getRandomImages= (function(count, callback) {
  filedatabase.query("SELECT images.*, users.username FROM images NATURAL JOIN users ORDER BY RAND() LIMIT " + count + ";", function(rows, error){
    callback(rows, error);
  });
});

/**
 * Access recent images in the gallery.
 */
/*
  Procedure:
  gallery.getRecentImages(count, callback));
  Purpose:
  Grabs the most recent images from the image table and returns the information
  Parameters:
  count, how many images to return
  callback, a function describing what to do with the results
  Produces:
  images, an array of image objects
  error, if there is one.
  Pre-conditions:
  None
  Post-conditions:
  None
*/
module.exports.getRecentImages= (function(count, page, callback) {

  var start = (page-1)*count;
  filedatabase.query("SELECT images.*, users.username FROM images NATURAL JOIN users ORDER BY modifiedAt DESC LIMIT " + start +","+ (count+1) + ";", function(rows, error){
  if(rows.length <=9){
    callback(rows.slice(0, count), false, error)
  }
  else{
    callback(rows.slice(0, count),true,  error);
  }
  });
});

module.exports.buildTopRatedPage = function(req, res, database) {
    filedatabase=database;
    module.exports.getTopRated(9, req.params.pageNumber, function(images, nextPage, error) {
        var userid = (req.session.user) ? req.session.user.userid : null;
        setLikes(images, userid, function(imageArray, errorArray){
            res.render('../public/views/gallery.jade',{
              loggedIn: req.session.loggedIn,
              user: req.session.user,
              images: imageArray,
              currentPage: req.params.pageNumber,
              type: "toprated"
            });
        });
    });
};

module.exports.getTopRated= (function(count, page, callback) {

    var start = (page-1)*count;
    filedatabase.query("SELECT images.*, users.username FROM images NATURAL JOIN users ORDER BY rating DESC LIMIT " + start +","+ (count+1) + ";", function(rows, error){
  if(rows.length <=9){
    callback(rows.slice(0, count), false, error)
  }
  else{
    callback(rows.slice(0, count),true,  error);
  }
  });
});
