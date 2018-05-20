const path = require('path')
const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
var bodyParser = require('body-parser')
var util = require('util')
var nodemailer = require('nodemailer');
var roll
var pitch
var throttle
var init = false;
var initRes = null;
var quit = 0;
var date = new Date();

console.log(date.getYear());

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'crossingspoolalert@gmail.com',
    pass: 'poolalert123'
  }
});

var mailOptions = {
  from: 'crossingspoolalert@gmail.com',
  to: 'kyle.marino22@gmail.com',
  subject: 'Pool Shutoff',
  text: 'Hello There!\nThe Pool has been shutoff on ' +
   (date.getMonth()+1) + '/' + date.getDate() + '/' + (date.getYear()-100) + ' at ' +
   date.getHours() + ':' + date.getMinutes() + '.'
};

app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'accept, content-type, x-parse-application-id, x-parse-rest-api-key, x-parse-session-token');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  } else {
    next();
  }
});

app.use("/public", express.static(__dirname + "/public"));

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());


app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))


app.get('/', (request, response) => {
  response.render('home', {
    name: 'John'
  })
})

app.get(/data/, (request, res) => {
  date = new Date();

	console.log(request.originalUrl);

	var reqHash = request.originalUrl.substring(6);
	console.log(reqHash);


  var valid = false;

  if(date.getSeconds() < 10){
    if(timeHash(date.getHours(), date.getMinutes() - 1) == reqHash){
      valid = true;
    }
  }


	if(timeHash(date.getHours(), date.getMinutes()) == reqHash || valid){
		console.log("validResponse");

		transporter.sendMail(mailOptions, function(error, info){
  			if (error) {
		   		console.log(error);
		 	} else {
		    	console.log('Email sent: ' + info.response);
		  	}
		});

    res.send("99:99");
    return;
	}
	else{
		console.log("no");
	}
 
  var hour = date.getHours().toString();
  if(hour.length == 1){
    hour = "0" + hour;
  }

  var min = date.getMinutes().toString();

  if(date.getSeconds() > 50){
    var min = (date.getMinutes()+1).toString();
  }
  if(min.length == 1){
    min = "0" + min;
  }

  res.send(hour+':'+min);
  

})

app.get(/test/, (request, res) => {


 
    res.send(timeHash(date.getHours(), date.getMinutes()));
  

})

app.listen(process.env.PORT || 3000, '0.0.0.0', function() {
  console.log('Listening to port:  ' + 3000);
  console.log(date.getMonth()+1 + " " + date.getDate());


});


function timeHash(hours, minutes){

	//pseudo random number
	hours = hours*hours*hours;
	minutes = minutes*minutes*minutes;
	var tempHash = hours.toString() + minutes.toString();
	tempHash = tempHash % 100000000;
	var shifted = Number(tempHash) << 2;
	tempHash = shifted | (hours*minutes);
	tempHash = tempHash % 100000000;
	return tempHash.toString() + (tempHash >> 2).toString() + (tempHash >> 3).toString();
}




