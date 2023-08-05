import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";
import { Treemap, PieChart, Pie, Tooltip } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import CustomizedContent from "../components/CustomContentTreemap";
import Modal from "../components/Modal";
import { Typewriter } from 'react-simple-typewriter';
import Select from "react-select";
import CountriesSearch from "../components/CountriesSearch";
import { copyToClipboard, downloadChart, isMobile } from "../utils/commons";

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
            selector: row => row.title,
            sortable: true
        },
        {
            name: 'Traffic',
            selector: row => row.traffic,
            format: row => formatNumberAbbreviation(row.traffic) + '+',
            sortable: true
        },
        {
            name: 'Public Date',
            selector: row => row.pubDate,
            format: row => formatToBrowserTimezone(row.pubDate),
            sortable: true
        },
        {
            name: 'Country',
            selector: row => row.country,
            sortable: true
        },
        {
            cell: row => <Link target="_blank" to={'https://www.google.com/search?q='+row.title.replaceAll(' ','+')} className="w3-button w3-light-gray w3-round-large" title="Google" ><i className="fa fa-google" aria-hidden="true"></i></Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        },
        {
            cell: row => <Link to={`/analytics/${row.title}`} className="w3-button w3-light-gray w3-round-large" title="Quora" ><i className="fa fa-quora" aria-hidden="true"></i></Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        }
    ];

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold',
                paddingLeft: '12px',
                paddingRight: '12px',
            },
        },
        cells: {
            style: {
                paddingLeft: '12px',
                paddingRight: '12px',
                fontSize: '14px',
            },
        },
        rows: {
            style: {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: '#f2f2f2',
                minHeight: '56px',
            },
            selectedHighlightStyle: {
                backgroundColor: '#e6e6e6',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#f5f5f5',
            },
        },
    };

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
            const data = [], treeMapDataArr1 = [], level01Data = [], level02Data = [];
            for (const { country, trends, flag } of trendingsearches) {
                const totalTraffic = trends.reduce((sum, item) => sum + item.traffic, 0)
                level01Data.push({ name: country, value: totalTraffic })
                treeMapDataArr1.push({ name: country, size: totalTraffic })
                for (const trend of trends) {
                    level02Data.push({ name: trend.title, value: trend.traffic })
                    data.push({ ...trend, country: `${country} ${flag}` })
                }
            }
            treeMapDataArr1.sort((a, b) => b.size - a.size);
            setPieChartDataLevel01(level01Data)
            setPieChartDataLevel02(level02Data)
            setTreeMapData1(treeMapDataArr1)
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
                trend => trend.keyword && trend.keyword.toLowerCase().includes(inputValue)
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
                trend => trend.keyword.toLowerCase().includes(inputValue)
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

    return (
        <div className="">
            <ToastContainer />
            <div className="w3-center w3-padding-32">
                <div className="w3-xlarge w3-opacity">
                    <b>Daily Search Trends</b>
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
                <CountriesSearch />
            </div>
            {trends && (
                <div className="">
                    <div className="w3-content w3-padding-64">
                        <div className="w3-center w3-padding-32">
                            <div className="chart-details">Analyzing Keyword, Traffic And Public Release Dates Across Countries <span style={{ cursor: 'copy' }} title="copy all keywords" onClick={copyKeywordsToClipBoard}>📋</span></div>
                        </div>
                        <div className="w3-center">
                            <Select
                                options={selectOptions}
                                isMulti
                                isSearchable={true}
                                placeholder="Select Countries..."
                                onChange={(o) => setSelectedCountries(o)}
                            />
                            <br />
                            <button className="w3-button w3-border w3-border-blue w3-round-large" style={{ fontWeight: 750 }} onClick={fetchNewList}>Get Search Trends</button>
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
                            customStyles={customStyles}
                            pagination
                            responsive
                        />
                    </div>
                </div>
            )}
            {
                pieChartDataLevel01 && pieChartDataLevel02 && (
                    <div className="w3-hide-small">
                        <div className="w3-content w3-padding-64">
                            <div className="w3-center">
                                <div className="chart-details">Total Traffic of Trending Keywords Across Countries (Pie Chart)</div>
                            </div>
                            <p>
                            <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('treemap2') }}>download ⤵</button>
                            </p>
                            <div id="treemap2" className={window && isMobile() ? 'w3-responsive' : ''}>
                                <PieChart width={isMobile() ? 380 : 1280} height={isMobile() ? 285 : 760}>
                                    <Pie data={pieChartDataLevel01} dataKey="value" cx="50%" cy="50%" outerRadius={250} fill="#0088FE" />
                                    <Pie data={pieChartDataLevel02} dataKey="value" cx="50%" cy="50%" outerRadius={300} innerRadius={280} fill="#00C49F" label />
                                    <Tooltip />
                                </PieChart>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                treeMapData1 && (
                    <div className="">
                        <div className="w3-content w3-padding-64">
                            <div className="w3-center">
                                <div className="chart-details">Total Traffic of Trending Keywords Across Countries (Treemap)</div>
                            </div>
                            <p>
                                <button title="Download" className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('treemap') }}>download ⤵</button>
                            </p>
                            <div id="treemap" className={window && isMobile() ? 'w3-responsive' : ''}>
                                <Treemap
                                    width={isMobile() ? 380 : 1280}
                                    height={isMobile() ? 285 : 760}
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
        </div>
    );
}
