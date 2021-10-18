import React, { useState, useEffect } from 'react';
import { getDistance, convertDistance } from 'geolib';
import './App.css'
import ReactModal from 'react-modal';
import MockConstants from './Mock.js'

require('dotenv').config();
var date = new Date();
var timestamp = MockConstants.mockDataOverride ? MockConstants.mockTime : date.getTime();
const numStations = 3
// PUT TRAIN_TRACKER_KEY HERE
const trainTrackerKey = "344088052b6d4c6a91bccd12775f34b3";
const Header = ({ text }) => {
    return (
        <div className="header-wrapper">
            <h1>{text}</h1>
        </div>
    )
}

const Card = ({ station, location, line }) => {
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
                                <path d="M12.5 0.916672C6.66668 0.916672 0.833344 1.64584 0.833344 6.75001V20.6042C0.833344 23.4188 3.12293 25.7083 5.93751 25.7083L3.75001 27.8958V28.625H7.00209L9.91876 25.7083H15.4167L18.3333 28.625H21.25V27.8958L19.0625 25.7083C21.8771 25.7083 24.1667 23.4188 24.1667 20.6042V6.75001C24.1667 1.64584 18.9458 0.916672 12.5 0.916672ZM5.93751 22.7917C4.72709 22.7917 3.75001 21.8146 3.75001 20.6042C3.75001 19.3938 4.72709 18.4167 5.93751 18.4167C7.14793 18.4167 8.12501 19.3938 8.12501 20.6042C8.12501 21.8146 7.14793 22.7917 5.93751 22.7917ZM11.0417 12.5833H3.75001V6.75001H11.0417V12.5833ZM13.9583 12.5833V6.75001H21.25V12.5833H13.9583ZM19.0625 22.7917C17.8521 22.7917 16.875 21.8146 16.875 20.6042C16.875 19.3938 17.8521 18.4167 19.0625 18.4167C20.2729 18.4167 21.25 19.3938 21.25 20.6042C21.25 21.8146 20.2729 22.7917 19.0625 22.7917Z" fill={Colors[line].hex} />
                            </svg>
                        </div>
                        <div>
                            <h1>{station.station_name}</h1>
                        </div>
                    </div>
                    <div className="card-text">{roundedDistance} miles</div>
                </div>
                {renderArrivals(station.etas[line], roundedDistance)}
            </div>
        </div>
    )
}

const Colors = {
    'red': { color: 'red', hex: '#D33D3D' },
    'org': { color: 'orange', hex: '#EF4925' },
    'y': { color: 'yellow', hex: '#F5E50B' },
    'g': { color: 'green', hex: '#109D49' },
    'blue': { color: 'blue', hex: '#17A0DB' },
    'brn': { color: 'brown', hex: '#62361C' },
    'p': { color: 'purple', hex: '#542E91' },
    'pink': { color: 'pink', hex: '#E37FA7' },
}

const renderArrivals = (etas, distance) => {
    return (
        etas !== undefined && etas.length > 0 ?
            <div className="content">{etas.map((eta, index) => (
                <div key={index} className="specific-line">
                    <div>{eta.destNm}</div>
                    <div>{disPlayMin((Date.parse(eta.arrT) - timestamp), distance)}</div>
                </div>

            ))}
            </div> : <div>No trains found</div>
    )
}

const StationList = ({ stations, location, lines }) => (
    <div className="card-wrapper">
        {stations.reduce((cards, station) => {
            const allowedLines = lines.length === 0 ? Object.keys(Colors) : lines
            for (const line of Object.keys(station.etas)) {
                if (allowedLines.includes(line) && station.etas[line] !== undefined) {
                    cards.push(<Card key={station.map_id + line} location={location} station={station} line={line} />);
                }
            }
            return cards
        }, [])}
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
            etas: {}
        }
    });
    return stationList;
}

const toggle = (x, lst) => (
    lst.includes(x) ? lst.filter(y => y !== x) : [x, ...lst]
);

const FilterCards = ({ selectedLines, setSelectedLines }) => (
    <div className='filter-card-list'>
        <FilterCard line='red' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='org' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='y' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='g' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='blue' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='p' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='pink' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
        <FilterCard line='brn' selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
    </div>
)

const FilterCard = ({ line, selectedLines, setSelectedLines }) => {
    const isSelected = selectedLines.includes(line);
    const style = {
        backgroundColor: isSelected ? 'lightgray' : 'white',
        marginBottom: '10px',
        width: '50%',
        minHeight: '60px',
    };

    return (
        <div className="card"
            id="card-bootstrap-override"
            style={style}
            onClick={() => setSelectedLines(toggle(line, selectedLines))}>
            <div className="card-body">
                <div className="card-title">{Colors[line].color}</div>
                <div className="icon-style">
                    <svg width="25" height="29" viewBox="0 0 25 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.5 0.916672C6.66668 0.916672 0.833344 1.64584 0.833344 6.75001V20.6042C0.833344 23.4188 3.12293 25.7083 5.93751 25.7083L3.75001 27.8958V28.625H7.00209L9.91876 25.7083H15.4167L18.3333 28.625H21.25V27.8958L19.0625 25.7083C21.8771 25.7083 24.1667 23.4188 24.1667 20.6042V6.75001C24.1667 1.64584 18.9458 0.916672 12.5 0.916672ZM5.93751 22.7917C4.72709 22.7917 3.75001 21.8146 3.75001 20.6042C3.75001 19.3938 4.72709 18.4167 5.93751 18.4167C7.14793 18.4167 8.12501 19.3938 8.12501 20.6042C8.12501 21.8146 7.14793 22.7917 5.93751 22.7917ZM11.0417 12.5833H3.75001V6.75001H11.0417V12.5833ZM13.9583 12.5833V6.75001H21.25V12.5833H13.9583ZM19.0625 22.7917C17.8521 22.7917 16.875 21.8146 16.875 20.6042C16.875 19.3938 17.8521 18.4167 19.0625 18.4167C20.2729 18.4167 21.25 19.3938 21.25 20.6042C21.25 21.8146 20.2729 22.7917 19.0625 22.7917Z" fill={Colors[line].hex} />
                    </svg>
                </div>
            </div>
        </div>
    );
};

