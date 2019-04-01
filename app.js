const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const { Connection, Statement } = require('idb-pconnector');
const PDFDocument = require('pdfkit');
const fs = require('fs');


const connection = new Connection({ url: '*LOCAL' });
const statement = new Statement(connection);

const app = express();

// Define our function for sending SMS
async function sendSMS(name, targetNumber) {
  const twilioSid = 'AC155fd44f0237d699c2836925652c688a';
  const twilioAuth = `${process.env.TWILIO_AUTH}`;
  const client = require('twilio')(twilioSid, twilioAuth);

  const sid = await client.messages.create({
     body: `Your visitor ${name} has arrived at the front desk. Please come down to meet them.`,
     from: '+12028581285',
     to: targetNumber
   });
}

async function generateBadge(name) {
  let doc = new PDFDocument({
    layout: 'landscape',
    size: [337, 212] // a smaller document for small badge printers
  });

  doc.pipe(fs.createWriteStream('badge.pdf'));
  doc.image('download.png', 31, 25, {width: 150});
  doc.text(`${name}`, {
    width: 212,
    align: 'center'
  });
  doc.end();
}

// Permit the app to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Use body-parser as middleware for the app.
app.use(bodyParser.json());
 
app.get('/', async function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/registration', async function(req, res) {
  // massage the data passed by the form
  const name = `${req.body.firstName} ${req.body.lastName}`;
  const hostId = Number(req.body.employeeHost);

  // await statement.exec(`INSERT INTO BCH.VISITORS(VISITOR_NAME, HOST_ID) VALUES('${name}', ${hostId})`);

  // // get the host's cell phone number, and send a message indicating the visitor has arrived
  // const hostRow = await statement.exec(`SELECT CELL_NUMBER FROM BCH.EMPLOYEES WHERE EMPLOYEE_ID=${hostId}`);
  // sendSMS(name, `+${hostRow[0].CELL_NUMBER}`);
  generateBadge(name);
  
  res.send('all done!');
})
 
app.listen(3031);
console.log('App has started');