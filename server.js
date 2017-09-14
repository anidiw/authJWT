// grab all packages

var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var morgan = require('morgan');
var mongoose = require('mongoose');



var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

//select available port or default to 8080
var port = process.env.PORT || 8080;

mongoose.connect(config.database); // connect to database
app.set('secretTo', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
var apiRoutes = express.Router();

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    name: req.body.name
  }, function(err, user) {

    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

	  
        // if user is found and password is right
        // create a token
				
		try{
        var token = jwt.sign({user}, app.get('secretTo'), {
          expiresIn: "1d" // expires in 24 hours
        });
		}catch(e)
		{
			console.log(e.message);
		}

        // return the information including token as JSON
        res.json({
          success: true,
          message: 'here is your token!',
          token: token
        });
      }   

    }

  });
});


// basic route
apiRoutes.get('/', function(req, res) {
    res.send('Hello! I am your API at http://localhost:' + port + '/api');
});

// API ROUTES -------------------
// we'll get to these in a second

apiRoutes.get('/setup',function(req, res){
	
		var ani = new User({
			name: 'Ani Diwakar',
			password: 'pwd', //hash it in real world
			admin: true
		});
		
		// save the sample user
		ani.save(function(err) {
		if (err) throw err;
		
			console.log('User saved successfully');
			res.json({ success: true });
		});
});
	

apiRoutes.get('/users', function(req,res){
	User.find({},function(err,users){
		res.json(users);
	});
});

app.use('/api',apiRoutes);
// =======================
// start the server ======
// =======================
app.listen(port);

