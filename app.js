var fs = require('fs'),
	ejs = require('ejs'),
	gm = require('gm'),
	bodyParser = require('body-parser'),
	express = require('express'),
	pkgcloud = require('pkgcloud'),
	app = express();


var client = pkgcloud.storage.createClient({
		provider: 'rackspace',
		username: 'hatchideas',
		apiKey: '139194dc584201dd0d9b2e0479445797',
		region: 'IAD'
	}),
	container,
	url,
	source;



client.createContainer({
	name: 'gallery'
}, function (err, container) {
	if (err) {
		// TODO handle as appropriate
		console.log('error creating container');
		console.log(err);
		return;
	}
	console.log('container created successfuly');
	// TODO use your container
});

container = client.getContainer('gallery', function(err, container) {
	if (err) {
		// TODO handle as appropriate
		console.log(err);
	}
	console.log( 'got the container');
	// TODO use your container
	console.log('container.cdnUri: ' + container.cdnUri);
	url = container.cdnUri;
});



function uploadMeme(timeStamp) {
	var filePath = 'public/memes/' + timeStamp + '.gif';

	source = fs.createReadStream(filePath);
	dest = client.upload({
		container: 'gallery',
		remote: timeStamp + '.gif',
	}, function(err, res) {
		if (err) {
			console.log(err);
		}
	});

	// pipe the source to the destination
	source.pipe(dest);

}



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

console.log( process.cwd() );
app.use(express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
	console.log('index');
	res.render('index');
});

app.get('/talksmack', function(req, res){
	res.redirect(301, '/');
});

app.post('/talksmack', function(req, res) {
	// console.log(req.body.username);
	var name = req.body.username,
		gif = req.body.image,
		msg = req.body.msg,
		timeStamp = Date.now();

	console.log(name + ' will now become a ' + gif + ' meme!');
	gm('public/images/'+ gif +'.gif')
		.options({imageMagick: true})
		.fill("#ffffff")
		.fontSize(22)
		.drawText(10, 28, 'Hey ' + name + ', ')
		.fontSize(18)
		.drawText(10, 48, msg)
		.write("public/memes/"+timeStamp + ".gif", function (err) {
			if (!err) {
				var gifUrl = url + '/' + timeStamp+'.gif';
				console.log('done creating meme');
				//res.redirect(301, 'memes/'+timeStamp+'.gif');
				uploadMeme(timeStamp);

				source.on('end', function(ev) {
					console.log('file is done uploading');
					var response = {
						status  : 200,
						success : 'Updated Successfully',
						gifUrl : gifUrl
					};
					setTimeout(function() {
						res.end(JSON.stringify(response));
					}, 500);
				});
			} else {
				console.log(err);
			}
	});
});

app.get('/testload', function(req, res) {
	var timeStamp = Date.now();
	console.log('Testing server load!');
	gm('public/images/leehaw.gif')
		.options({imageMagick: true})
		.fill("#ffffff")
		.fontSize(22)
		.drawText(10, 28, 'Hey Lex, ')
		.fontSize(18)
		.drawText(10, 48, "Testing server load")
		.write("public/memes/"+timeStamp + ".gif", function (err) {
			if (!err) {
				console.log('done');
				uploadMeme(timeStamp);
				res.render('share', {gifName: 'memes/'+timeStamp+'.gif'});
			} else {
				console.log(err);
			}
	});
});

var server = app.listen(3000, function() {
		console.log('Listening on port %d', server.address().port);
});