# google-news-neural-network

This project contains a corpus of text scraped from Google News queries for specific stock symbols, as well as 
historical stock prices for those symbols. 

The Node.js script `process-data.js` reads the data, performs NLP feature
extraction on the text, and builds a vectorized feature set of the news and stock data.

The Python script `nn.py` creates a neural network, selects a sample of the data for training, trains the network on 
the sample, and then runs tests against the network using the remaining sample data.

After installing Node and Python dependancies, run the following script to run through each process:

```
node process-data.js && python nn.py

```

For more detailed information, see the project Github page at http://mdjasper.github.io/google-news-neural-network/

Author: Michael Jasper <mdjasper@gmail.com>