import { useParams, Link } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import { Typewriter } from "react-simple-typewriter";
import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Treemap } from 'recharts';
import CustomizedContent from "../components/CustomContentTreemap";
import { downloadChart, copyToClipboard, isMobile } from "../utils/commons";
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CountriesSearch from "../components/CountriesSearch";

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
            cell: row => <img src={row.picture} width="30px" className="w3-circle" />,
            width: '30px',
            style: {
                padding: '10px'
            }
        },
        {
            name: 'Keyword',
            width: '200px',
            selector: row => row.title,
            sortable: true
        },
        {
            name: 'Description',
            width: '500px',
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
            width: '250px',
            selector: row => row.pubDate,
            format: row => formatToBrowserTimezone(row.pubDate),
            sortable: true
        },
        {
            cell: row => <Link target="_blank" to={'https://www.google.com/search?q=' + row.title.replaceAll(' ', '+')} lassName="w3-circle"><i className="fa fa-google" aria-hidden="true"></i>oogle</Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        }
    ];

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

    const codes = {
        'Argentina': 'AR',
        'Australia': 'AU',
        'Austria': 'AT',
        'Belgium': 'BE',
        'Brazil': 'BR',
        'Canada': 'CA',
        'Chile': 'CL',
        'Colombia': 'CO',
        'Czechia': 'CZ',
        'Denmark': 'DK',
        'Egypt': 'EG',
        'Finland': 'FI',
        'France': 'FR',
        'Germany': 'DE',
        'Greece': 'GR',
        'Hong Kong': 'HK',
        'Hungary': 'HU',
        'India': 'IN',
        'Indonesia': 'ID',
        'Ireland': 'IE',
        'Israel': 'IL',
        'Italy': 'IT',
        'Japan': 'JP',
        'Kenya': 'KE',
        'Malaysia': 'MY',
        'Mexico': 'MX',
        'Netherlands': 'NL',
        'New Zealand': 'NZ',
        'Nigeria': 'NG',
        'Norway': 'NO',
        'Peru': 'PE',
        'Philippines': 'PH',
        'Poland': 'PL',
        'Portugal': 'PT',
        'Romania': 'RO',
        'Russia': 'RU',
        'Saudi Arabia': 'SA',
        'Singapore': 'SG',
        'South Africa': 'ZA',
        'South Korea': 'KR',
        'Spain': 'ES',
        'Sweden': 'SE',
        'Switzerland': 'CH',
        'Taiwan': 'TW',
        'Thailand': 'TH',
        'Türkiye': 'TR',
        'Ukraine': 'UA',
        'United Kingdom': 'GB',
        'United States': 'US',
        'Vietnam': 'VN'
    }

    useEffect(() => {
        initialize()
    }, [country])

    const [trends, setTrends] = useState(null);
    const [barData, setBarData] = useState(null);
    const [treeMapData, setTreeMapData] = useState(null);

    const initialize = () => {
        const changeState = (trendingsearches) => {
            trendingsearches.sort((a, b) => b.traffic - a.traffic)
            setTrends(trendingsearches);
            setBarData(trendingsearches.map(({ title, traffic }) => ({ title, traffic })));
            setTreeMapData(trendingsearches.map(({ title, traffic }) => ({ name: title, size: traffic })))
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.get(`https://claudeapi.onrender.com/trend?code=${codes[country]}`);
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
            sessionStorage.setItem(country, JSON.stringify(store_data))
        }

        const cache = sessionStorage.getItem(country);
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

    const copyKeywordsToClipBoard = () => {
        let keywordsStr = '';
        trends.forEach(({ title }) => {
            keywordsStr += `${title}, `
        })
        let allKeywords = keywordsStr.slice(0, -2);
        copyToClipboard(allKeywords)
    }

    const [categorization, setCategorization] = useState(null);
    const [categorizationErr, setCategorizationErr] = useState(null);
    const [processing, setProcessing] = useState(false);
    const categorizeKeywords = async () => {
        try {
            if (categorization) return
            let keywordsStr = '';
            trends.forEach(({ title }) => {
                keywordsStr += `${title}, `
            })
            let prompt = 'Explain these keywords in English\n'
            prompt += keywordsStr.slice(0, -2);
            setProcessing(true);
            const res = await axios.post('https://claudeapi.onrender.com?engine=Llama', { prompt }, {
                auth: {
                    username: process.env.REACT_APP_UNAME,
                    password: process.env.REACT_APP_PWORD
                }
            })
            setProcessing(false);
            setCategorization(res.data);
            console.log(res.data);
        } catch (error) {
            setCategorizationErr(true)
            toast.error(error.message, { hideProgressBar: true, autoClose: 1500 })
        }
    }

    return (
        <div className="">
            <ToastContainer />
            <div className="w3-center w3-padding-32" style={{ color: '#2196F3' }}>
                <div className="w3-xlarge w3-opacity">
                    <b>TRENDY WORLD | {country}</b>
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
                <CountriesSearch />
                <Link to="/" className='w3-button w3-small w3-round-large'>↩ Back To Home</Link>
            </div>
            <div>
                <div className="w3-content w3-padding-64" >
                    <div className={window && isMobile() ? 'w3-padding' : ''}>
                        <button className='w3-button w3-round-large w3-margin-right' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff', cursor: 'copy' }} title="copy all keywords" onClick={copyKeywordsToClipBoard}>📋 Copy</button>
                        <button disabled={processing || categorization || categorizationErr} className='w3-button w3-round-large w3-margin-right' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff', cursor: 'pointer' }} title="Click to do keyword research using AI" onClick={categorizeKeywords}>
                            {
                                processing ? <i className="fa fa-refresh w3-spin"></i> : <span className="w3-small">Learn about keywords (beta)</span>
                            }
                        </button>
                        {
                            categorization &&
                            <ReactMarkdown children={categorization} remarkPlugins={[remarkGfm]} className="w3-panel w3-border w3-round-large w3-white w3-leftbar w3-hover-sand" />
                        }
                    </div>
                    {/* datatable  */}
                    {
                        trends &&
                        <div className={window && isMobile() ? 'w3-responsive' : 'w3-padding-32 w3-center'}>
                            <DataTable
                                columns={columns}
                                data={trends}
                                pagination
                                responsive
                            />
                        </div>
                    }
                    {/* treemap  */}
                    {
                        treeMapData &&
                        <>
                            <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_treemap') }}>download ⤵</button>
                            <div className="w3-center">
                                <p id={country + '_treemap'} className={window && isMobile() ? 'w3-responsive' : ''}>
                                    <Treemap
                                        width={isMobile() ? 380 : 1280}
                                        height={isMobile() ? 285 : 760}
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
                            <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_barchart') }}>download ⤵</button>
                            <div className="w3-center">
                                <p id={country + '_barchart'} className={window && isMobile() ? 'w3-responsive' : ''}>
                                    <BarChart
                                        width={isMobile() ? 380 : 1280}
                                        height={isMobile() ? 285 : 760}
                                        data={barData}
                                        onClick={(e) => { copyToClipboard(e['activeLabel']); }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="title" angle={270} orientation="top" fontSize={10} />
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
        </div>
    )
}
