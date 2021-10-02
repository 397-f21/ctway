import React, { useState, useEffect } from 'react';
import {getDistance} from 'geolib';


require('dotenv').config();

// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "344088052b6d4c6a91bccd12775f34b3";

const Header = () => {
    return (
        <h1>CTWay</h1>
    )
}

const Card = ({ station }) => {
    return (
        <div className="card">
            <div className="card-body">
                <div className="card-title">{station.stop_name}</div>
                <div className="card-text"></div>
            </div>
        </div>
    )
}

const StationList = ({ stations }) => (
    <div>
        { stations.map(station => <Card key={station.stop_id} station={ station } />) }
    </div>
)

// station.location = {latitude: ..., longitude...}
// userLoc = {latitude: ..., longitude...}
const sortByDist = (stations, userLoc) => {
    console.log(getDistance(stations[0].location, userLoc));
    return stations.sort((s1, s2) => getDistance(s1.location, userLoc) - getDistance(s2.location, userLoc));
}

const kNearestStations = (stations, userLoc, k) =>
    sortByDist(stations, userLoc).slice(0, k);


//const train_url = `http://lapi.transitchicago.com/api/1.0/ttfollow.aspx?key=${trainTrackerKey}&runnumber=830&outputType=JSON`;
const stops_url = 'https://data.cityofchicago.org/resource/8pix-ypme.json'

// const getTrainTracker = async (url) => {
//     console.log(trainTrackerKey);
//     console.log(url);
//     const response = await fetch(url,);
//     if (!response.ok) throw response;
//     const json = await response.json();
//     console.log(json);
// }

function App() {
    const [stations, setStations] = useState([])
    const [userLoc, setUserLoc] = useState([]);

    function getLocation(){
        navigator.geolocation.getCurrentPosition(function(position) {
            setUserLoc(position.coords);
        });
    }

    useEffect(() => {
        const getTrainStops = async (url) => {
            const response = await fetch(url, {"app_token": "Bekodn643P417LZVWPfAeTldB"});
            if (!response.ok) throw response;
            const json = await response.json();
            console.log(json);
            setStations(json);
        }
        //getTrainTracker(train_url);
        getTrainStops(stops_url);
        getLocation();
    }, [])

    if(!stations) return <h1>Awaiting stations...</h1>;
    if(!userLoc) return <h1>Awaiting user location...</h1>;
    
    return (
        <div>
            <Header />
            <StationList stations = {kNearestStations(stations, userLoc, 9)}/>
        </div>
    );
}


export default App;
