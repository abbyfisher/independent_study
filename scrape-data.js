//imports and app vars
var request = require('request'),
	cheerio = require('cheerio'),
	queries = ['AAPL', 'MSFT', 'XOM', 'JNJ', 'GE', 'WFC', 'BRK', 'JPM', 'AT%26T', 'PFE']
	Firebase = require('firebase'),
	db = new Firebase('https://torrid-inferno-8475.firebaseio.com/');
	queryQueue = [],
	delay = 3000,
	UA = ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/8.0.8 Safari/600.8.9', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.0', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.93 Safari/537.36', 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'];


//build list of queryies
for(var month = 1; month <= 11; month++) {
	for(var day = 1; day <= 30; day++) {
		if(month === 1 && day >= 23) { //do partial months
			queries.forEach(function (term) {
				var ua = UA[Math.floor((Math.random() * 5)) + 1];
				queryQueue.push({
					term: term,
					date: month + '/' + day + '/' + '2015',
					options: {
						url: 'https://www.google.com/search?q=' + term + '&hl=en&gl=us&authuser=0&biw=939&bih=1082&source=lnt&tbs=cdr%3A1%2Ccd_min%3A' + month + '%2F' + day + '%2F2015%2Ccd_max%3A' + month + '%2F' + day + '%2F2015&tbm=nws',
						headers: {
							'User-Agent': ua
						}
					}
				})
			});
		}
	}
}

queryQueue.reverse();

function doQuery(query) {
	request(query.options, function(error, response, body) {
		if(!error && response.statusCode == 200) {
			var $ = cheerio.load(body);
			var titles = [];
			var bodies = [];
			$('h3').each(function(i, elem) {
				titles.push($(elem).text());
			});
			$('.st').each(function(i, elem){
				bodies.push($(elem).text());
			})
			db.push({
				symbol: query.term, 
				date: query.date,
				headlines: titles,
				bodies: bodies
			});
			console.log('Saved: ' + query.term + ' for ' + query.date)
			//load the next query
			var next = queryQueue.pop();
			if(next){
				var rand = Math.floor(Math.random()*1500); // this will get a number between 1 and 1500;
				rand *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // this will add minus sign in 50% of cases
				setTimeout(function(){
					doQuery(next)
				}, delay + rand) //
			} else {
				console.log('Complete.');
				process.exit();
			}
		}
		if(error){
			console.log(error);
			process.exit();
		}
		if(response && response.statusCode !== 200) {
			console.log('Server returned code: ' + response.statusCode)
			process.exit();
		}
	});
}

doQuery(queryQueue.pop());
