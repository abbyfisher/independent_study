//import data and library


// data is a export file within data-exports directory and it was  imported from the firebase database.
var data = require( './data-exports/export4.js' ),

//change data is the clean-change-data file that contains an object of date's for each of the queries
    changeData = require( './clean-change-data.js' ),

//"Natural" is a general natural language facility for nodejs. Tokenizing, stemming, classification, phonetics, tf-idf,
    natural = require( 'natural' ),
    tokenizer = new natural.WordTokenizer(),
    stemmer = natural.LancasterStemmer,
//stop-words are words which do not contain important significance to be used in Search Queries
    stopwords = require( 'stopwords' ).english,
    ignore = [ 'aapl', '500', 'month', 'september', 'exxonmoble', 'monday', 'july,', 'friday', 'nysewfc', 'google', 'two', 'york', 'buffet', 'iphone', 'today', 'week', 'nyse', 'market', 'analyst', 'report', 'exxonmoble', 'among', 'brkb', '30', 'chevron', 'second', 'nysexom', 'google', 'four', 'verizon', 'xbox', 'thursday', 'wednesday', 'nysejpm', 'appl', 'apple', 'msft', 'microsoft', 'xom', 'exxon', 'jnj', 'johnson', 'ge', 'general', 'electric', 'wfc', 'wells', 'fargo', 'brk', 'berkshire', 'hathaway', 'berkshir', 'jp', 'when', 'say', 'firm', 'nysejnd', 'nysepf', 'nasdaq', 'nasdaqaapl', 'nasdaqmsft', '2015', 'it', 'corp', 'at', 'jpm', 'morgan', 'at%26t', 'at&t', 'pfe', 'pfizer', 'pfiz', 'company', 'jpmorgan', 'jpmorg' ];

//hooks library functions to string prototype
stemmer.attach();

console.time( 'Combine Strings' );

var combined = '';

//combine all data for each row into one string using the headings and body of the data in exports into combined
for( d in data ){
    if( data[ d ].symbol != 'brk' ){
        var headlines = data[ d ].headlines.join();
        var bodies = data[ d ].bodies.join();
        var str = [].concat( headlines, bodies ).toString().replace( /[^\w\s]|_/g, "" ).replace( /\s+/g, " " ).toLowerCase();
        combined += str;
    }
}
console.timeEnd( 'Combine Strings' );

console.time( 'Clean & Tokenize' );

//remove stop words from the combined strings

combined = combined.split( ' ' ).filter( function( word ){
    return (!~stopwords.indexOf( word )) || (!~ignore.indexOf( word ))
} ).join( ' ' );


//create an array of tokens from combined 
var tokens = combined.tokenizeAndStem();

//the tokens are the strings broken up into an array
console.timeEnd( 'Clean & Tokenize' );

console.time( 'Count and sort Tokens' );

//count occurrences of unique tokens (being the words from the combined string)
var counts = {};
tokens.forEach( function( x ){
    counts[ x ] = (counts[ x ] || 0) + 1;
} );


// transform into a array of counted tokens and remove ignore words
// creates an array of objects that have the words after removing ignore words and their count value
var countsArray = [];
for( c in counts ){
    if( ignore.indexOf( c ) < 0 ){
        countsArray.push( { key: c, value: counts[ c ] } );
    }
}


// sorted to find highest count and to remove upper and lower tokens
// will give better result to remove the highest and lowest occurring words
countsArray.sort( function( a, b ){
    if( a.value < b.value )
        return -1;
    if( a.value > b.value )
        return 1;
    return 0;
} );


console.timeEnd( 'Count and sort Tokens' );


console.time( 'Select Tokens' );
//Remove the highest and least used tokens
var percent = 0.05,
    min = 0,
    max = countsArray[ countsArray.length - 1 ].value,
    lowerBound = Math.floor( max * percent ),
    upperBound = Math.floor( max - (max * percent) );

filtered = countsArray.filter( function( value ){
    return value.value > lowerBound && value.value < upperBound;
} );


var dict = [];
filtered.forEach( function( d ){
    dict.push( d.key );
} );

//dict is the new array of words sorted by use after the highest and lowest used words were taken out
console.timeEnd( 'Select Tokens' );


//build the training data that will be used for the neural network 
console.time( 'Build Training Data' );
var trainingData = [];

//using each thing in data again
for( e in data ){
    var entry = data[ e ];

    var signature = [];

    //sigSource is a new array created by combining two things to one array
    // it is crated with the headlines and bodies being converted to lowercase and tokenize to the base words including 
    // stop words, ignored, and the highest and lowest occurring words

    //example  console.log("i am waking up to the sounds of chainsaws".tokenizeAndStem()); will return [ 'wak', 'sound', 'chainsaw' ]

    var sigSource = [].concat( entry.headlines, entry.bodies ).toString().replace( /[^\w\s]|_/g, "" ).replace( /\s+/g, " " ).toLowerCase().tokenizeAndStem();
    var features = [];

    // it is checking if a word from dict within sigSource and if it is, it pushes 1 into signature and d into features
    // other wise it pushes 0 into signature 
    dict.forEach( function( d ){
        if( sigSource.indexOf( d ) > -1 ){
            signature.push( 1 );
            features.push( d );
        }
        else{
            signature.push( 0 )
        }
    } );

    var symbol = entry.symbol;
    var date = entry.date;

    var change = changeData[ symbol ][ date ];

    //it uses change to see if the symbol and date are within the clean and change data file if the entry is
    //found and has a 0 or 1 is pushes the signature into training data that will be used to create trianing.js

    if( change === 1 || change === 0 ){
        trainingData.push( {
            input: signature,
            output: { 'direction': change }
        } );
    }
}

console.timeEnd( 'Build Training Data' );

console.time( 'Write File' );


require( 'fs' ).writeFile( './training.js', JSON.stringify( trainingData ), function( err ){
        if( err ){
            console.error( 'Crap happens' );
        }
    }
);

console.timeEnd( 'Write File' );

//added comments by Abby Fisher