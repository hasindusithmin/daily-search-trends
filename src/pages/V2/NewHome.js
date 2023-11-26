import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import { Typewriter } from 'react-simple-typewriter';
import { formatNumberAbbreviation, formatToBrowserTimezone, NodeAPI, codes, iso, coordinates, flags, content, openCountryDetailsModal, openNewsModal } from "../../utils/commons";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
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
import EBChart from "../../components/charts/EBChart";
import ETagCloud from "../../components/charts/ETagCloud";

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
            selector: row =>
            (
                <div
                    title="Click to view news"
                    style={{ cursor: "zoom-in" }}
                    onClick={() => {
                        let { title, country, news, picture } = row;
                        openNewsModal(title, country, news, picture);
                    }}
                >
                    {row.title}
                </div>
            ),
            sortable: true
        },
        {
            name: 'description',
            width: '300px',
            selector: row => row.description,
            sortable: true
        },
        {
            name: 'searches',
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
            cell: row => <Link to={`/analytics/v2/${row.title}`} className="w3-button w3-light-gray w3-round-large" title="Quora" ><i style={{ color: '#a82400' }} className="fa fa-quora" aria-hidden="true"></i>uora</Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        },
    ];

    const [tblData, setTblData] = useState(null);
    const [tblDataCopy, setTblDataCopy] = useState([]);
    const [geoMapData, setGeoMapData] = useState(null);
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
            const dataTable = [], pieChart = [], geoMap = [];
            for (const [countryCode, trends] of Object.entries(groupedData)) {
                const country = iso[countryCode];
                const totalTraffic = trends.reduce((sum, item) => sum + item.traffic, 0)
                pieChart.push({ name: country, value: totalTraffic })
                geoMap.push({ country, totalTraffic, lnglat: coordinates[country] })
                for (const trend of trends) {
                    dataTable.push({ ...trend, country })
                }
            }
            setGeoMapData(geoMap)
            setTblData(dataTable.sort((a, b) => b.traffic - a.traffic));
            setTblDataCopy(dataTable.sort((a, b) => b.traffic - a.traffic));
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

    const [color, setColor] = useState('DDD');

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


    const [openCounSelectModal, setOpenCounSelectModal] = useState(false);
    const expectedFormat = "YYYY-MMM-DD h:mm A"

    const openFilterModal = async (type) => {
        if (type === "FromDate") {
            await Swal.fire({
                customClass: {
                    "title": "w3-xlarge"
                },
                title: 'From Date',
                input: "text",
                inputValue: moment(fromTime).format('YYYY-MMM-DD h:mm A'),
                inputPlaceholder: expectedFormat,
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to write something!";
                    }
                    const isValidFormat = moment(value, expectedFormat, true).isValid()
                    if (!isValidFormat) {
                        return "Please enter the date in the following format: \"YYYY-MMM-DD h:mm A\""
                    }
                    const M_from = moment(value, expectedFormat)
                    const M_to = moment(toTime)
                    const isBefore = M_from.isBefore(M_to)
                    if (!isBefore) {
                        return "\"From Date\" must be before the \"To Date\""
                    }
                    const diff = M_to.diff(M_from, "hours")
                    if (diff > 72) {
                        return "Please select a valid date range with a maximum duration of 72 hours (3 days)"
                    }
                    return null
                },
                showCancelButton: true,
                preConfirm: (value) => {
                    setFromTime(moment(value, expectedFormat).valueOf())
                }
            })
        }
        if (type === "ToDate") {
            await Swal.fire({
                customClass: {
                    "title": "w3-xlarge"
                },
                title: 'To Date',
                input: "text",
                inputValue: moment(toTime).format('YYYY-MMM-DD h:mm A'),
                inputPlaceholder: "YYYY-MMM-DD h:mm A",
                inputValidator: (value) => {
                    if (!value) {
                        return "You need to write something!";
                    }
                    const expectedFormat = "YYYY-MMM-DD h:mm A"
                    const isValidFormat = moment(value, expectedFormat, true).isValid()
                    if (!isValidFormat) {
                        return "Please enter the date in the following format: \"YYYY-MMM-DD h:mm A\""
                    }
                    const M_from = moment(fromTime)
                    const M_to = moment(value, expectedFormat)
                    const M_now = moment()
                    const isBefore = M_to.isBefore(M_now)
                    if (!isBefore) {
                        return "\"To Date\" must be earlier than the current time"
                    }
                    const isAfter = M_to.isAfter(M_from)
                    if (!isAfter) {
                        return "\"To Date\" must be later than the the \"From Date\""
                    }
                    const diff = M_to.diff(M_from, "hours")
                    if (diff > 72) {
                        return "Please select a valid date range with a maximum duration of 72 hours (3 days)"
                    }
                },
                showCancelButton: true,
                preConfirm: (value) => {
                    setToTime(moment(value, expectedFormat).valueOf())
                }
            })
        }
        if (type === "Countries") {
            setOpenCounSelectModal(true)
        }
    }


    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    const showFilter = (position = "center") => {
        Swal.fire({
            title: "<i class=\"fa fa-calendar\" aria-hidden=\"true\"></i> DATE FILTER",
            customClass: {
                title: "w3-xlarge",
                htmlContainer: "w3-container",
                confirmButton: "w3-green",
                denyButton: "w3-red"
            },
            position: position,
            html: `
                <label class="w3-left">From Date</label>
                <input type="text" id="from-date" class="w3-input w3-border" value="${moment(fromTime).format('YYYY-MMM-DD h:mm A')}" placeholder="YYYY-MMM-DD h:mm A">
                <br>
                <label class="w3-left">To Date</label>
                <input type="text" id="to-date" class="w3-input w3-border" value="${moment(toTime).format('YYYY-MMM-DD h:mm A')}" placeholder="YYYY-MMM-DD h:mm A">
          `,
            showCloseButton: true,
            showCancelButton: false,
            showDenyButton: true,
            confirmButtonText: "<i class='fa fa-filter'></i>",
            denyButtonText: "<i class='fa fa-history'></i>",
            showLoaderOnConfirm: true,
            showLoaderOnDeny: true,
            preDeny: () => {
                const newFrom = moment().startOf("day").valueOf(), newTo = moment().valueOf();
                setFromTime(newFrom)
                setToTime(newTo)
            },
            preConfirm: () => {
                const expectedFormat = "YYYY-MMM-DD h:mm A"
                const from_date = document.getElementById("from-date") ? document.getElementById("from-date").value : moment(fromTime).format('YYYY-MMM-DD h:mm A');
                const to_date = document.getElementById("from-date") ? document.getElementById("to-date").value : moment(toTime).format('YYYY-MMM-DD h:mm A');
                const isValidFromDate = moment(from_date, expectedFormat, true).isValid()
                if (!isValidFromDate) {
                    Toast.fire({
                        icon: "error",
                        title: "Please provide a valid from date"
                    });
                    return
                }
                const isValidToDate = moment(to_date, expectedFormat, true).isValid()
                if (!isValidToDate) {
                    Toast.fire({
                        icon: "error",
                        title: "Please provide a valid to date"
                    });
                    return
                }
                const M_from = moment(from_date, expectedFormat)
                const M_to = moment(to_date, expectedFormat)
                const M_now = moment()
                const validate_1 = M_to.isBefore(M_now)
                if (!validate_1) {
                    Toast.fire({
                        icon: "error",
                        title: "To Date must be earlier than the current time"
                    });
                    return
                }
                const validate_2 = M_to.isAfter(M_from)
                if (!validate_2) {
                    Toast.fire({
                        icon: "error",
                        title: "To Date must be later than the the From Date"
                    });
                    return
                }
                const validate_3 = M_to.diff(M_from, "hours")
                if (validate_3 > 72) {
                    Toast.fire({
                        icon: "error",
                        title: "Please select a valid date range with a maximum duration of 72 hours (3 days)"
                    });
                    return
                }
                const newFrom = M_from.valueOf(), newTo = M_to.valueOf();
                setFromTime(newFrom)
                setToTime(newTo)
            }
        });
    }

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
            <div className="w3-display-topright w3-panel">
                <button className="w3-button w3-green w3-round-large" onClick={() => showFilter("top-end")}>
                    <i className="fa fa-filter"></i>
                </button>
            </div>
            <ToastContainer />
            <div className="w3-padding-32">
                <div className="w3-center">
                    <b className="w3-xlarge">TRENDY WORLD</b>
                    <p>
                        <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                    </p>
                </div>
            </div>

            <div className="w3-content" style={{ fontWeight: 500, fontSize: 16 }}>
                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} className="w3-text-metro-light-blue w3-transparent w3-padding w3-leftbar w3-topbar w3-round" />
            </div>

            <div className="w3-content w3-margin-top">
                <div className="w3-row-padding">
                    {
                        fromTime &&
                        (
                            <div className="w3-third w3-margin-bottom" style={{ cursor: 'pointer' }} onClick={() => { openFilterModal("FromDate") }}>
                                <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #FC466B, #3F5EFB)', color: "#ffffff" }}>
                                    <div className="w3-left">
                                        <i className="fa fa-calendar-plus-o w3-xxxlarge" />
                                    </div>
                                    <div className="w3-right">
                                        <h3><b>Date from</b></h3>
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
                                <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #00F260, #0575E6)', color: "#ffffff" }}>
                                    <div className="w3-left">
                                        <i className="fa fa-calendar-minus-o w3-xxxlarge" />
                                    </div>
                                    <div className="w3-right">
                                        <h3><b>Date to</b></h3>
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
                                <div className="w3-padding w3-round-xlarge" style={{ backgroundImage: 'linear-gradient(to right, #00d2ff, #3a7bd5)', color: "#ffffff" }}>
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
                        <button disabled={isFilterChanged} className="w3-btn w3-blue-grey w3-opacity w3-large w3-round-large w3-right" title="Get Filter Results" onClick={() => { setIsFilterChanges(true) }}>
                            <i className="fa fa-filter"></i>
                        </button>
                    </div>
                </div>
            </div>

            {
                isFilterChanged &&
                (
                    <div className="svg-container w3-padding-32">
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
                        {/* Bar Chart View - Results OverView  */}
                        {
                            rawData && (
                                <div className="w3-content">
                                    <div className="w3-center">
                                        <div className="w3-large w3-gray w3-text-white w3-tag w3-round-large">Results Overview</div>
                                    </div>
                                    <div className="svg-container" >
                                        <div style={{ overflow: "scroll" }} className="hide-scrollbar" >
                                            <EBarChart rawData={rawData} toTime={toTime} fromTime={fromTime} />
                                        </div>
                                    </div>
                                </div>
                            )
                        }

                        {/* Geo Map View - ALL Countries  */}
                        {
                            geoMapData && (
                                <div className="w3-content">
                                    <div className="w3-center w3-padding-32">
                                        <div className="w3-large w3-gray w3-text-white w3-tag w3-round-large">Brief Summary Of Countries 🗺</div>
                                    </div>
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

                        {/* Bar Chart View - Classification By Searches (nested)  */}
                        {
                            rawData && (
                                <div className="w3-content w3-padding" >
                                    <div className="w3-center">
                                        <div className="w3-large w3-gray w3-text-white w3-tag w3-round-large">Explore The Trending Searches</div>
                                    </div>
                                    <div style={{ overflow: "scroll" }} className="hide-scrollbar w3-margin-top" >
                                        <EBChart rawData={rawData} toTime={toTime} fromTime={fromTime} />
                                    </div>
                                </div>
                            )
                        }

                        {/* Word Cloud View - Total traffic by country */}
                        {
                            rawData && (
                                <div className="w3-content w3-padding" >
                                    <div className="w3-center">
                                        <div className="w3-large w3-gray w3-text-white w3-tag w3-round-large">Visual Sense Of The Key Terms</div>
                                    </div>
                                    <div className="svg-container scrollable-container w3-padding">
                                        <ETagCloud
                                            rawData={rawData}
                                            toTime={toTime}
                                            fromTime={fromTime}
                                        />
                                    </div>
                                </div>
                            )
                        }

                        {/* Pie Chart View - Total traffic by country  */}
                        {
                            rawData &&
                            (
                                <div className="">
                                    <div className="svg-container">
                                        <EPieChart rawData={rawData} toTime={toTime} fromTime={fromTime} />
                                    </div>
                                </div>
                            )
                        }

                        {/* Treemap View - Total traffic by country  */}
                        {
                            rawData && (
                                <div className="w3-content hide-scrollbar" style={{ overflow: "scroll", paddingTop: 50 }}>
                                    <E3Map rawData={rawData}
                                        fromTime={fromTime}
                                        toTime={toTime}
                                    />
                                </div>
                            )
                        }

                        {/* Data Table View  */}
                        {
                            tblData && (
                                <div className="w3-content w3-padding">
                                    <div className="w3-center">
                                        <div className="w3-large w3-gray w3-text-white w3-tag w3-round-large">Interactive Data Visualization</div>
                                    </div>
                                    <p>
                                        <button title="Click to download the csv" className='w3-btn w3-blue-grey w3-round-large' onClick={downloadTblData}>download as csv ⤵</button>
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
                                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                        paginationPerPage={5}
                                    />
                                </div>
                            )
                        }
                    </>
                )
            }

            {/* <div className="w3-padding-32">
                <div className="w3-content">
                    <GithubPicker
                        width={220}
                        color={color}
                        onChangeComplete={c => { setColor(c.hex.slice(1)); }}
                    />
                </div>
            </div> */}

            <div className="w3-padding-32"></div>

            <CountrySelectModal
                openCounSelectModal={openCounSelectModal}
                setOpenCounSelectModal={setOpenCounSelectModal}
                setCountries={setCountries}
            />

        </div >
    );
}
