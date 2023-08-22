import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import { Treemap } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import CustomizedContent from "../../components/CustomContentTreemap";
import Modal from "../../components/Modal";
import { Typewriter } from 'react-simple-typewriter';
import CountriesSearch from "../../components/CountriesSearch";
import { downloadChart, isLarge, isMobile, formatNumberAbbreviation, NodeAPI, codes, iso, coordinates, flags } from "../../utils/commons";
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import HomeTagCloudM from "../../components/HomeTagCloudM";
import { TagCloud } from 'react-tagcloud'
import uniqolor from 'uniqolor';

export default function NewHome() {

    axios.defaults.baseURL = NodeAPI;

    const columns = [
        {
            cell: row => <img src={row.picture} width="30px" className="w3-circle" />,
            width: '30px',
            style: {
                padding: '10px'
            }
        },
        {
            name: 'keyword',
            width: '150px',
            selector: row => <div title={row.title}>{row.title}</div>,
            sortable: true
        },
        {
            name: 'description',
            width: '300px',
            selector: row => row.description,
            sortable: true
        },
        {
            name: 'traffic',
            width: '150px',
            selector: row => row.traffic,
            format: row => formatNumberAbbreviation(row.traffic) + '+',
            sortable: true
        },
        {
            name: 'public date',
            width: '200px',
            selector: row => row.pubDate,
            format: row => formatToBrowserTimezone(row.pubDate),
            sortable: true
        },
        {
            name: 'country',
            width: '200px',
            selector: row => row.country,
            sortable: true
        },
        {
            cell: row => <Link target="_blank" to={'https://www.google.com/search?q=' + encodeURIComponent(row.title)} className="w3-button w3-light-gray w3-round-large" title="Google" ><i style={{ color: '#fbbc05' }} className="fa fa-google" aria-hidden="true"></i>oogle</Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        },
        {
            cell: row => <Link to={`/analytics/${row.title}`} className="w3-button w3-light-gray w3-round-large" title="Quora" ><i style={{ color: '#a82400' }} className="fa fa-quora" aria-hidden="true"></i>uora</Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        },
    ];

    const [tblData, setTblData] = useState(null);
    const [tblDataCopy, setTblDataCopy] = useState([]);
    const [treeMapData, setTreeMapData] = useState(null);
    const [geoMapData, setGeoMapData] = useState(null);
    const [maxTraffic, setMaxTraffic] = useState(0);
    const [tagCloudData, setTagCloudData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [countryColors, setCountryColors] = useState({});

    function formatToBrowserTimezone(datetimeString) {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric"
        };

        return new Date(datetimeString).toLocaleString(undefined, options);
    }

    useEffect(() => {
        initialize();
    }, []);

    const initialize = () => {
        const changeState = (trendingsearches) => {
            setTimeout(() => {
                document.title = `Trendy world | V2`
            }, 250)
            const groupedData = trendingsearches.reduce((result, itemGroup) => {
                itemGroup.forEach(item => {
                    const { country } = item;
                    if (!result[country]) {
                        result[country] = [];
                    }
                    result[country].push(item);
                });
                return result;
            }, {});
            setRawData(groupedData);
            const dataTable = [], treeMap = [], pieChart = [], geoMap = [], tagCloud = [], colors = {};
            for (const [countryCode, trends] of Object.entries(groupedData)) {
                const country = iso[countryCode];
                const totalTraffic = trends.reduce((sum, item) => sum + item.traffic, 0)
                pieChart.push({ name: country, value: totalTraffic })
                treeMap.push({ name: codes[country], size: totalTraffic })
                geoMap.push({ country, totalTraffic, lnglat: coordinates[country] })
                tagCloud.push({ value: country, count: totalTraffic })
                for (const trend of trends) {
                    dataTable.push({ ...trend, country })
                }
            }
            setMaxTraffic(geoMap.reduce((max, item) => {
                return item.totalTraffic > max ? item.totalTraffic : max;
            }, 0))
            treeMap.sort((a, b) => b.size - a.size);
            treeMap.forEach(({ name }) => colors[name] = uniqolor.random()['color'])
            setCountryColors(colors)
            setTreeMapData(treeMap)
            setGeoMapData(geoMap)
            setTblData(dataTable.sort((a, b) => b.traffic - a.traffic));
            setTblDataCopy(dataTable.sort((a, b) => b.traffic - a.traffic));
            setTagCloudData(tagCloud);
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.post('/getTrends', {
                    fromTime: new Date().setHours(0, 0, 0, 0) - 24 * 60 * 60 * 1000
                });
                toast.update(toastID, { render: "Successfully Completed", type: toast.TYPE.SUCCESS, autoClose: 1000, isLoading: false, hideProgressBar: true })
                return res.data
            } catch (error) {
                toast.update(toastID, { render: error.message, type: toast.TYPE.ERROR, autoClose: 1000, isLoading: false, hideProgressBar: true })
                return []
            }
        }

        const fetchRenderSave = async () => {
            // get data from API 
            const apiData = await getDataFromAPI();
            if (apiData.length === 0) {
                toast.info("Please try again in a few minutes", { autoClose: 1500, hideProgressBar: true });
                return
            }
            // do state changes 
            changeState(apiData);
            // save data in local storage 
            const store_data = {
                "created": Date.now(),
                "resource": JSON.stringify(apiData)
            }
            sessionStorage.setItem('treasureV2', JSON.stringify(store_data))
        }

        const treasure = sessionStorage.getItem('treasureV2');
        if (!treasure) {
            // If there is no data in the local storage or requests new list
            console.log('there is no data in the local storage');
            fetchRenderSave()
            return
        }
        const { created, resource } = JSON.parse(treasure);
        const now = Date.now();
        const is_data_old = (now - created) > (15 * 60 * 1000)
        if (is_data_old) {
            // If the data is more than 15 minutes old
            console.log('data is more than 15 minutes old');
            fetchRenderSave();
            return
        }
        // do state changes 
        changeState(JSON.parse(resource));
    }

    const [filterText, setFilterText] = useState('');

    const filterKeywords = (e) => {
        const inputValue = e.target.value.toLowerCase();

        if (e.nativeEvent.inputType === 'insertText') {
            setFilterText(inputValue);
            const filteredData = tblData.filter(
                trend => trend.title && trend.title.toLowerCase().includes(inputValue)
            );
            setTblData(filteredData);
        } else {
            setFilterText(inputValue);

            if (inputValue === '') {
                setTblData(tblDataCopy);
                return;
            }

            if (tblDataCopy.length === 0) {
                setTblData(tblDataCopy);
                return;
            }

            const filteredData = tblDataCopy.filter(
                trend => trend.title.toLowerCase().includes(inputValue)
            );
            setTblData(filteredData);
        }
    };

    const resetFilter = () => {
        setFilterText('');
        setTblData(tblDataCopy);
    }

    const popScale = useMemo(
        () => scaleLinear().domain([0, maxTraffic]).range([0, 24]),
        [maxTraffic]
    );

    const [showTagCloud, setShowTagCloud] = useState(null);
    const openModal = (code) => {
        try {
            let country = iso[code], trends = rawData[code], flag = flags[code];
            setShowTagCloud({ country, trends, flag });
        } catch (error) {
            console.log(error.message);
        }
    }

    const customRenderer = (tag, size, color) => {
        return (
            <span key={tag.value} style={{ color, fontWeight: 400, fontSize: `${size}px`, margin: '1px', paddingRight: '3px', cursor: 'cell' }} className='w3-tag w3-transparent'>
                {tag.value}<sup style={{ color: '#333' }}>{formatNumberAbbreviation(tag.count)}+</sup>
            </span>
        )
    }

    const [country, setCountry] = useState(null);
    const [color, setColor] = useState('');
    const [chartData, setChartData] = useState(null);

    const treeMapHandler = (e) => {
        const data = rawData[e.name]
        if (data.length === 0) return
        setCountry(iso[e.name]);
        console.log(countryColors);
        setColor(countryColors[e.name]);
        setChartData(data.map(({ title, traffic }) => ({ name: title, size: traffic })));
    }

    return (
        <div className="">
            <ToastContainer />
            <div className="w3-center w3-padding-32" style={{ color: '#2196F3' }}>
                <div className="w3-xlarge">
                    <b className="w3-opacity">TRENDY WORLD</b>
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
                <CountriesSearch />
                <Link to="/" className='w3-button w3-small w3-border w3-round-xlarge'>↩ Back To Home</Link>
            </div>

            {/* geo map  */}
            {
                geoMapData && (
                    <div className="w3-content" style={{ paddingTop: 15 }}>
                        <div className="w3-center">
                            <div className="chart-details">Explore Locations and Discover Insights Worldwide.</div>
                        </div>
                        <p>
                            <button title="Click to download the symbol map" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('geoChart') }}>download ⤵</button>
                        </p>
                        <div id="geoChart" className="w3-center">
                            <div className="w3-border w3-round-xlarge" style={{ backgroundColor: '#607d8bc4' }}>
                                <ComposableMap projectionConfig={{ rotate: [-20, 0, 0] }}>
                                    <Geographies geography={"/geo.json"}>
                                        {({ geographies }) =>
                                            geographies.map((geo) => (
                                                <Geography key={geo.rsmKey} geography={geo} fill="#DDD" />
                                            ))
                                        }
                                    </Geographies>
                                    {geoMapData.map(({ country, totalTraffic, lnglat }) => {
                                        return (
                                            <Marker key={country} coordinates={lnglat} onClick={() => openModal(codes[country])}>
                                                <circle fill="#F53" stroke="#FFF" r={popScale(totalTraffic)} />
                                                <text
                                                    textAnchor="middle"
                                                    y={5}
                                                    style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: 10, fontWeight: 550, cursor: 'cell' }}
                                                >
                                                    {codes[country]}
                                                </text>
                                            </Marker>
                                        );
                                    })}
                                </ComposableMap>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* tag cloud  */}
            {
                tagCloudData && (
                    <div className="w3-content w3-padding-32" >
                        <div className="w3-center w3-padding">
                            <div className="chart-details">Discover What's Hot and Relevant Now.</div>
                        </div>
                        <p style={{ lineHeight: 1.8 }} className="w3-justify">
                            <TagCloud
                                minSize={isMobile() ? 7 : 15}
                                maxSize={isMobile() ? 15 : 36}
                                tags={tagCloudData}
                                className="w3-tag w3-transparent"
                                onClick={({ value }) => { openModal(codes[value]); }}
                                renderer={customRenderer}
                            />
                        </p>
                    </div>
                )
            }
            {/* data table  */}
            {
                tblData && (
                    <div className="">
                        <div className="w3-content w3-padding-32">
                            <div className="w3-center w3-padding">
                                <div className="chart-details">Organized Information at a Glance.</div>
                            </div>
                            <p style={{ paddingBottom: 32 }}>
                                <span className="w3-right">
                                    <input
                                        type="text"
                                        size="25"
                                        value={filterText}
                                        className="w3-border"
                                        placeholder="Search keyword..."
                                        style={{ padding: '10px 5px' }}
                                        onInput={filterKeywords}
                                    />
                                    <button
                                        className="w3-button w3-border w3-blue"
                                        style={{ padding: '10px' }}
                                        onClick={resetFilter}
                                        title="Clear"
                                    >✖</button>
                                </span>
                            </p>
                            <DataTable
                                columns={columns}
                                data={tblData}
                                pagination
                                responsive
                            />
                        </div>
                    </div>
                )
            }

            {/* treemap  */}
            {
                treeMapData && window && (
                    <div className="">
                        <div className="w3-content w3-padding-32">
                            <div className="w3-center">
                                <div className="chart-details">Exploring Hierarchical Data in a Compact View.</div>
                            </div>
                            <p>
                                <button title="Click to download the treemap" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('treemap') }}>download ⤵</button>
                            </p>
                            <div id="treemap" className={window && isMobile() ? 'w3-responsive' : ''}>
                                <Treemap
                                    width={isLarge() ? 1280 : window.innerWidth}
                                    height={isLarge() ? 640 : window.innerWidth / 2}
                                    data={treeMapData}
                                    dataKey="size"
                                    aspectRatio={4 / 3}
                                    stroke="#fff"
                                    content={<CustomizedContent colors={treeMapData.map(data => uniqolor.random()['color'])} />}
                                    onClick={treeMapHandler}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* modals  */}
            {
                country && chartData &&
                <Modal country={country} color={color} chartData={chartData} setChartData={setChartData} />
            }
            {
                showTagCloud && (
                    <HomeTagCloudM toast={toast} showTC={showTagCloud} setShowTC={setShowTagCloud} />
                )
            }
        </div>
    );
}
