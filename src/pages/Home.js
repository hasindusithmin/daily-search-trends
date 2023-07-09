import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link, useNavigate } from "react-router-dom";
import { Treemap } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import CustomizedContent from "../components/CustomContentTreemap";
import BarModal from "../components/BarModal";
import { Typewriter } from 'react-simple-typewriter';
import autoComplete from "@tarekraafat/autocomplete.js";
import { downloadChart } from "../utils/download-chart";

export default function Home() {

    const navigate = useNavigate()

    const columns = [
        {
            cell: row => <img src={row.picture} alt={row.title} width="30px" className="w3-circle" />,
            width: '30px',
            style: {
                padding: '10px'
            }
        },
        {
            name: 'Keyword',
            selector: row => row.keyword,
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
            cell: row => <Link to={`/analytics/${row.keyword}`} className="w3-button w3-light-gray w3-round-large" title="People also ask" >PAS</Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        }
    ];

    const [trends, setTrends] = useState(null);
    const [trendsCopy, setTrendsCopy] = useState([]);
    const [treeMapData, setTreeMapData] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [countryRank, setCountryRank] = useState([]);
    const [color, setColor] = useState('');

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

    useEffect(() => {
        initialize()
    }, []);

    const initialize = () => {
        const changeState = (trendingsearches) => {
            setRawData(trendingsearches);
            const data = []
            const forTreeMap = []
            for (const { country, trends, flag } of trendingsearches) {
                const totalTraffic = trends.reduce((sum, item) => sum + item.traffic, 0)
                forTreeMap.push({ name: country, size: totalTraffic })
                for (const trend of trends) {
                    data.push({ ...trend, country: `${country} ${flag}` })
                }
            }
            forTreeMap.sort((a, b) => b.size - a.size);
            setCountryRank(forTreeMap.map(({ name }) => name));
            setTrends(data.sort((a, b) => b.traffic - a.traffic));
            setTrendsCopy(data.sort((a, b) => b.traffic - a.traffic));
            setTreeMapData(forTreeMap)
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.get('https://trendsapi-1-q3464257.deta.app');
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
            localStorage.setItem('treasure', JSON.stringify(store_data))
        }

        const treasure = localStorage.getItem('treasure');
        if (!treasure) {
            // If there is no data in the local storage
            console.log('there is no data in the local storage');
            fetchRenderSave();
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

    setTimeout(() => {
        const autoCompleteJS = new autoComplete({
            placeHolder: "Search for Countries...",
            data: {
                src: ['Australia', 'Argentina', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Colombia', 'Czechia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Türkiye', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'],
                cache: true,
            },
            resultItem: {
                highlight: true
            },
            events: {
                input: {
                    selection: (event) => {
                        const selection = event.detail.selection.value;
                        autoCompleteJS.input.value = selection;
                        navigate(`/country/${selection}`)
                    }
                }
            }
        });
    }, 1000)

    const [country, setCountry] = useState(null);
    const [chartData, setChartData] = useState(null);

    const treeMapHandler = (e) => {
        if (isMobile()) {
            toast.warn("Modal View Unavailable on Mobile", { autoClose: 1000, hideProgressBar: true });
            setTimeout(() => {
                navigate('/keywords')
            }, 1500)
            return
        }
        const data = rawData.filter(({ country }) => country === e.name)
        if (data.length === 0) return
        const trends = data[0]['trends']
        if (!trends) return
        setCountry(e.name);
        const indexOf = countryRank.indexOf(e.name)
        setColor(colors[indexOf]);
        setChartData(trends);
    }

    const isMobile = () => {
        if (/Android|iPhone/i.test(window.navigator.userAgent)) {
            return true
        } else {
            return false
        }
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

    return (
        <div className="w3-content">
            <ToastContainer />
            <div className="w3-center w3-padding-64">
                <div className="w3-xlarge">
                    Daily Search Trends
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
            </div>

            <p className="w3-center">
                <div className="autoComplete_wrapper">
                    <input
                        id="autoComplete"
                        type="search"
                        dir="ltr"
                        spellCheck="false"
                        autoCorrect="off"
                        autoComplete="off"
                        autoCapitalize="off"
                    />
                </div>
            </p>
            <p className="w3-padding w3-center">
                <div className="w3-padding">Total Traffic🚦 of Trending Keywords 🔠 Across Countries 🗺 With The Highest Number Of Internet Users 🧑🏻‍💻</div>
            </p>
            {
                treeMapData && (
                    <div className={window && isMobile() ? 'w3-responsive' : ''}>
                        <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('treemap') }}>⤵</button>
                        <p id="treemap">
                            <Treemap
                                width={1000}
                                height={600}
                                data={treeMapData}
                                dataKey="size"
                                aspectRatio={4 / 3}
                                stroke="#fff"
                                content={<CustomizedContent colors={colors} />}
                                onClick={treeMapHandler}
                                style={{ cursor: 'pointer' }}
                            />
                        </p>
                    </div>
                )
            }
            {trends && (
                <div className="w3-padding-32 w3-center">
                    <p className="w3-padding w3-center">
                        <div className="w3-padding">Analyzing Keyword 🔠 Traffic🚦 and Public Release Dates 🕗 across Countries 🗺</div>
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
                            >
                                ❌
                            </button>
                        </span>
                    </p>
                    <DataTable
                        columns={columns}
                        data={trends}
                        customStyles={customStyles}
                        pagination
                    />
                </div>
            )}
            {
                country && chartData &&
                <BarModal country={country} color={color} chartData={chartData} setChartData={setChartData} />
            }
        </div>
    );
}
