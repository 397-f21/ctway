import React, { useState, useEffect } from 'react';

require('dotenv').config();

// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "";

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

const url = `http://lapi.transitchicago.com/api/1.0/ttfollow.aspx?key=${trainTrackerKey}&runnumber=830&outputType=JSON`;

const getTrainTracker = async (url) => {
    console.log(trainTrackerKey);
    console.log(url);
    const response = await fetch(url, {
        mode: 'no-cors',
    });
    if (!response.ok) throw response;
    const json = await response.json();
    console.log(json);
}

function App() {
    useEffect(() => getTrainTracker(url), [])

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
