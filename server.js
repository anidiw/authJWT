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

// route middleware to verify a token
apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('secretTo'), function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });

  }
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

/*token to verify
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjU5Yjg5ZWYwMjMxNGI0NGI0YzZmYzIzNCIsIm5hbWUiOiJBbmkgRGl3YWthciIsInBhc3N3b3JkIjoicGFzc3dvcmQiLCJhZG1pbiI6dHJ1ZSwiX192IjowfSwiaWF0IjoxNTA1MzU1MzIyLCJleHAiOjE1MDU0NDE3MjJ9.dmBsM_7DS5MBpf41sGGKQVSGoYoqyYqZxiludifnbjo*/
