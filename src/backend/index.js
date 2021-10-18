import fetch from 'node-fetch';
import express from 'express';

const app = express();
const port = 5000;

app.get('/', async (req, res) => {
  try {
    // const apiResponse = await fetch(`http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${trainTrackerKey}&mapid=${stations[i].map_id}&rt=${line}&max=3&outputType=JSON`);
    // const data = await apiResponse.text();
    const key = req.query.key;
    const mapid = req.query.mapid;
    const rt = req.query.rt;
    // const max = req.query.max;
    // const outputType = req.query.outputType;
    console.log(key);
    console.log(mapid);
    console.log(rt);
    const apiResponse = await fetch(`https://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${key}&mapid=${mapid}&rt=${rt}&max=3&outputType=JSON`);
    const apiResponseParsed = await apiResponse.json();
    console.log(apiResponseParsed);
    
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Content-Type', 'application/json');
    
    // res.send(data);
    res.send(apiResponseParsed);
  } catch (e) {
    console.error(e);
    res.status(500);
    res.send();
  }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})