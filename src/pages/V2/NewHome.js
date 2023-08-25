import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import { Treemap } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import CustomizedContent from "../../components/CustomContentTreemap";
import Modal from "../../components/Modal";
import { Typewriter } from 'react-simple-typewriter';
import CountriesSearch from "../../components/CountriesSearch";
import { downloadChart, isLarge, isMobile, formatNumberAbbreviation, NodeAPI, codes, iso, coordinates, flags, content } from "../../utils/commons";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import HomeTagCloudM from "../../components/HomeTagCloudM";
import { TagCloud } from 'react-tagcloud'
import uniqolor from 'uniqolor';
import moment from "moment";
import Swal from "sweetalert2";
import CountrySelectModal from "../../components/CountrySelectModal";
import { Grid } from 'react-loader-spinner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
            format: row => <div title={formatToBrowserTimezone(row.pubDate)}>{formatToBrowserTimezone(row.pubDate)}</div>,
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
    const [tagCloudData, setTagCloudData] = useState(null);
    const [rawData, setRawData] = useState([]);

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

    const [fromTime, setFromTime] = useState(moment().startOf('day').valueOf());
    const [toTime, setToTime] = useState(moment().valueOf());
    const [countries, setCountries] = useState([]);
    const [isFilterChanged, setIsFilterChanges] = useState(false);

    useEffect(() => {
        initialize();
    }, [isFilterChanged]);

    const initialize = async () => {
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
            const dataTable = [], treeMap = [], pieChart = [], geoMap = [], tagCloud = [];
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
            treeMap.sort((a, b) => b.size - a.size);
            setTreeMapData(treeMap)
            setGeoMapData(geoMap)
            setTblData(dataTable.sort((a, b) => b.traffic - a.traffic));
            setTblDataCopy(dataTable.sort((a, b) => b.traffic - a.traffic));
            setTagCloudData(tagCloud);
            setIsFilterChanges(false);
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.post('/getTrends', {
                    fromTime,
                    toTime,
                    countries
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
                "resource": JSON.stringify(apiData),
                "from_time": fromTime,
                "to_time": toTime,
                "countries_": JSON.stringify(countries)
            }
            sessionStorage.setItem('treasureV2', JSON.stringify(store_data))
        }

        const treasure = sessionStorage.getItem('treasureV2');
        if (!treasure || isFilterChanged) {
            // If there is no data in the local storage or requests new list
            console.log(isFilterChanged ? 'filter changed(start fetching...)' : 'data does not exist in session storage(start fetching...)');
            await fetchRenderSave()
            setIsFilterChanges(false)
            return
        }
        console.log('data exists in session storage');
        const { resource, from_time, to_time, countries_ } = JSON.parse(treasure);
        setFromTime(from_time)
        setToTime(to_time)
        setCountries(JSON.parse(countries_))
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
        const data = rawData[e.name] || [];
        if (data.length === 0) return
        data.sort((a, b) => b.traffic - a.traffic);
        setCountry(iso[e.name]);
        setChartData(data.map(({ title, traffic }) => ({ name: title, size: traffic })));
    }

    const [openCounSelectModal, setOpenCounSelectModal] = useState(false);
    const openFilterModal = async (type) => {
        if (type === "FromDate") {
            await Swal.fire({
                title: 'Enter From Date',
                html: `<input id="FromDate" class="swal2-input" type="datetime-local" max=${moment().subtract(1, 'day').format("YYYY-MM-DDTHH:mm:ss")}>`,
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: () => {
                    const datetimeString = document.getElementById('FromDate').value;
                    if (!datetimeString) {
                        Swal.fire({
                            icon: 'error',
                            text: 'Entering the datetime is mandatory'
                        })
                        return
                    }
                    setFromTime(new Date(datetimeString).getTime())
                }
            })
        }
        if (type === "ToDate") {
            await Swal.fire({
                title: 'Enter To Date',
                html: `<input id="ToDate" class="swal2-input" type="datetime-local" max=${moment().format("YYYY-MM-DDTHH:mm:ss")}>`,
                focusConfirm: false,
                showCancelButton: true,
                preConfirm: () => {
                    const datetimeString = document.getElementById('ToDate').value;
                    if (!datetimeString) {
                        Swal.fire({
                            icon: 'error',
                            text: 'Entering the datetime is mandatory'
                        })
                        return
                    }
                    setToTime(new Date(datetimeString).getTime())
                }
            })
        }
        if (type === "Countries") {
            setOpenCounSelectModal(true)
        }
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
                <Link to="/v1" className='w3-button w3-small w3-border w3-round-xlarge'>↩ V1</Link>
            </div>

            <div className="w3-content" style={{ fontWeight: 400 }}>
                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} className="w3-transparent w3-padding w3-leftbar w3-topbar w3-round" />
            </div>

            <div className="w3-content w3-margin-top">
                <div className="w3-row-padding">
                    {
                        fromTime &&
                        (
                            <div className="w3-third" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("FromDate") }}>
                                <div className="w3-padding w3-round-xlarge w3-blue w3-opacity-min">
                                    <div className="w3-left">
                                        <i className="fa fa-calendar-plus-o w3-xxxlarge" />
                                    </div>
                                    <div className="w3-right">
                                        <h3><b>From Date</b></h3>
                                    </div>
                                    <div className="w3-clear" />
                                    <h4>{moment(fromTime).format('MMMM Do YYYY, h:mm A')}</h4>
                                </div>
                            </div>
                        )
                    }
                    {
                        toTime &&
                        (
                            <div className="w3-third" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("ToDate") }}>
                                <div className="w3-padding w3-round-xlarge w3-green w3-opacity-min">
                                    <div className="w3-left">
                                        <i className="fa fa-calendar-minus-o w3-xxxlarge" />
                                    </div>
                                    <div className="w3-right">
                                        <h3><b>To Date</b></h3>
                                    </div>
                                    <div className="w3-clear" />
                                    <h4>{moment(toTime).format('MMMM Do YYYY, h:mm A')}</h4>
                                </div>
                            </div>
                        )
                    }
                    {
                        countries &&
                        (
                            <div className="w3-third" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("Countries") }}>
                                <div className="w3-padding w3-round-xlarge w3-grey w3-text-white w3-opacity-min">
                                    <div className="w3-left">
                                        <i className="fa fa-flag w3-xxxlarge" />
                                    </div>
                                    <div className="w3-right">
                                        <h3><b>Countries</b></h3>
                                    </div>
                                    <div className="w3-clear" />
                                    <h4 className={countries.length > 10 ? 'w3-small' : ''} >{countries.length > 0 ? countries.map(coun => flags[coun]).join(" ") : "ALL"}</h4>
                                </div>
                            </div>
                        )
                    }
                </div>
                <div className="w3-row-padding">
                    <div className="w3-padding">
                        <button className="w3-btn w3-blue-grey w3-opacity w3-large w3-round-large w3-right" title="Get Filter Results" onClick={() => { setIsFilterChanges(true) }}>
                            <i className="fa fa-filter"></i>
                        </button>
                    </div>
                </div>
            </div>

            {
                isFilterChanged &&
                (
                   <div className="loader-container w3-padding-32">
                     <Grid
                        height="80"
                        width="80"
                        color={uniqolor.random()['color']}
                        ariaLabel="grid-loading"
                        radius="12.5"
                        wrapperStyle={{ }}
                        wrapperClass=""
                        visible={true}
                    />
                   </div>
                )
            }

            {
                !isFilterChanged &&
                (
                    <>
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
                                                            <circle fill={uniqolor.random()['color']} r={2.5} />
                                                            <text
                                                                style={{ fontFamily: "system-ui", fill: '#5D5A6D', fontSize: 10, fontWeight: 550, cursor: 'cell' }}
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
                            )
                        }

                        {/* treemap  */}
                        {
                            treeMapData && window && (
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
                                            content={<CustomizedContent colors={treeMapData.map(data => uniqolor.random()['color'])} />}
                                            onClick={treeMapHandler}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            )
                        }
                    </>
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

            <CountrySelectModal
                openCounSelectModal={openCounSelectModal}
                setOpenCounSelectModal={setOpenCounSelectModal}
                setCountries={setCountries}
            />

        </div>
    );
}
