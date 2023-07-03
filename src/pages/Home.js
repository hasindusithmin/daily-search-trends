import axios from "axios";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link, useNavigate } from "react-router-dom";
import { Treemap } from 'recharts';
import { toast, ToastContainer } from 'react-toastify';
import CustomizedContent from "../components/CustomContentTreemap";
import BarModal from "../components/BarModal";
import { Typewriter } from 'react-simple-typewriter';
import radar from "../images/radar.gif"

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
    const [trendsCopy, setTrendsCopy] = useState([])
    const [treeMapData, setTreeMapData] = useState(null);
    const [rawData, setRawData] = useState([]);

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
        (async () => {
            try {
                // const res = await axios.get('https://trendsapi-1-q3464257.deta.app');
                const res = await axios.get('https://gist.githubusercontent.com/hasindusithmin/8d411a5eb73b290aaceebb5fcb8626ad/raw/9291d0baf760841e755fa30380eb003b15c3eba8/keywords.json');
                const trendingsearches = res.data;
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
                setTrends(data.sort((a, b) => b.traffic - a.traffic));
                setTrendsCopy(data.sort((a, b) => b.traffic - a.traffic));
                setTreeMapData(forTreeMap)
            } catch (error) {
                console.log(error.message);
                toast.info("Please try again in a few minutes", { autoClose: 1500, hideProgressBar: true })
            }
        })();
    }, []);

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

    const [country, setCountry] = useState(null);
    const [color, setColor] = useState(null);
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
        setColor(e.fill);
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
                <img src={radar} alt="radar" width={150} height={150} />
            </p>
            <p className="w3-padding w3-center">
                <div className="w3-padding">Total Traffic🚦 of Trending Keywords 🔠 Across Countries 🗺 With The Highest Number Of Internet Users 🧑🏻‍💻</div>
            </p>
            {
                treeMapData && (
                    <div className={window && isMobile() ? 'w3-responsive' : ''}>
                        <Treemap
                            width={1000}
                            height={600}
                            data={treeMapData}
                            dataKey="size"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            content={<CustomizedContent colors={
                                ['#e91e6396', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D', '#CC99FF', '#FFCCCC', '#00bcd4b8', '#99EEFF']
                            } />}
                            onClick={treeMapHandler}
                            style={{ cursor: 'pointer' }}
                        />
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
                <BarModal country={country} chartData={chartData} setChartData={setChartData} />
            }
        </div>
    );
}
