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
import { copyToClipboard, downloadChart, isLarge, isMobile } from "../utils/commons";
import PieChartModal from "../components/PieChartModal";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { scaleLinear } from "d3-scale";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import HomeTagCloudM from "../modals/HomeTagCloudM";
import { TagCloud } from 'react-tagcloud'

export default function Home() {

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
            cell: row => <Link target="_blank" to={'https://www.google.com/search?q=' + row.title.replaceAll(' ', '+')} className="w3-button w3-light-gray w3-round-large" title="Google" ><i style={{ color: '#fbbc05' }} className="fa fa-google" aria-hidden="true"></i>oogle</Link>,
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

    const coordinates = {
        Argentina: [-63.616672, -38.416097],
        Australia: [133.775136, -25.274398],
        Austria: [14.550072, 47.516231],
        Belgium: [4.469936, 50.503887],
        Brazil: [-51.92528, -14.235004],
        Canada: [-106.346771, 56.130366],
        Chile: [-71.542969, -35.675147],
        Colombia: [-74.297333, 4.570868],
        Czechia: [15.472962, 49.817492],
        Denmark: [9.501785, 56.26392],
        Egypt: [30.802498, 26.820553],
        Finland: [25.748151, 61.92411],
        France: [2.213749, 46.227638],
        Germany: [10.451526, 51.165691],
        Greece: [21.824312, 39.074208],
        'Hong Kong': [114.109497, 22.396428],
        Hungary: [19.503304, 47.162494],
        India: [78.96288, 20.593684],
        Indonesia: [113.921327, -0.789275],
        Ireland: [-8.24389, 53.41291],
        Israel: [34.851612, 31.046051],
        Italy: [12.56738, 41.87194],
        Japan: [138.252924, 36.204824],
        Kenya: [37.906193, -0.023559],
        Malaysia: [101.975766, 4.210484],
        Mexico: [-102.552784, 23.634501],
        Netherlands: [5.291266, 52.132633],
        'New Zealand': [174.885971, -40.900557],
        Nigeria: [8.675277, 9.081999],
        Norway: [8.468946, 60.472024],
        Peru: [-75.015152, -9.189967],
        Philippines: [121.774017, 12.879721],
        Poland: [19.145136, 51.919438],
        Portugal: [-8.224454, 39.399872],
        Romania: [24.96676, 45.943161],
        Russia: [105.318756, 61.52401],
        'Saudi Arabia': [45.079162, 23.885942],
        Singapore: [103.819836, 1.352083],
        'South Africa': [22.937506, -30.559482],
        'South Korea': [127.766922, 35.907757],
        Spain: [-3.74922, 40.463667],
        Sweden: [18.643501, 60.128161],
        Switzerland: [8.227512, 46.818188],
        Taiwan: [120.960515, 23.69781],
        Thailand: [100.992541, 15.870032],
        'Türkiye': [35.243322, 38.963745],
        Ukraine: [31.16558, 48.379433],
        'United Kingdom': [-3.435973, 55.378051],
        'United States': [-95.712891, 37.09024],
        Vietnam: [108.277199, 14.058324]
    }

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
    const [isListChange, setIsListChange] = useState(false);
    const [selectedCountries, setSelectedCountries] = useState([{ "label": "India", "value": "IN" }, { "label": "United States", "value": "US" }, { "label": "Indonesia", "value": "ID" }, { "label": "Brazil", "value": "BR" }, { "label": "Russia", "value": "RU" }]);

    function formatNumberAbbreviation(number) {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const suffixNum = Math.floor(('' + number).length / 3);
        let shortNumber = parseFloat((suffixNum !== 0 ? (number / Math.pow(1000, suffixNum)) : number).toPrecision(2));
        if (shortNumber % 1 !== 0) {
            shortNumber = shortNumber.toFixed(1);
        }
        return shortNumber + suffixes[suffixNum];
    }

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
            setRawData(trendingsearches);
            const data = [], treeMapDataArr1 = [], level01Data = [], level02Data = [], geoData = [], tagCloud = [];
            for (const { country, trends, flag } of trendingsearches) {
                const totalTraffic = trends.reduce((sum, item) => sum + item.traffic, 0)
                level01Data.push({ name: country, value: totalTraffic })
                treeMapDataArr1.push({ name: country, size: totalTraffic })
                geoData.push({ country, totalTraffic, lnglat: coordinates[country] })
                for (const trend of trends) {
                    level02Data.push({ name: trend.title, value: trend.traffic, country })
                    data.push({ ...trend, country: `${country} ${flag}` })
                    tagCloud.push({ value: `${flag}${trend.title}`, count: trend.traffic })
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
            setTagCloudData(tagCloud)
            setCountryRank(treeMapDataArr1.map(({ name }) => name));
            setTrends(data.sort((a, b) => b.traffic - a.traffic));
            setTrendsCopy(data.sort((a, b) => b.traffic - a.traffic));
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.post('https://claudeapi.onrender.com/trends', {
                    codes: selectedCountries.map(({ value }) => value)
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
                "resource": JSON.stringify(apiData),
            }
            sessionStorage.setItem('treasure', JSON.stringify(store_data))
        }

        const treasure = sessionStorage.getItem('treasure');
        if (!treasure || isListChange) {
            // If there is no data in the local storage or requests new list
            console.log('there is no data in the local storage');
            if (isListChange) {
                sessionStorage.removeItem('treasure')
            }
            fetchRenderSave();
            setIsListChange(false)
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
        setIsListChange(true);
        initialize()
    }

    const [pieChartData, setPieChartData] = useState(null);

    const pieChartHandler = e => {
        setCountry(e.name);
        const data = pieChartDataLevel02.filter(({ country }) => country === e.name)
        setPieChartData(data)
    }

    const content = `
**Welcome To Our Trendy World** 🌟

Stay Ahead with Daily Search Trends 📈

Are you ready to unlock the power of daily search trends? At Trendy World, we offer you a gateway to stay at the forefront of what's buzzing and trending in the online world. Whether you're a content creator, marketer, or just a curious mind, our platform provides valuable insights that can drive your success. 💪💼🌐

**Why Embrace Daily Search Trends?**

In today's fast-paced digital landscape, staying relevant is key. By harnessing the power of daily search trends, you can:

**1. Boost Your Content:** Discover popular keywords and phrases that resonate with your audience. Tailor your content to their interests and watch your engagement soar. 📝✨

**2. Seize Timely Opportunities:** Capitalize on trending topics to create timely and compelling content that captivates your audience. 🚀⏰📢

**3. Understand User Intent:** Get inside the minds of your audience by analyzing their search behavior. Understand what they are looking for and deliver solutions that truly matter. 🧠🔍💡

**4. Stay Ahead of Competitors:** Keep a keen eye on your competition. Track their strategies and adapt your own to maintain a competitive edge. 👀📊🏆

**5. Embrace Seasonal Trends:** Plan ahead and align your marketing campaigns with seasonal trends, tapping into heightened interest during specific periods. 🗓️🎉🎁

**6. Be Informed:** Be the first to know about breaking news and current events with real-time updates on what's trending globally. 🌐📰🔔

**How Trendy World Works**

Our intuitive platform provides you with instant access to the most relevant and up-to-date search trends. Simply browse through our user-friendly interface and explore the trending topics that matter most to you. 🖥️🔍🚀

**Start Your Trend Journey Today**

Embrace the power of daily search trends and unlock your potential for success. Join us at Trendy World and make every day a step towards a brighter, trendier future. 🚀🌟

**Stay in the know. Stay trendy.** 🧭📲📈
`
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

    return (
        <div className="">
            <ToastContainer />
            <div className="w3-center w3-padding-32" style={{ color: '#2196F3' }}>
                <div className="w3-xlarge w3-opacity">
                    <b>TRENDY WORLD</b>
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
                <CountriesSearch />
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
                    onChange={(o) => setSelectedCountries(o)}
                />
                <br />
                <button className="w3-button w3-border w3-round-xlarge" style={{ fontWeight: 750 }} onClick={fetchNewList}>🔍</button>
            </p>
            {
                geoMapData && (
                    <div className="w3-content" style={{ paddingTop: 15 }}>
                        <div className="w3-center">
                            <div className="chart-details">Explore Locations and Discover Insights Worldwide</div>
                        </div>
                        <p>
                            <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('geoChart') }}>download ⤵</button>
                        </p>
                        <div id="geoChart" className="w3-center">
                            <div>
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
                                                    style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: 9 }}
                                                >
                                                    {country} <tspan fontSize="6px" dy="-0.5em" fontWeight="bold">{formatNumberAbbreviation(totalTraffic)}+</tspan>
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
                        <div className="w3-center w3-padding-32">
                            <div className="chart-details">Discover What's Hot and Relevant Now</div>
                        </div>
                        <p style={{ lineHeight: 1.8 }} className="w3-justify">
                            <TagCloud
                                minSize={isMobile() ? 5 : 15}
                                maxSize={isMobile() ? 12 : 36}
                                tags={tagCloudData}
                                className=""
                            />
                        </p>
                    </div>
                )
            }
            {
                trends && (
                    <div className="">
                        <div className="w3-content w3-padding-32">
                            <div className="w3-center w3-padding-32">
                                <div className="chart-details">Organized Information at a Glance <span style={{ cursor: 'copy' }} title="copy all keywords" onClick={copyKeywordsToClipBoard}>📋</span></div>
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
                                <div className="chart-details">A Delicious Slice of Information</div>
                            </div>
                            <p>
                                <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('piechart') }}>download ⤵</button>
                            </p>
                            <div id="piechart" className="w3-center">
                                <PieChart width={isLarge() ? 1280 : window.innerWidth} height={isMobile() ? window.innerWidth * 1.2 : isLarge() ? 740 : window.innerWidth * 1}>
                                    <Pie data={pieChartDataLevel01} dataKey="value" cx="50%" cy="50%" outerRadius={isLarge() ? 270 : window.innerWidth / 3} fill="#2196F3" onClick={pieChartHandler} label={renderCustomizedLabel} />
                                    <Pie data={pieChartDataLevel02} dataKey="value" cx="50%" cy="50%" outerRadius={isLarge() ? 300 : window.innerWidth / 2.5} innerRadius={isLarge() ? 280 : window.innerWidth / 2.5 - 20} fill="#00C49F" label />
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
                                <div className="chart-details">Exploring Hierarchical Data in a Compact View</div>
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
                    <HomeTagCloudM showTC={showTC} setShowTC={setShowTC} />
                )
            }
        </div>
    );
}
