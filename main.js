import express from 'express';
import { readFile } from 'fs/promises';
import { createVc, checkVc } from "./createvc.js";
import { protocolConfig, writeDwn, checkBookmarks } from './scripts.js'
import { Dwn, MessageStoreLevel, DataStoreLevel, EventLogLevel, DataStream } from '@tbd54566975/dwn-sdk-js';
import fs from 'fs';

const app = express();
app.use(express.json());
const messageStore = new MessageStoreLevel();
const dataStore = new DataStoreLevel();
const eventLog = new EventLogLevel();
const dwn = await Dwn.create({ messageStore, dataStore, eventLog });
const port = 3000;
let signingDid = JSON.parse(await readFile('./dids/firstdid-dwnversion.json', 'utf-8'));


app.get('/', (req, res, next) => {
 
      res.sendFile('index.html', { root: 'public' }); 
    
});


app.get('/checkBookmarks', async (req, res) => {
  try {
    const queryVcs = await checkBookmarks();
    const processedMessage3 = await dwn.processMessage(signingDid.did, queryVcs);
    const entries = processedMessage3.entries;
    
    const results = [
  ];
   
    await Promise.all(entries.map(async entry => {
      const receivedPres = JSON.parse(atob(entry.encodedData));
      const result = await checkVc(receivedPres.presentation.verifiableCredential);
      if (result && result[0]) {
        results.push(result[0]);
      }
    }));

    const listItems = results.map(result => `<li>${result}</li>`);
    res.send(`<ul>${listItems.join('')}</ul>`);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing bookmarks');
  }
  
});



app.post('/installProt', async (req, res) => {
  let protcolConfigMessage = await protocolConfig();
  const processedMessage = await dwn.processMessage(signingDid.did, protcolConfigMessage)
  res.send(processedMessage)
})

app.post('/createvc', async (req, res) => {
let whichDid = req.body.whichDid;
let whatText = req.body.whatText;
let createdResult = await createVc(whichDid, whatText);
let whichDidDwn = JSON.parse(await readFile(`./dids/${whichDid}-dwnversion.json`, 'utf-8'));
let schemaMessage = await writeDwn(createdResult,whichDidDwn)
const data2 = new TextEncoder().encode(JSON.stringify(createdResult))
const datastream = DataStream.fromBytes(data2)
const processedMessage2 = await dwn.processMessage(signingDid.did, schemaMessage, datastream)
res.send(processedMessage2)
})

app.get('/second', (req, res) => {
  res.sendFile('second.html', { root: 'public' })
});

app.get('/third', (req, res) => {
  res.sendFile('third.html', { root: 'public' })
});


app.listen(port)
