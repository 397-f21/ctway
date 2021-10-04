import React, { useState, useEffect } from 'react';
import {getDistance, convertDistance} from 'geolib';


require('dotenv').config();

// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "344088052b6d4c6a91bccd12775f34b3";
const Header = () => {
    return (
        <h1>CTWay</h1>
    )
}

const Card = ({ station, location }) => {
    const formattedLoc = {
        latitude: location.latitude,
        longitude: location.longitude
    }
    const formattedStationLoc = {
        latitude: parseFloat(station.location.latitude),
        longitude: parseFloat(station.location.longitude)
    }

    const distanceToMiles = convertDistance(getDistance(formattedLoc, formattedStationLoc), 'mi');
    const roundedDistance = Math.round(distanceToMiles * 100) / 100;

    return (
        <div className="card">
            <div className="card-body">
                <div className="card-title">{station.stop_name}</div>
                <div className="card-text">{roundedDistance} miles</div>
            </div>
        </div>
    )
}

const StationList = ({ stations, location }) => (
    <div>
        { stations.map(station => <Card key={station.stop_id} location={location} station={ station } />) }
    </div>
)

// station.location = {latitude: ..., longitude...}
// userLoc = {latitude: ..., longitude...}
const sortByDist = (stations, userLoc) => {
    // console.log(stations)
    console.log(userLoc);
    const formattedUserLoc = {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude
    }
    console.log(getDistance(stations[0].location, formattedUserLoc));
    return stations.sort((s1, s2) => {
        const s1LocFormat = {
            latitude: parseFloat(s1.location.latitude),
            longitude: parseFloat(s1.location.longitude)
        };
        const s2LocFormat = {
            latitude: parseFloat(s2.location.latitude),
            longitude: parseFloat(s2.location.longitude)
        };
        return getDistance(s1LocFormat, formattedUserLoc) - getDistance(s2LocFormat, formattedUserLoc)
    });
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

const stationsMapped = {}

function App() {
    const [stations, setStations] = useState([])
    const [userLoc, setUserLoc] = useState();

    const getLocation = async () => {
        navigator.geolocation.getCurrentPosition(function(position) {
            setUserLoc(position.coords);
        });
    }
    const getTrainStops = async (url) => {
        const response = await fetch(url, {"app_token": "Bekodn643P417LZVWPfAeTldB"});
        if (!response.ok) throw response;
        const json = await response.json();
        console.log(json);
        setStations(json);
    }
    useEffect(() => {
        //getTrainTracker(train_url);
        getLocation();
        getTrainStops(stops_url);
    }, [])

    if(stations.length === 0) return <h1>Awaiting stations...</h1>;
    if(!userLoc) return <h1>Awaiting user location...</h1>;
    
    return (
        <div>
            <Header />
            <StationList location={userLoc} stations={kNearestStations(stations, userLoc, 9)}/>
        </div>
    );
}


export default App;
