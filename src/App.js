import React, { useState, useEffect } from 'react';
import { getDistance, convertDistance } from 'geolib';
import './App.css'


require('dotenv').config();

// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "344088052b6d4c6a91bccd12775f34b3";
const Header = () => {
    return (
        <div className="header-wrapper">
            <h1>Nearest Stations</h1>
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
                {station.etas ? renderArrivals(station.etas) : null}
                {/* <a className="card-text" href={directionsURL}>Directions</a> */}
            </div>
        </div>
    )
}

const renderArrivals = (etas) => {
    console.log(etas);
    return (
        etas.length <= 0 ? null :
            <div>{etas.map((eta) => (
                <div key={eta.arrT} className="card-text">Arrival Time: {eta.arrT}</div>
            ))}
            </div>
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

const updateEtas = (stations) => {
    console.log(stations);
    return stations;
    // return stations.map(async (station) => {
    //     console.log(station.map_id);
    //     // const etas = [{arrT: 5}, {arrT: 6}, {arrT: 8}]
    //     const train_url = `https://cors-anywhere.herokuapp.com/http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${trainTrackerKey}&mapid=${station.map_id}&max=5&outputType=JSON`;
    //     const etas = await getTrainTracker(train_url);
    //     station.etas = etas;
    //     return station;
    // });
}

const stops_url = 'https://data.cityofchicago.org/resource/8pix-ypme.json'

const getTrainTracker = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw response;
    const json = await response.json();
    console.log(json.ctatt.eta);
}

const formatStations = (ctaData) => {
    const stationMap = ctaData.reduce((stations, ctaStop) => {
        const station = (stations[ctaStop.map_id] || []);
        station.push(ctaStop);
        stations[ctaStop.map_id] = station;
        return stations;
    }, {});

    const stationList = Object.keys(stationMap).map((map_id) => {
        if (stationMap.hasOwnProperty(map_id)) {
            const location = stationMap[map_id][0].location;
            const station_name = stationMap[map_id][0].station_name;
            return {
                map_id: map_id,
                location: location,
                station_name: station_name,
                stops: stationMap[map_id]
            }
        }
    });
    return stationList;
}

function App() {
    const [stations, setStations] = useState([])
    const [nearStations, setNearStations] = useState([])
    const [userLoc, setUserLoc] = useState();

    // const getLocation = async () => {
    //     const pos = await new Promise((resolve, reject) => {
    //         navigator.geolocation.getCurrentPosition(resolve, reject);
    //     });
    //     // console.log(pos.coords);
    //     // setUserLoc(pos.coords);
    //     return pos.coords;
    // }

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
    // const updateNearStations = async (stations, k) => {
    //     console.log(userLoc);
    //     const kNearest = kNearestStations(stations, userLoc, k);
    //     // const kNearestEta = await updateEtas(kNearest);
    //     setNearStations(kNearest);
    // }
    useEffect(() => {
        // const gatherData = async () => {
        //     const location = await getLocation();
        //     // const getTrainStopsPromise = getTrainStops(stops_url);
        //     // await getTrainStopsPromise;
        //     console.log(location);
        //     setUserLoc(location);
        //     console.log(userLoc);
        //     console.log('done');
        //     updateNearStations(stations, 1);
        // }
        // gatherData();
        getLocation();
        getTrainStops(stops_url);
    }, [])

    if (stations.length === 0) return <h1>Awaiting stations...</h1>;
    if (!userLoc) return <h1>Awaiting user location...</h1>;

    // useEffect(() => {
    //     setNearStations(kNearestStations(stations, userLoc, 1));
    // })

    return (
        <div className="app-wrapper">
            <Header />
            <StationList location={userLoc} stations={kNearestStations(stations, userLoc, 3)} />
        </div>
    );
}


export default App;
