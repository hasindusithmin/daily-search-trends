import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import { Treemap, PieChart, Pie, Tooltip } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import CustomizedContent from "../components/CustomContentTreemap";
import Modal from "../components/Modal";
import { Typewriter } from 'react-simple-typewriter';
import Select from "react-select";
import CountriesSearch from "../components/CountriesSearch";
import { copyToClipboard, downloadChart, isLarge, isMobile, formatNumberAbbreviation, content, arraysHaveSameElements, BackendURL, openNewsModal, coordinates } from "../utils/commons";
import PieChartModal from "../components/PieChartModal";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import HomeTagCloudM from "../components/HomeTagCloudM";
import { TagCloud } from 'react-tagcloud'
import CountryLable from "../components/CountryLabel";

export default function Home() {

    axios.defaults.baseURL = BackendURL;

    const columns = [
        {
            cell: row => <img src={row.picture} width="30px" className="w3-circle" />,
            width: '30px',
            style: {
                padding: '10px'
            }
        },
        {
            name: 'Keyword',
            width: '150px',
            selector: row => <div title={row.title}>{row.title}</div>,
            sortable: true
        },
        {
            name: 'Description',
            width: '300px',
            selector: row => row.description,
            sortable: true
        },
        {
            name: 'Traffic',
            width: '150px',
            selector: row => row.traffic,
            format: row => formatNumberAbbreviation(row.traffic) + '+',
            sortable: true
        },
        {
            name: 'Public Date',
            width: '200px',
            selector: row => row.pubDate,
            format: row => formatToBrowserTimezone(row.pubDate),
            sortable: true
        },
        {
            name: 'Country',
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

    const selectOptions = [
        { "label": "Argentina", "value": "AR" },
        { "label": "Australia", "value": "AU" },
        { "label": "Austria", "value": "AT" },
        { "label": "Belgium", "value": "BE" },
        { "label": "Brazil", "value": "BR" },
        { "label": "Canada", "value": "CA" },
        { "label": "Chile", "value": "CL" },
        { "label": "Colombia", "value": "CO" },
        { "label": "Czechia", "value": "CZ" },
        { "label": "Denmark", "value": "DK" },
        { "label": "Egypt", "value": "EG" },
        { "label": "Finland", "value": "FI" },
        { "label": "France", "value": "FR" },
        { "label": "Germany", "value": "DE" },
        { "label": "Greece", "value": "GR" },
        { "label": "Hong Kong", "value": "HK" },
        { "label": "Hungary", "value": "HU" },
        { "label": "India", "value": "IN" },
        { "label": "Indonesia", "value": "ID" },
        { "label": "Ireland", "value": "IE" },
        { "label": "Israel", "value": "IL" },
        { "label": "Italy", "value": "IT" },
        { "label": "Japan", "value": "JP" },
        { "label": "Kenya", "value": "KE" },
        { "label": "Malaysia", "value": "MY" },
        { "label": "Mexico", "value": "MX" },
        { "label": "Netherlands", "value": "NL" },
        { "label": "New Zealand", "value": "NZ" },
        { "label": "Nigeria", "value": "NG" },
        { "label": "Norway", "value": "NO" },
        { "label": "Peru", "value": "PE" },
        { "label": "Philippines", "value": "PH" },
        { "label": "Poland", "value": "PL" },
        { "label": "Portugal", "value": "PT" },
        { "label": "Romania", "value": "RO" },
        { "label": "Russia", "value": "RU" },
        { "label": "Saudi Arabia", "value": "SA" },
        { "label": "Singapore", "value": "SG" },
        { "label": "South Africa", "value": "ZA" },
        { "label": "South Korea", "value": "KR" },
        { "label": "Spain", "value": "ES" },
        { "label": "Sweden", "value": "SE" },
        { "label": "Switzerland", "value": "CH" },
        { "label": "Taiwan", "value": "TW" },
        { "label": "Thailand", "value": "TH" },
        { "label": "Türkiye", "value": "TR" },
        { "label": "Ukraine", "value": "UA" },
        { "label": "United Kingdom", "value": "GB" },
        { "label": "United States", "value": "US" },
        { "label": "Vietnam", "value": "VN" }
    ]

    const colors = [
        "#004400",  // dark green
        "#006600",  // pakistan green
        "#008000",  // office green
        "#228B22",  // forest green
        "#32CD32",  // lime green
        "#3CB371",  // medium sea green
        "#66CDAA",  // medium aquamarine
        "#98FB98",  // pale green
        "#ADFF2F",  // green yellow
        "#ccffcc"   // honeydew 
    ];

    const [trends, setTrends] = useState(null);
    const [trendsCopy, setTrendsCopy] = useState([]);
    const [treeMapData1, setTreeMapData1] = useState(null);
    const [pieChartDataLevel01, setPieChartDataLevel01] = useState(null);
    const [pieChartDataLevel02, setPieChartDataLevel02] = useState(null);
    const [geoMapData, setGeoMapData] = useState(null);
    const [maxTraffic, setMaxTraffic] = useState(0);
    const [tagCloudData, setTagCloudData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [countryRank, setCountryRank] = useState([]);
    const [color, setColor] = useState('');
    const [selectedCountries, setSelectedCountries] = useState([]);

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

    const initialize = (reRender = false) => {
        const changeState = (trendingsearches) => {
            setTimeout(() => {
                document.title = `Trendy world | V1`
            }, 250)
            setRawData(trendingsearches);
            const data = [], treeMapDataArr1 = [], level01Data = [], level02Data = [], geoData = [], tagCloud = [];
            for (const { country, trends, flag } of trendingsearches) {
                const totalTraffic = trends.reduce((sum, item) => sum + item.traffic, 0)
                level01Data.push({ name: country, value: totalTraffic })
                treeMapDataArr1.push({ name: country, size: totalTraffic })
                geoData.push({ country, totalTraffic, lnglat: coordinates[country] })
                for (const trend of trends) {
                    level02Data.push({ name: trend.title, value: trend.traffic, country })
                    data.push({ ...trend, country })
                    tagCloud.push({ value: trend.title, count: trend.traffic, flag: flag, picture: trend.picture, news: trend.news, country: country })
                }
            }
            setMaxTraffic(geoData.reduce((max, item) => {
                return item.totalTraffic > max ? item.totalTraffic : max;
            }, 0))
            treeMapDataArr1.sort((a, b) => b.size - a.size);
            setPieChartDataLevel01(level01Data)
            setPieChartDataLevel02(level02Data)
            setTreeMapData1(treeMapDataArr1)
            setGeoMapData(geoData)
            setCountryRank(treeMapDataArr1.map(({ name }) => name));
            setTrends(data.sort((a, b) => b.traffic - a.traffic));
            setTrendsCopy(data.sort((a, b) => b.traffic - a.traffic));
            setTagCloudData(null)
            setTimeout(() => {
                setTagCloudData(tagCloud);
            }, 100)
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.post('/trends', {
                    codes: selectedCountries.length > 0 ? selectedCountries : ["IN", "US", "ID", "BR", "RU"]
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
            const sC = selectedCountries.length > 0 ? selectedCountries : ["IN", "US", "ID", "BR", "RU"];
            setSelectedCountries(sC);
            // do state changes 
            changeState(apiData);
            // save data in local storage 
            const store_data = {
                "created": Date.now(),
                "resource": JSON.stringify(apiData),
                "countries": JSON.stringify(sC)
            }
            sessionStorage.setItem('treasure', JSON.stringify(store_data))
        }

        const treasure = sessionStorage.getItem('treasure');
        if (!treasure) {
            // If there is no data in the local storage or requests new list
            console.log('there is no data in the local storage');
            fetchRenderSave()
            return
        }
        if (reRender) {
            if (selectedCountries.length === 0) return
            const { countries } = JSON.parse(treasure);
            const prevSelectedCountries = JSON.parse(countries) || []
            if (arraysHaveSameElements(selectedCountries, prevSelectedCountries)) {
                toast.info("Content Already Shown", { autoClose: 500, hideProgressBar: true, position: 'top-center' });
                return
            }
            sessionStorage.removeItem('treasure')
            fetchRenderSave()
            return
        }
        const { created, resource, countries } = JSON.parse(treasure);
        const now = Date.now();
        const is_data_old = (now - created) > (15 * 60 * 1000)
        if (is_data_old) {
            // If the data is more than 15 minutes old
            console.log('data is more than 15 minutes old');
            fetchRenderSave();
            return
        }
        setSelectedCountries(JSON.parse(countries))
        // do state changes 
        changeState(JSON.parse(resource));
    }

    const [country, setCountry] = useState(null);
    const [chartData, setChartData] = useState(null);

    const treeMapHandler1 = (e) => {
        const data = rawData.filter(({ country }) => country === e.name)
        if (data.length === 0) return
        const trends = data[0]['trends']
        if (!trends) return
        setCountry(e.name);
        const indexOf = countryRank.indexOf(e.name)
        setColor(colors[indexOf]);
        const treeMapData = trends.map(({ title, traffic }) => ({ name: title, size: traffic }))
        treeMapData.sort((a, b) => b.size - a.size);
        setChartData(treeMapData);
    }

    const [filterText, setFilterText] = useState('');

    const filterKeywords = (e) => {
        const inputValue = e.target.value.toLowerCase();

        if (e.nativeEvent.inputType === 'insertText') {
            setFilterText(inputValue);
            const filteredData = trends.filter(
                trend => trend.title && trend.title.toLowerCase().includes(inputValue)
            );
            setTrends(filteredData);
        } else {
            setFilterText(inputValue);

            if (inputValue === '') {
                setTrends(trendsCopy);
                return;
            }

            if (trendsCopy.length === 0) {
                console.log('reset trends');
                setTrends(trendsCopy);
                return;
            }

            const filteredData = trendsCopy.filter(
                trend => trend.title.toLowerCase().includes(inputValue)
            );
            setTrends(filteredData);
        }
    };

    const resetFilter = () => {
        setFilterText('');
        setTrends(trendsCopy);
    }

    const copyKeywordsToClipBoard = () => {
        let keywordsStr = '';
        trends.forEach(({ title }) => {
            keywordsStr += `${title}, `
        })
        let allKeywords = keywordsStr.slice(0, -2);
        copyToClipboard(allKeywords)
    }

    const fetchNewList = () => {
        initialize(true);
    }

    const [pieChartData, setPieChartData] = useState(null);

    const pieChartHandler = e => {
        setCountry(e.name);
        const data = pieChartDataLevel02.filter(({ country }) => country === e.name)
        setPieChartData(data.map(({ name, value }) => ({ y: value, label: name, abbr: formatNumberAbbreviation(value) })));
    }

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`∘${name}`}
            </text>
        );
    };

    const popScale = useMemo(
        () => scaleLinear().domain([0, maxTraffic]).range([0, 24]),
        [maxTraffic]
    );

    const [showTC, setShowTC] = useState(null);
    const openModal = (country) => {
        try {
            const filteredData = rawData.filter(object => object.country === country)[0]
            setShowTC(filteredData)
        } catch (error) {
            console.log(error.message);
        }
    }

    const customRenderer = (tag, size, color) => {
        return (
            <span key={tag.value} style={{ color, fontWeight: 400, fontSize: `${size}px`, margin: '1px', paddingRight: '3px', cursor: 'cell' }} className='w3-tag w3-transparent tooltip'>
                {tag.value}<sup style={{ color: '#333' }}>{formatNumberAbbreviation(tag.count)}+</sup><span className="tooltiptext">{tag.flag}{tag.country}</span>
            </span>
        )
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
                <Link to="/v2" className='w3-button w3-small w3-border w3-round-xlarge'>↪ Worldwide 🗺</Link>
            </div>
            <div className="w3-content" style={{ fontWeight: 400 }}>
                <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} className="w3-transparent w3-padding w3-leftbar w3-topbar w3-round" />
            </div>
            <p className="w3-content w3-center" style={{ padding: '15px 0px' }}>
                <Select
                    options={selectOptions}
                    isMulti
                    isSearchable={true}
                    placeholder="Select Countries..."
                    onChange={(opt) => setSelectedCountries(opt.map(({ value }) => value))}
                />
                <br />
                <button className="w3-button w3-border w3-round-xlarge" style={{ fontWeight: 750 }} onClick={fetchNewList}>🔍</button>
            </p>
            {
                geoMapData && (
                    <div className="w3-content" style={{ paddingTop: 15 }}>
                        <div className="w3-center">
                            <div className="chart-details">Explore Locations and Discover Insights Worldwide.<sup style={{ fontSize: 14 }}><CountryLable selectedCountries={selectedCountries} /></sup></div>
                        </div>
                        <p>
                            <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('geoChart') }}>download ⤵</button>
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
                                            <Marker key={country} coordinates={lnglat} onClick={() => openModal(country)}>
                                                <circle fill="#F53" stroke="#FFF" r={popScale(totalTraffic)} />
                                                <text
                                                    textAnchor="middle"
                                                    y={5}
                                                    style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: 9, fontWeight: 550, cursor: 'cell' }}
                                                >
                                                    {country} <tspan fontSize="6px" dy="-0.5em" fontWeight={750}>{formatNumberAbbreviation(totalTraffic)}+</tspan>
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
            {
                tagCloudData && (
                    <div className="w3-content w3-padding-32" >
                        <div className="w3-center w3-padding">
                            <div className="chart-details">Discover What's Hot and Relevant Now.<sup style={{ fontSize: 14 }}><CountryLable selectedCountries={selectedCountries} /></sup></div>
                        </div>
                        <p style={{ lineHeight: 1.8 }} className="w3-justify">
                            <TagCloud
                                minSize={isMobile() ? 7 : 15}
                                maxSize={isMobile() ? 15 : 36}
                                tags={tagCloudData}
                                className="w3-tag w3-transparent"
                                onClick={({ value, country, news, picture }) => { openNewsModal(value, country, news, picture); }}
                                renderer={customRenderer}
                            />
                        </p>
                    </div>
                )
            }
            {
                trends && (
                    <div className="">
                        <div className="w3-content w3-padding-32">
                            <div className="w3-center w3-padding">
                                <div className="chart-details">Organized Information at a Glance <span style={{ cursor: 'copy' }} title="copy all keywords" onClick={copyKeywordsToClipBoard}>📋</span><sup style={{ fontSize: 14 }}><CountryLable selectedCountries={selectedCountries} /></sup></div>
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
                                data={trends}
                                pagination
                                responsive
                            />
                        </div>
                    </div>
                )
            }
            {
                pieChartDataLevel01 && pieChartDataLevel02 && window && (
                    <div className="">
                        <div className="w3-content w3-padding-64">
                            <div className="w3-center">
                                <div className="chart-details">A Delicious Slice of Information.<sup style={{ fontSize: 14 }}><CountryLable selectedCountries={selectedCountries} /></sup></div>
                            </div>
                            <p>
                                <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('piechart') }}>download ⤵</button>
                            </p>
                            <div id="piechart" className="w3-center">
                                <PieChart width={isLarge() ? 1280 : window.innerWidth} height={isMobile() ? window.innerWidth * 1.2 : isLarge() ? 740 : window.innerWidth * 1}>
                                    <Pie data={pieChartDataLevel01} dataKey="value" cx="50%" cy="50%" outerRadius={isLarge() ? 270 : window.innerWidth / 3} fill="#2196F3" onClick={pieChartHandler} label={renderCustomizedLabel} />
                                    <Pie data={pieChartDataLevel02} dataKey="value" cx="50%" cy="50%" outerRadius={isLarge() ? 300 : window.innerWidth / 2.5} innerRadius={isLarge() ? 280 : window.innerWidth / 2.5 - 20} fill="#00C49F" />
                                    <Tooltip />
                                </PieChart>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                treeMapData1 && window && (
                    <div className="">
                        <div className="w3-content w3-padding-32">
                            <div className="w3-center">
                                <div className="chart-details">Exploring Hierarchical Data in a Compact View.<sup style={{ fontSize: 14 }}><CountryLable selectedCountries={selectedCountries} /></sup></div>
                            </div>
                            <p>
                                <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('treemap') }}>download ⤵</button>
                            </p>
                            <div id="treemap" className={window && isMobile() ? 'w3-responsive' : ''}>
                                <Treemap
                                    width={isLarge() ? 1280 : window.innerWidth}
                                    height={isLarge() ? 640 : window.innerWidth / 2}
                                    data={treeMapData1}
                                    dataKey="size"
                                    aspectRatio={4 / 3}
                                    stroke="#fff"
                                    content={<CustomizedContent colors={colors} />}
                                    onClick={treeMapHandler1}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }
            {
                country && chartData &&
                <Modal country={country} color={color} chartData={chartData} setChartData={setChartData} />
            }
            {
                country && pieChartData &&
                <PieChartModal country={country} pieChartData={pieChartData} setPieChartData={setPieChartData} />
            }
            {
                showTC && (
                    <HomeTagCloudM toast={toast} showTC={showTC} setShowTC={setShowTC} />
                )
            }
        </div>
    );
}
