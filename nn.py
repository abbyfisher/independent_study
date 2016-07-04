from pybrain.datasets import SupervisedDataSet
from pybrain.tools.shortcuts import buildNetwork
from pybrain.supervised.trainers import BackpropTrainer
from pybrain.tools.customxml import NetworkWriter
from pybrain.tools.customxml import NetworkReader
import json
import random
from datetime import datetime


with open('training.js') as data_file:
    data = json.load(data_file)

training = []
testing = []
length = len(data)
midPoint = length / 1.2
index = 0


#midpoint selection


# length = len(data)
# midPoint = length / 1.2
# index = 0
#
# for row in data:
#	if index < midPoint:
# 		training.append([row['input'], [row['output']['direction']]])
# 	else:
# 		testing.append([row['input'], [row['output']['direction']]])
#	index += 1


#random selection

for row in data:
	rand = random.uniform(0, 1)
	if rand > 0.70:
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


hiddenLayers = features / 3

#241 inputs, three hidden and a single output neuron
net = buildNetwork(features, hiddenLayers, 1, bias=True)


trainer = BackpropTrainer(net, trainingDataSet, learningrate = 0.001, momentum = 0.99)
trainer.trainUntilConvergence(trainingData=trainingDataSet, maxEpochs=20)


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

#print "features: ", features
#print "total: ", total
#print "correct: ", correct
print "accuracy: ", accuracy


#save network for future use

filename = 'networks/newest/' + str(round(accuracy,3)) + '--' + datetime.now().strftime('%Y-%m-%d-%H-%M-%S') + '.xml'

NetworkWriter.writeToFile(net, filename)