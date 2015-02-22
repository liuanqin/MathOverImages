/**
 * User's Settings page
 */
module.exports.buildPage = (function(req, res, database) {
    res.render('account-settings',{
	loggedIn: req.session.loggedIn,
	user: req.session.user
    });
});

module.exports.changeEmail= (function(req, res, database){
    if(req.body.newEmail == req.body.newEmail2) // Check if new e-mail matches confirmation e-mail
	database.changeEmail(req.session.user.userid, req.body.newEmail, req.body.password1, function(success,error){
	    if (error)
	    {
		console.log(error);
		res.end (JSON.stringify(error)); // Error Landing page
	    }
	    else
	    {
		req.session.user.email = req.body.newEmail; // replace old email with new one
		console.log(req.session.user.email);  // display email in console
		res.redirect("/me"); // redirect to account seeting page
	    }
	});
    else
	res.end ("new emails don't match, please try again"); // Make error landing page
});

module.exports.changeUsername= (function(req, res, database){ // same sysle as changeEmail
    if(req.body.newUsername == req.body.newUsername2)
	database.changeUsername(req.session.user.userid, req.body.newUsername, req.body.password1, function(success,error) {
	    if (error)
	    {
		console.log(error);
		res.end (JSON.stringify(error)); // Error Landing page
	    }
	    else
	    {
		req.session.user.username = req.body.newUsername;
		console.log(req.session.user.username);
		res.redirect("/me");
	    }
	});
    else
	res.end ("new usernames don't match, please try again"); // Make error landing page
});

module.exports.changePassword= (function(req, res, database){
    console.log(req.body.newPassword);
    if(req.body.newPassword == req.body.newPassword2)
	database.changePassword(req.session.user.userid, req.body.password1, req.body.newPassword , function(success, error){
	    if (error)
	    {
		console.log(error);
		res.end (JSON.stringify(error)); // Error Landing page
	    }
	    else
	    {
		res.redirect("/me");
	    }
	});
    else
	res.end ("new passwords don't match, please try again"); // Make error landing page
});
