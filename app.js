var fs = require('fs'),
	ejs = require('ejs'),
	gm = require('gm'),
	bodyParser = require('body-parser'),
	express = require('express'),
	app = express();


// resize and remove EXIF profile data
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
	res.render('index');
});

app.post('/talksmack', function(req, res) {
	// console.log(req.body.username);
	var name = req.body.username,
		gif = req.body.image,
		timeStamp = Date.now();

	console.log(name + 'will now become a ' + gif + ' meme!');
	gm('public/images/'+ gif +'.gif')
		// .stroke("#ffffff")
		.options({imageMagick: true})
		.fill("#ffffff")
		// .font("Helvetica.ttf", 42)
		.fontSize(42)
		.drawText(30, 50, name + ' rides again')
		.write("public/memes/"+timeStamp + ".gif", function (err) {
			if (!err) {
				console.log('done');
				res.redirect('memes/'+timeStamp+'.gif', 301);
			} else {
				console.log(err);
			}

	});
});


var server = app.listen(3000, function() {
		console.log('Listening on port %d', server.address().port);
});