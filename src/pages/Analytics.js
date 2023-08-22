import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Typewriter } from 'react-simple-typewriter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import DataTable from 'react-data-table-component';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { downloadChart, copyToClipboard, isMobile, BackendURL } from '../utils/commons';
import CountriesSearch from '../components/CountriesSearch';


export default function Analytics() {

    axios.defaults.baseURL = BackendURL;

    const columns = [
        {
            cell: row => <Link to={row.profileUrl} target='_blank'><img src={row.profilImage} width="35px" className="w3-circle" title={row.profileName} /></Link>,
            width: '50px',
        },
        {
            name: 'Question',
            cell: row => <div title={row.question} className='w3-justify'>{row.question}</div>,
            width: '500px',
            sortable: true
        },
        {
            name: 'Upvotes',
            selector: row => row.upvotes,
            sortable: true,
        },
        {
            name: 'Comments',
            selector: row => row.comments,
            sortable: true
        },
        {
            name: 'Shares',
            selector: row => row.shares,
            sortable: true
        },
        {
            name: 'Views',
            selector: row => row.views,
            sortable: true
        },
        {
            cell: row => <Link to={row.link} target='_blank' style={{ textDecoration: 'none', fontWeight: 600}}>Read More...</Link>,
            width: '150px',
            style: {
                padding: '10px'
            }
        }

    ];

    let { keyword } = useParams();
    const [all, setAll] = useState(null)
    const [allInOne, setAllInOne] = useState(null)
    const [upvotesRank, setUpvotesRank] = useState(null)
    const [commentsRank, setCommentsRank] = useState(null)
    const [sharesRank, setSharesRank] = useState(null)
    const [viewsRank, setViewsRank] = useState(null)
    const [notFound, setNotFound] = useState(null)

    useEffect(() => {
        if (keyword) initialize()
    }, [])

    const truncateText = (text, maxLength = 30, suffix = '...') => {
        if (text.length <= maxLength) {
          return text;
        }
        return text.slice(0, maxLength - suffix.length) + suffix;
      };

    const initialize = async () => {

        const changeState = (data) => {
            setTimeout(()=>{
                document.title = `Trendy w... ${keyword}`
            },250)
            if (data.length < 5) {
                setNotFound("Sorry, results not found");
                return
            }
            const al = data.map(({ text, upvotes, comments, shares, views, profilImage, profileUrl, profileName, link }) => ({ question: text, upvotes, comments, shares, views, profilImage, profileUrl, profileName, link }));
            const _ = data.map(({ text, upvotes, comments, shares, views }) => ({ question: truncateText(text), upvotes, comments, shares, views }));
            const __ = data.map(({ text, upvotes }) => ({ question: truncateText(text), upvotes }))
            const ___ = data.map(({ text, comments }) => ({ question: truncateText(text), comments }))
            const ____ = data.map(({ text, shares }) => ({ question: truncateText(text), shares }))
            const _____ = data.map(({ text, views }) => ({ question: truncateText(text), views }))
            setAll(al)
            setAllInOne(_)
            setUpvotesRank(__)
            setCommentsRank(___)
            setSharesRank(____)
            setViewsRank(_____)
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                setOverview('')
                setOverviewErr('')
                const res = await axios.get(`/quora/${keyword}`);
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
            }
            // do state changes 
            changeState(apiData);
            // save data in local storage 
            const store_data = {
                "created": Date.now(),
                "resource": JSON.stringify(apiData)
            }
            sessionStorage.setItem(keyword, JSON.stringify(store_data))
        }

        const treasure = sessionStorage.getItem(keyword);
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

    function convertToMarkdown(data) {
        let markdown = "";

        data.forEach((item) => {
            for (const [key, value] of Object.entries(item)) {
                markdown += `${key}: ${value}\n`;
            }
            markdown += "\n";
        });

        return markdown;
    }

    const [analyzing, setAnalyzing] = useState(false);
    const [overview, setOverview] = useState('');
    const [overviewErr, setOverviewErr] = useState('');

    const analyseData = async () => {
        let prompt = convertToMarkdown(all);
        prompt += 'Write a complete overview of the above data by identifying trends and patterns based on the following criteria:\n'
        prompt += '- It should be clear and organized\n'
        prompt += '- It should be Contextual\n'
        if (overview || overviewErr) {
            toast.info("Already analyzed", { autoClose: 1000, hideProgressBar: true })
            return
        }
        setOverview('')
        setOverviewErr('')
        setAnalyzing(true)
        try {
            const res = await axios.post('/ai', { prompt }, {
                auth: {
                    username: process.env.REACT_APP_UNAME,
                    password: process.env.REACT_APP_PWORD
                }
            })
            setAnalyzing(false)
            setOverview(res.data)
        } catch (error) {
            setOverviewErr(error.message)
            setAnalyzing(false)
        }
    }


    return (
        <>
            <ToastContainer />
            <div >
                <div className="w3-center w3-padding-32" style={{ color: '#2196F3' }}>
                    <div className="w3-xlarge w3-opacity">
                        <b>TRENDY WORLD | {keyword}</b>
                    </div>
                    <p>
                        <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                    </p>
                    <CountriesSearch />
                    <Link to="/" className='w3-button w3-small w3-border w3-round-xlarge'>↩ Back To Home</Link>
                </div>
                <div className="w3-content w3-padding-64">
                    {
                        notFound &&
                        <p className="w3-center w3-text-red w3-xlarge">{notFound}</p>
                    }
                    {
                        all && all.length > 30 &&
                        (
                            <div className='w3-center'>
                                <div className="chart-details"><span>Click to 📚 view the complete overview of the data by identifying 📈 trends and 🌀 patterns 👉</span></div>
                                &nbsp;&nbsp;
                                <button disabled={analyzing} className='w3-button w3-round-large w3-blue' onClick={analyseData}>{!analyzing ? 'AI analyzer (beta)' : <span>analyzing <i className="fa fa-spinner w3-spin" aria-hidden="true"></i></span>}</button>
                            </div>
                        )
                    }
                    {
                        overview && (
                            <div className='w3-padding-32'>
                                <div className='w3-card w3-padding w3-round-large w3-text-blue-grey w3-white' style={{ fontWeight: "bold" }}>
                                    <ReactMarkdown children={overview} remarkPlugins={[remarkGfm]} />
                                </div>
                            </div>
                        )
                    }
                    {
                        overviewErr && (
                            <div className='w3-padding-32'>
                                <div className='w3-card w3-padding w3-round-large w3-text-red' style={{ fontWeight: "bold" }}>
                                    <Typewriter words={[overviewErr]} typeSpeed={25} cursor cursorBlinking={true} />
                                </div>
                            </div>
                        )
                    }
                    {
                        all && (
                            <div className="w3-padding-32 w3-center">
                                <DataTable
                                    columns={columns}
                                    data={all}
                                    pagination
                                    responsive
                                />
                            </div>
                        )
                    }
                    <hr className='w3-clear' />
                    {
                        all &&
                        <div>
                            <div className="chart-details">The chart shows the number of upvotes 🗳️, comments 💬, and shares 📢 for a set of questions about <code>{keyword}</code>.</div>
                            <button title='download' className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('analytics-all') }}>download ⤵</button>
                            <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-all'>
                                <BarChart
                                    width={isMobile() ? 680 : 1280}
                                    height={isMobile() ? 380 : 760}
                                    data={allInOne}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                    onClick={(e) => { copyToClipboard(e['activeLabel']) }}
                                >
                                    <CartesianGrid strokeDasharray="1 1" />
                                    <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="upvotes" stackId="a" fill="#8BC34A" />
                                    <Bar dataKey="comments" stackId="a" fill="#4682B4" />
                                    <Bar dataKey="shares" stackId="a" fill="#FF851B" />
                                </BarChart>
                            </div>
                            <hr className='w3-clear' />
                            <div className="chart-details">The chart shows the number of upvotes 🗳️ for a set of questions about <code>{keyword}</code>.</div>
                            <button title='download' className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('analytics-upvotes') }}>download ⤵</button>
                            <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-upvotes'>
                                <AreaChart
                                    width={isMobile() ? 680 : 1280}
                                    height={isMobile() ? 380 : 760}
                                    data={upvotesRank}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                    onClick={(e) => { copyToClipboard(e['activeLabel']) }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="upvotes" stroke="#8BC34A" fill="#8BC34A" />
                                </AreaChart>
                            </div>
                            <hr className='w3-clear' />
                            <div className="chart-details">The chart shows the number of comments 💬 for a set of questions about <code>{keyword}</code>.</div>
                            <button title='download' className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('analytics-comments') }}>download ⤵</button>
                            <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-comments'>
                                <AreaChart
                                    width={isMobile() ? 680 : 1280}
                                    height={isMobile() ? 380 : 760}
                                    data={commentsRank}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                    onClick={(e) => { copyToClipboard(e['activeLabel']) }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="comments" stroke="#4682B4" fill="#4682B4" />
                                </AreaChart>
                            </div>
                            <hr className='w3-clear' />
                            <div className="chart-details">The chart shows the number of shares 📢 for a set of questions about <code>{keyword}</code>.</div>
                            <button title='download' className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('analytics-shares') }}>download ⤵</button>
                            <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-shares'>
                                <AreaChart
                                    width={isMobile() ? 680 : 1280}
                                    height={isMobile() ? 380 : 760}
                                    data={sharesRank}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                    onClick={(e) => { copyToClipboard(e['activeLabel']) }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="shares" stroke="#FF851B" fill="#FF851B" />
                                </AreaChart>
                            </div>
                            <hr className='w3-clear' />
                            <div className="chart-details">The chart shows the number of views 👁️‍🗨️ for a set of questions about <code>{keyword}</code>.</div>
                            <button title='download' className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart('analytics-views') }}>download ⤵</button>
                            <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-views'>
                                <AreaChart
                                    width={isMobile() ? 680 : 1280}
                                    height={isMobile() ? 380 : 760}
                                    data={viewsRank}
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                    onClick={(e) => { copyToClipboard(e['activeLabel']) }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                    <YAxis />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="views" stroke="#E84A5F" fill="#E84A5F" />
                                </AreaChart>
                            </div>
                            <hr />
                        </div>
                    }
                </div>
            </div>
        </>
    )

}
