import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import Modal from "../../components/Modal";
import { Typewriter } from 'react-simple-typewriter';
import { downloadChart, isMobile, formatNumberAbbreviation, formatToBrowserTimezone, NodeAPI, codes, iso, coordinates, flags, content, openCountryDetailsModal } from "../../utils/commons";
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
import { GithubPicker } from "react-color";
import EPieChart from "../../components/charts/EPieChart";
import EBarChart from "../../components/charts/EBarChart";
import E3Map from "../../components/charts/E3Map";
import { Tooltip } from 'react-tooltip';

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
            name: 'Searches',
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
    const [rawData, setRawData] = useState(null);

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
                document.title = `Trendy World | V2`
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

    const customRenderer = (tag, size) => {
        return (
            <span key={tag.value} style={{ color : "#016277", fontWeight: 400, fontSize: `${size}px`, margin: '1px', paddingRight: '3px', cursor: 'cell' }} className='w3-tag w3-transparent'>
                {tag.value}<sup style={{ color: '#333' }}>{formatNumberAbbreviation(tag.count)}+</sup>
            </span>
        )
    }

    const [country, setCountry] = useState(null);
    const [color, setColor] = useState('DDD');
    const [chartData, setChartData] = useState(null);

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

    const convertArrayOfObjectsToCSV = (array) => {
        const header = Object.keys(array[0]).join(',');
        const rows = array.map(obj => Object.values(obj).map((value = "") => value.replaceAll(",", ";")).join(','));
        return `${header}\n${rows.join('\n')}`;
    }

    const downloadTblData = () => {
        const arrayOfObjects = []
        tblData.forEach(tbl => {
            delete tbl['news']
            tbl['traffic'] = tbl['traffic'].toString()
            arrayOfObjects.push(tbl)
        })
        const csv = convertArrayOfObjectsToCSV(arrayOfObjects);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const darkColors = ["b80000", "db3e00", "008b02", "006b76", "1273de", "004dcf", "5300eb"];

    return (
        <div
            style={{
                color: `${darkColors.includes(color) ? '#ffffff' : '#34495E'}`,
                opacity: `${darkColors.includes(color) ? 0.75 : 1}`,
                backgroundRepeat: "repeat",
                backgroundSize: "50px",
                backgroundImage: `url(https://svggen-1-b2762192.deta.app?color=${color})`
            }}
        >
            <ToastContainer />
            <div className="w3-padding-32">
                <div className="w3-center">
                    <b className="w3-xlarge">TRENDY WORLD</b>
                    <p>
                        <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                    </p>
                    <Link to="/v1" className='w3-button w3-small w3-border w3-round-xlarge'>↩ V1</Link>
                </div>
            </div>

            <div className="w3-content" style={{ fontWeight: 500, fontSize: 16 }}>
                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} className="w3-text-metro-light-blue w3-transparent w3-padding w3-leftbar w3-topbar w3-border-sand w3-round" />
            </div>

            <div className="w3-content w3-margin-top">
                <div className="w3-row-padding">
                    {
                        fromTime &&
                        (
                            <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("FromDate") }}>
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
                            <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("ToDate") }}>
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
                            <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("Countries") }}>
                                <div className="w3-padding w3-round-xlarge w3-cyan w3-text-white w3-opacity-min">
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
                            wrapperStyle={{}}
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
                        {/* Bar Chart - Results OverView  */}
                        {
                            rawData && (
                                <div className="w3-content w3-padding-32" >
                                    <div style={{ overflow: "scroll" }} className="hide-scrollbar" >
                                        <EBarChart rawData={rawData} toTime={toTime} fromTime={fromTime} />
                                    </div>
                                </div>
                            )
                        }

                        {/* Geo Map - ALL Countries  */}
                        {
                            geoMapData && (
                                <div className="w3-content" style={{ paddingTop: 15 }}>
                                    <p>
                                        <button title="Click to download the symbol map" className='w3-btn w3-blue-grey w3-round-large' onClick={() => { downloadChart('geoMap') }}>download ⤵</button>
                                    </p>
                                    <div id="geoMap" className="w3-center">
                                        <div>
                                            <ComposableMap projectionConfig={{ rotate: [-20, 0, 0], center: [5, 7] }} height={410}>
                                                <Geographies geography={"/geo.json"}>
                                                    {({ geographies }) =>
                                                        geographies.map((geo) => (
                                                            <Geography key={geo.rsmKey} geography={geo} fill="#F1F1F1" />
                                                        ))
                                                    }
                                                </Geographies>
                                                {geoMapData.map(({ country, totalTraffic, lnglat }) => {
                                                    return (
                                                        <Marker key={country} coordinates={lnglat} onClick={() => openCountryDetailsModal(codes[country])}>
                                                            <circle fill="#8BC34A" r={2.5} />
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

                        {/* Tag Cloud  */}
                        {
                            tagCloudData && (
                                <div className="w3-content w3-padding" >
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

                        {/* Pie Chart - Total Traffic View */}
                        {
                            rawData &&
                            (
                                <div className="">
                                    <div className="w3-center">
                                        <div style={{ paddingBottom: 10 }} className="w3-hide">
                                            {
                                                Object.entries(rawData).map(([key, value]) => (
                                                    <>
                                                        <span
                                                            data-tooltip-id={key}
                                                            data-tooltip-content={iso[key]}
                                                            data-tooltip-place="top"
                                                        >
                                                            {flags[key]}<sup className="w3-small">{formatNumberAbbreviation(value.reduce((total, item) => total + item.traffic, 0))}+</sup>&nbsp;
                                                        </span>
                                                        <Tooltip id={key} />
                                                    </>
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div className="loader-container">
                                        <EPieChart rawData={rawData} />
                                    </div>
                                </div>
                            )
                        }

                        {/* treemap  */}
                        {
                            rawData && (
                                <div className="w3-content hide-scrollbar" style={{ overflow: "scroll", paddingTop: 50 }}>
                                    <E3Map rawData={rawData} />
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
                                    <p>
                                        <button title="Click to download the csv" className='w3-btn w3-blue-grey w3-round-large' onClick={downloadTblData}>download ⤵</button>
                                    </p>
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
                    </>
                )
            }

            <div className="w3-padding-32">
                <div className="w3-content">
                    <GithubPicker
                        width={220}
                        color={color}
                        onChangeComplete={c => { setColor(c.hex.slice(1)); }}
                    />
                </div>
            </div>

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

        </div >
    );
}