function disPlayMin(timeStamp, distance) {

    if (MockConstants.mockDataOverride && MockConstants.mockTrainTimeUsingDist) {
        timeStamp += Math.min(40 * 60000 * distance, 15 * 60000);
    }

    var minTimeStamp = Math.floor((timeStamp) / 60000);
    
    if (minTimeStamp < 0) {
        return "Just Arrived";
    }
    else if (minTimeStamp <= 1) {
        return "Arriving Now";
    }
    else {
        return minTimeStamp + " mins";
    }
}

function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
}
//  alert(toTimestamp('02/13/2009 23:31:30'));

function App() {
    const [stations, setStations] = useState([])
    const [nearStations, setNearStations] = useState([])
    const [userLoc, setUserLoc] = useState();
    const [buttonClicked, setbuttonClicked] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLines, setSelectedLines] = useState([]);

    ReactModal.setAppElement('#root');

    const getLocation = async () => {
        if (MockConstants.mockDataOverride) {
            setUserLoc(MockConstants.mockUserLoc);
        }
        else {
            navigator.geolocation.getCurrentPosition(function (position) {
                setUserLoc(position.coords);
            });
        }
    }

    // const FilterButton = () => (
    //     <button className="btn btn-primary" onClick={openModal}>Filter</button>
    // )

    const openModal = () => {
        setModalVisible(true);
    }

    const HeaderMain = ({ text }) => {
        return (
            <div className="header-wrapper-main">
                <h1>{text}</h1>
                <div className="filterButtonWrapper" onClick={openModal}>
                    <svg width="27" height="19" viewBox="0 0 27 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5833 18.25H16.4167V15.3333H10.5833V18.25ZM0.375 0.75V3.66667H26.625V0.75H0.375ZM4.75 10.9583H22.25V8.04167H4.75V10.9583Z" fill="#5688DA"/>
                    </svg>  
                </div>
            </div>
        )
    }

    const closeModal = () => {
        updateNearStations(stations, selectedLines, numStations)
        setModalVisible(false);
    }

    const getTrainStops = async (url) => {
        const response = await fetch(url, { "app_token": "Bekodn643P417LZVWPfAeTldB" });
        if (!response.ok) throw response;
        const json = await response.json();
        const formattedStations = formatStations(json);
        setStations(formattedStations);
    }

    const stationHasLine = (station, line) => {
        for (const stop of station.stops) {
            if (stop[line] === true) {
                return true;
            }
        }
        return false;
    }

    const updateNearStations = async (stations, lines, k) => {
        const filtered_stations = lines.length ? stations.filter((station) => {
            for (const line of lines) {
                if (stationHasLine(station, line)) {
                    return true;
                }
            }
            return false;
        }) : stations;
        const kNearest = kNearestStations(filtered_stations, userLoc, k);
        updateEtas(kNearest, lines);
    }

    const kNearestStations = (stations, userLoc, k) =>
        sortByDist(stations, userLoc).slice(0, k);

    const updateEtas = async (stations, lines) => {
        const allowedLines = lines.length === 0 ? Object.keys(Colors) : lines
        for (let i = 0; i < stations.length; i++) {
            for (const line of allowedLines) {
                if (stationHasLine(stations[i], line)) {
                    if (MockConstants.mockDataOverride) {
                        stations[i].etas[line] = MockConstants.mockTrains[line];
                    }
                    else {
                        const train_url = `https://us-central1-ctway-api.cloudfunctions.net/app?key=${trainTrackerKey}&mapid=${stations[i].map_id}&rt=${line}&max=3&outputType=JSON`;
                        const response = await fetch(train_url);
                        // console.log(await response.json());
                        if (!response.ok) throw response;
                        const json = await response.json();
                        console.log(json.ctatt.eta);
                        stations[i].etas[line] = json.ctatt.eta;
                    }
                }
            }

        }
        setNearStations(stations);
    }

    useEffect(() => {
        getLocation();
        getTrainStops(stops_url);
    }, [])

    if (stations.length === 0 || !userLoc) {
        return (
            <div className="loading">
                <h1>Loading...</h1>
            </div>
        )
    };
    // if (!userLoc) return <h1>Awaiting user location...</h1>;

    if (buttonClicked === false) {
        return (
            <div className="app-wrapper">
                <Header text={"CTWay"} />
                <div className="button-wrapper">
                    <div className="button-style" onClick={() => {
                        updateNearStations(stations, selectedLines, numStations);
                        setbuttonClicked(true);
                    }}>
                        <svg width="63" height="79" viewBox="0 0 63 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M31.25 0L0 76.2083L2.95833 79.1667L31.25 66.6667L59.5417 79.1667L62.5 76.2083L31.25 0Z" fill="white" />
                        </svg>
                        <h1>Find Nearby Stations</h1>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="app-wrapper">
            <HeaderMain text={"Nearest Stations"} />
            {/* <FilterButton /> */}
            <StationList location={userLoc} stations={nearStations} lines={selectedLines} />
            <ReactModal isOpen={modalVisible} onRequestClose={closeModal}>
                <div className="modal-text">Filter by Line</div>
                <FilterCards selectedLines={selectedLines} setSelectedLines={setSelectedLines} />
                <button className="btn btn-primary" onClick={closeModal}>Close</button>
            </ReactModal>
        </div>
    );
}


export default App;
