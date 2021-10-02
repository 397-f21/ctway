import React, { useState, useEffect } from 'react';

require('dotenv').config();

// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "344088052b6d4c6a91bccd12775f34b3";

const Header = () => {
    return (
        <h1>CTWay</h1>
    )
}

const Card = () => {
    return (
        <div className="card">
            <div className="card-body">
                <div className="card-title">Brynmar</div>
                <div className="card-text">Red Line</div>
            </div>
        </div>
    )
}

const train_url = `http://lapi.transitchicago.com/api/1.0/ttfollow.aspx?key=${trainTrackerKey}&runnumber=830&outputType=JSON`;
const stops_url = 'https://data.cityofchicago.org/resource/8pix-ypme.json'

const getTrainStops = async (url) => {
    const response = await fetch(url, {"app_token": "Bekodn643P417LZVWPfAeTldB"});
    if (!response.ok) throw response;
    const json = await response.json();
    console.log(json);
}

const getTrainTracker = async (url) => {
    console.log(trainTrackerKey);
    console.log(url);
    const response = await fetch(url,);
    if (!response.ok) throw response;
    const json = await response.json();
    console.log(json);
}

function App() {
    useEffect(() => {
        getTrainTracker(train_url);
        getTrainStops(stops_url);
    }, [])
    
    return (
        <div>
            <Header />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
            <Card />
        </div>
    );
}

export default App;
