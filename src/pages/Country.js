import { useParams, Link } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Treemap } from 'recharts';
import CustomizedContent from "../components/CustomContentTreemap";
import { downloadChart, copyToClipboard } from "../utils/commons";

export default function Country() {

    let { country } = useParams();

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

    function formatNumberAbbreviation(number) {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const suffixNum = Math.floor(('' + number).length / 3);
        let shortNumber = parseFloat((suffixNum !== 0 ? (number / Math.pow(1000, suffixNum)) : number).toPrecision(2));
        if (shortNumber % 1 !== 0) {
            shortNumber = shortNumber.toFixed(1);
        }
        return shortNumber + suffixes[suffixNum];
    }

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

    const flags = {
        "Australia": "🇦🇺",
        "Argentina": "🇦🇷",
        "Austria": "🇦🇹",
        "Belgium": "🇧🇪",
        "Brazil": "🇧🇷",
        "Canada": "🇨🇦",
        "Chile": "🇨🇱",
        "Colombia": "🇨🇴",
        "Czechia": "🇨🇿",
        "Denmark": "🇩🇰",
        "Egypt": "🇪🇬",
        "Finland": "🇫🇮",
        "France": "🇫🇷",
        "Germany": "🇩🇪",
        "Greece": "🇬🇷",
        "Hong Kong": "🇭🇰",
        "Hungary": "🇭🇺",
        "India": "🇮🇳",
        "Indonesia": "🇮🇩",
        "Ireland": "🇮🇪",
        "Israel": "🇮🇱",
        "Italy": "🇮🇹",
        "Japan": "🇯🇵",
        "Kenya": "🇰🇪",
        "Malaysia": "🇲🇾",
        "Mexico": "🇲🇽",
        "Netherlands": "🇳🇱",
        "New Zealand": "🇳🇿",
        "Nigeria": "🇳🇬",
        "Norway": "🇳🇴",
        "Peru": "🇵🇪",
        "Philippines": "🇵🇭",
        "Poland": "🇵🇱",
        "Portugal": "🇵🇹",
        "Romania": "🇷🇴",
        "Russia": "🇷🇺",
        "Saudi Arabia": "🇸🇦",
        "Singapore": "🇸🇬",
        "South Africa": "🇿🇦",
        "South Korea": "🇰🇷",
        "Spain": "🇪🇸",
        "Sweden": "🇸🇪",
        "Switzerland": "🇨🇭",
        "Taiwan": "🇹🇼",
        "Thailand": "🇹🇭",
        "Türkiye": "🇹🇷",
        "Ukraine": "🇺🇦",
        "United Kingdom": "🇬🇧",
        "United States": "🇺🇸",
        "Vietnam": "🇻🇳"
    }

    useEffect(() => {
        initialize()
    }, [])

    const [trends, setTrends] = useState(null);
    const [barData, setBarData] = useState(null);
    const [treeMapData, setTreeMapData] = useState(null);

    const initialize = () => {
        const changeState = (trendingsearches) => {
            trendingsearches.sort((a, b) => b.traffic - a.traffic)
            setTrends(trendingsearches);
            setBarData(trendingsearches.map(({ keyword, traffic }) => ({ keyword, traffic })));
            setTreeMapData(trendingsearches.map(({ keyword, traffic }) => ({ name: keyword, size: traffic })))
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.get(`https://trendsapi-1-q3464257.deta.app/${country}`);
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
            localStorage.setItem(country, JSON.stringify(store_data))
        }

        const cache = localStorage.getItem(country);
        if (!cache) {
            // If there is no data in the local storage
            console.log('there is no data in the local storage');
            fetchRenderSave();
            return
        }
        const { created, resource } = JSON.parse(cache);
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

    const treeMapHandler = (e) => {
        const traffic = e.value;
        toast.info(formatNumberAbbreviation(traffic) + '+', { hideProgressBar: true, autoClose: 250, position: 'bottom-center' })
        copyToClipboard(e.name)
    }

    const isMobile = () => {
        if (/Android|iPhone/i.test(window.navigator.userAgent)) {
            return true
        } else {
            return false
        }
    }

    return (
        <div className="w3-content">
            <ToastContainer />
            <div className="w3-center w3-padding-64">
                <div className="w3-xlarge">
                    Daily Search Trends | {country} {flags[country]}
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
                <Link to="/" className='w3-button w3-small w3-round-large'>↩ Back To Home</Link>
            </div>
            <div className={window && isMobile() ? 'w3-responsive' : ''}>
                {/* datatable  */}
                {
                    trends &&
                    <div className="w3-padding-32 w3-center">
                        <DataTable
                            columns={columns}
                            data={trends}
                            customStyles={customStyles}
                            pagination
                        />
                    </div>
                }
                {/* treemap  */}
                {
                    treeMapData &&
                    <>
                        <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_treemap') }}>⤵</button>
                        <div className="w3-center">
                            <p id={country + '_treemap'} className={window && isMobile() ? 'w3-responsive' : ''}>
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
                    </>
                }
                {/* barchart  */}
                {
                    barData &&
                    <>
                        <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_barchart') }}>⤵</button>
                        <div className="w3-center">
                            <p id={country + '_barchart'} className={window && isMobile() ? 'w3-responsive' : ''}>
                                <BarChart
                                    width={1000}
                                    height={600}
                                    data={barData}
                                    onClick={(e) => { copyToClipboard(e['activeLabel']); }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="keyword" angle={270} orientation="top" fontSize={10} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="traffic" fill="#7ac143" />
                                </BarChart>
                            </p>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}