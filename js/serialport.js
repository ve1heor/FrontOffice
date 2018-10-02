const SerialPort = require('serialport');

const port = new SerialPort('COM1', {
  baudRate: 9600
});

const parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: '\r\n' }));

port.on('open', () => console.log('Port open'));

parser.on('data',  (data) => findByFullBarcode(data.toString()));