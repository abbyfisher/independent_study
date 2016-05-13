from pybrain.datasets import SupervisedDataSet
from pybrain.tools.shortcuts import buildNetwork
from pybrain.supervised.trainers import BackpropTrainer
from pybrain.tools.customxml import NetworkWriter
from pybrain.tools.customxml import NetworkReader
import json
import random
from datetime import datetime

filename = 'networks/0.824--2015-11-17-22-51-18.xml'


with open('training.js') as data_file:
    data = json.load(data_file)

training = []
testing = []

for row in data:
	rand = random.uniform(0, 1)
	if rand > 0.50:
		training.append([row['input'], [row['output']['direction']]])
	else:
		testing.append([row['input'], [row['output']['direction']]])

features = len(training[0][0])


#create training set
trainingDataSet = SupervisedDataSet(features, 1)
for input, target in training:
    trainingDataSet.addSample(input, target)


#create testing set
testingDataSet = SupervisedDataSet(features, 1)
for input, target in testing:
	testingDataSet.addSample(input, target)



net = NetworkReader.readFrom(filename)

#measure success

total = 0
correct = 0

for input, output in training:
	guess = net.activate(input)
	if output[0] == round(guess):
		correct += 1
	total += 1

	#print output[0], ',', guess[0]

accuracy = correct/float(total)

print "total: ", total
print "correct: ", correct
print "accuracy: ", accuracy

