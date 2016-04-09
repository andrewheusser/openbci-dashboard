var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var argv = require('yargs').argv;
var OpenBCIBoard = require('openbci-sdk');
var dsp = require('dsp.js');
var io = require('socket.io')(http);

// Sockets
io.on('connection', function(socket){
    console.log('A user connected');
});

// Server
app.use(express.static(path.join(__dirname, '/app')));

app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '/app/index.html'));
});

http.listen(3030, function () {
    console.log('listening on port 3030');
});

// OpenBCI
var board = new OpenBCIBoard.OpenBCIBoard({
    verbose: true
});

board.autoFindOpenBCIBoard()
    .then(onBoardFind)
    .catch(function () {
        if (!!(argv._[0] && argv._[0] === 'simulate')) {
            board.connect(OpenBCIBoard.OpenBCIConstants.OBCISimulatorPortName)
                .then(onBoardConnect);
        }
    });

// Board find handler
function onBoardFind (portName) {if (portName) {
        console.log('board found', portName);
        board.connect(portName)
            .then(onBoardConnect);
    }
}

// Board connect handler
function onBoardConnect () {
    board.on('ready', onBoardReady);
}

// Board ready handler
function onBoardReady () {
    board.streamStart();
    board.on('sample', onSample);
}

// @TODO: Refactor
var bins = 128; // Approx .5 second
var frequencySample = 0;
var timeSample = 0;
var signals = [[],[],[],[],[],[],[],[]];
var spectrums = [[],[],[],[],[],[],[],[]];
var timeSeries = [[],[],[],[],[],[],[],[]];

// @TODO: Refactor
function onSample (sample) {
    console.log('sample', sample);
    frequencySample++;
    timeSample++;

    Object.keys(sample.channelData).forEach(function (channel, i) {
        signals[i].push(sample.channelData[channel]);
        timeSeries[i].push(sample.channelData[channel]);
    });

    if (frequencySample === bins) {

        signals.forEach(function (signal, index) {
            var fft = new dsp.FFT(bins, bins);
            console.log(fft);
            fft.forward(signal);
            spectrums[index] = parseObjectAsArray(fft.spectrum);

            // Apply log10
            spectrums[index] = spectrums[index].map(function (frequency) {
                return Math.log10(Math.pow(10, 6) * frequency);
            });
        });

        var scaler = 250 / bins;

        var labels = new Array(bins / 2).fill()
            .map(function (x, i) {
                return Math.ceil((i + 1) * scaler);
            });

        io.emit('openBCIFrequency', {
            spectrums: spectrums,
            labels: labels
        });
        frequencySample = 0;
        signals = [[],[],[],[],[],[],[],[]];
        spectrums = [[],[],[],[],[],[],[],[]];
    }

    if (timeSample === 50) {
        io.emit('openBCITimeSeries', {
            timeSeries: timeSeries,
            samplesTotal: 50
        });
        timeSample = 0;
        timeSeries = [[],[],[],[],[],[],[],[]];
    }

}

function parseObjectAsArray (obj) {
    var array = [];
    Object.keys(obj).forEach(function (key) {
        array.push(obj[key]);
    });
    return array;
}

/**
 * disconnectBoard
 */
function disconnectBoard () {
    board.streamStop()
        .then(function () {
            setTimeout(function () {
                board.disconnect();
                console.log('board disconnected');
            }, 50);
        });
}

process.on('exit', disconnectBoard.bind(null, { cleanup: true }));