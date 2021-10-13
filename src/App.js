import React, { useState, useEffect } from 'react';
import { getDistance, convertDistance } from 'geolib';
import './App.css'


require('dotenv').config();
var date = new Date();
var timestamp = date.getTime();
// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "344088052b6d4c6a91bccd12775f34b3";
const Header = ({text}) => {
    return (
        <div className="header-wrapper">
            <h1>{text}</h1>
        </div>
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
    const directionsURL = `https://www.google.com/maps/dir/?api=1&origin=${location.latitude}%2C${location.longitude}&destination=${station.location.latitude}%2C${station.location.longitude}&travelmode=walking`

    return (
        <div className="card" id="card-bootstrap-override" onClick={() => { window.open(directionsURL) }}>
            <div className="card-body">
                <div className="card-title">
                    <div>
                        <div className="icon-style">
                            <svg width="25" height="29" viewBox="0 0 25 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12.5 0.916672C6.66668 0.916672 0.833344 1.64584 0.833344 6.75001V20.6042C0.833344 23.4188 3.12293 25.7083 5.93751 25.7083L3.75001 27.8958V28.625H7.00209L9.91876 25.7083H15.4167L18.3333 28.625H21.25V27.8958L19.0625 25.7083C21.8771 25.7083 24.1667 23.4188 24.1667 20.6042V6.75001C24.1667 1.64584 18.9458 0.916672 12.5 0.916672ZM5.93751 22.7917C4.72709 22.7917 3.75001 21.8146 3.75001 20.6042C3.75001 19.3938 4.72709 18.4167 5.93751 18.4167C7.14793 18.4167 8.12501 19.3938 8.12501 20.6042C8.12501 21.8146 7.14793 22.7917 5.93751 22.7917ZM11.0417 12.5833H3.75001V6.75001H11.0417V12.5833ZM13.9583 12.5833V6.75001H21.25V12.5833H13.9583ZM19.0625 22.7917C17.8521 22.7917 16.875 21.8146 16.875 20.6042C16.875 19.3938 17.8521 18.4167 19.0625 18.4167C20.2729 18.4167 21.25 19.3938 21.25 20.6042C21.25 21.8146 20.2729 22.7917 19.0625 22.7917Z" fill="#542E91" />
                            </svg>
                        </div>
                        <div>
                            <h1>{station.station_name}</h1>
                        </div>
                    </div>
                    <div className="card-text">{roundedDistance} miles</div>
                </div>
                
                {renderArrivals(station.etas)}
                {/* <a className="card-text" href={directionsURL}>Directions</a> */}
            </div>
        </div>
    )
}

const Colors = {
    'P' : 'Purple'
}

const renderArrivals = (etas) => {
    console.log(etas)
    return (
        etas.length > 0 ?
            <div className="content">{etas.map((eta, index) => (
                <div key={index} className="specific-line">
                    <div>{eta.destNm}</div>
                    <div>{disPlayMin((Date.parse(eta.arrT) - timestamp))}</div>
                </div>

            ))}
            </div> : null
    )
}

const StationList = ({ stations, location }) => (
    <div className="card-wrapper">
        {stations.map(station => <Card key={station.map_id} location={location} station={station} />)}
    </div>
)

// station.location = {latitude: ..., longitude...}
// userLoc = {latitude: ..., longitude...}
const sortByDist = (stations, userLoc) => {
    const formattedUserLoc = {
        latitude: userLoc.latitude,
        longitude: userLoc.longitude
    }
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

const stops_url = 'https://data.cityofchicago.org/resource/8pix-ypme.json'

const formatStations = (ctaData) => {
    const stationMap = ctaData.reduce((stations, ctaStop) => {
        const station = (stations[ctaStop.map_id] || []);
        station.push(ctaStop);
        stations[ctaStop.map_id] = station;
        return stations;
    }, {});

    const stationList = Object.keys(stationMap).map((map_id) => {
        const location = stationMap[map_id][0].location;
        const station_name = stationMap[map_id][0].station_name;
        return {
            map_id: map_id,
            location: location,
            station_name: station_name,
            stops: stationMap[map_id],
            etas: []
        }
    });
    return stationList;
}

const FilterButton = () => (
    <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#filter">Filter</button>
)

const FilterCard = () => (
    <div className="modal fade" id="filter" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
            <div className="modal-content">
            <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
                ...
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" className="btn btn-primary">Save changes</button>
            </div>
            </div>
        </div>
    </div>

)

function disPlayMin(timeStamp){

    var minTimeStamp = Math.floor((timeStamp)/60000);

    if (minTimeStamp < 0){
        return "Just Arrived";
    }
    else if(minTimeStamp <= 1){
        return "Arriving Now";
    }
    else{
        return minTimeStamp + " mins";
    }
}

function toTimestamp(strDate){
    var datum = Date.parse(strDate);
    return datum/1000;
 }
//  alert(toTimestamp('02/13/2009 23:31:30'));

function App() {
    const [stations, setStations] = useState([])
    const [nearStations, setNearStations] = useState([])
    const [userLoc, setUserLoc] = useState();
    const [buttonCLicked, setButtonClicked] = useState(false);

    const getLocation = async () => {
        navigator.geolocation.getCurrentPosition(function (position) {
            setUserLoc(position.coords);
        });
    }

    const getTrainStops = async (url) => {
        const response = await fetch(url, { "app_token": "Bekodn643P417LZVWPfAeTldB" });
        if (!response.ok) throw response;
        const json = await response.json();
        const formattedStations = formatStations(json);
        setStations(formattedStations);
    }

    const updateNearStations = async (stations, k) => {
        const kNearest = kNearestStations(stations, userLoc, k);
        updateEtas(kNearest);
    }

    const kNearestStations = (stations, userLoc, k) =>
        sortByDist(stations, userLoc).slice(0, k);

    const updateEtas = async (stations) => {
        for (let i = 0; i < stations.length; i++) {
            const train_url = `https://cors-anywhere.herokuapp.com/http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${trainTrackerKey}&mapid=${stations[i].map_id}&max=3&outputType=JSON`;
            const response = await fetch(train_url);
            if (!response.ok) throw response;
            const json = await response.json();
            stations[i].etas = json.ctatt.eta;
        }
        setNearStations(stations);
    }

    useEffect(() => {
        getLocation();
        getTrainStops(stops_url);
    }, [])

    if (stations.length === 0 || !userLoc){
        return (
            <div className="loading">
                <h1>Loading...</h1>
            </div>
        )
    };
    // if (!userLoc) return <h1>Awaiting user location...</h1>;

    if (buttonCLicked === false){
        return(
            <div className="app-wrapper">
                <Header text={"Find Nearby Stations"}/>
                <div className = "button-wrapper">
                    <div className="button-style" onClick={() => {
                        updateNearStations(stations, 3);
                        setButtonClicked(true);
                    }}>
                        <svg width="63" height="79" viewBox="0 0 63 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M31.25 0L0 76.2083L2.95833 79.1667L31.25 66.6667L59.5417 79.1667L62.5 76.2083L31.25 0Z" fill="white"/>
                        </svg>
                        <h1>Current Location</h1>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="app-wrapper">
            <Header text={"Nearest Stations"}/>
            <FilterButton />
            <StationList location={userLoc} stations={nearStations} />
            <FilterCard />
        </div>
    );
}


export default App;
