import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Typewriter } from 'react-simple-typewriter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';
import DataTable from 'react-data-table-component';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { downloadChart, copyToClipboard } from '../utils/commons';


export default function Analytics({ match }) {

    function truncateText(text) {
        if (text.length <= 20) {
            return text;
        } else {
            return text.slice(0, 25) + '...';
        }
    }

    const columns = [
        {
            name: 'Question',
            cell: row => <div title={row.question}>{truncateText(row.question)}</div>,
            sortable: true
        },
        {
            name: 'Upvotes',
            selector: row => row.upvotes,
            sortable: true
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

    let { keyword } = useParams();
    const [all, setAll] = useState(null)
    const [upvotesRank, setUpvotesRank] = useState(null)
    const [commentsRank, setCommentsRank] = useState(null)
    const [sharesRank, setSharesRank] = useState(null)
    const [viewsRank, setViewsRank] = useState(null)
    const [notFound, setNotFound] = useState(null)

    useEffect(() => {
        if (keyword) initialize()
    }, [])

    const initialize = async () => {

        const changeState = (data) => {
            if (data.length < 5) {
                setNotFound("Results not found");
                return
            }
            const _ = data.map(({ question, upvotes, comments, shares, views, time }) => ({ question, upvotes, comments, shares, views, time }));
            const __ = data.map(({ question, upvotes }) => ({ question, upvotes }))
            const ___ = data.map(({ question, comments }) => ({ question, comments }))
            const ____ = data.map(({ question, shares }) => ({ question, shares }))
            const _____ = data.map(({ question, views }) => ({ question, views }))
            setAll(_)
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
                const res = await axios.get(`https://alsoask-1-r9997761.deta.app/v2?keyword=${encodeURIComponent(keyword)}`);
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
            localStorage.setItem(keyword, JSON.stringify(store_data))
        }

        const treasure = localStorage.getItem(keyword);
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
            const res = await axios.post('https://claudeapi.onrender.com', { prompt }, {
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

    const isMobile = () => {
        if (/Android|iPhone/i.test(window.navigator.userAgent)) {
            return true
        } else {
            return false
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="w3-content">
                <div className="w3-center w3-padding-64">
                    <div className="w3-xlarge">
                        Daily Search Trends | {keyword}
                    </div>
                    <p>
                        <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                    </p>
                    <Link to="/" className='w3-button w3-small w3-round-large'>↩ Back To Home</Link>
                </div>
                {
                    keyword && <h5 className='w3-center w3-text-grey'><b>{keyword}</b></h5>
                }
                <hr />
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
                            <button disabled={analyzing} className='w3-button w3-round-large w3-blue' onClick={analyseData}>{!analyzing ? 'AI analyzer' : <span>analyzing <i className="fa fa-spinner w3-spin" aria-hidden="true"></i></span>}</button>
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
                                customStyles={customStyles}
                                pagination
                            />
                        </div>
                    )
                }
                {
                    all &&
                    <div>
                        <div className="chart-details">The chart shows the number of upvotes 🗳️, comments 💬, and shares 📢 for a set of questions about <code>{keyword}</code>.</div>
                        <button className='w3-button w3-round-large' style={{backgroundColor:'#8cafbfcf', color:'#ffffff'}} onClick={()=>{downloadChart('analytics-all')}}>⤵</button>
                        <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-all'>
                            <BarChart
                                width={1000}
                                height={600}
                                data={all}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                onClick={(e)=>{copyToClipboard(e['activeLabel'])}}
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
                        <div className="chart-details">The chart shows the number of upvotes 🗳️ for a set of questions about <code>{keyword}</code>.</div>
                        <button className='w3-button w3-round-large' style={{backgroundColor:'#8cafbfcf', color:'#ffffff'}} onClick={()=>{downloadChart('analytics-upvotes')}}>⤵</button>
                        <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-upvotes'>
                            <AreaChart
                                width={1000}
                                height={600}
                                data={upvotesRank}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                onClick={(e)=>{copyToClipboard(e['activeLabel'])}}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="upvotes" stroke="#8BC34A" fill="#8BC34A" />
                            </AreaChart>
                        </div>
                        <div className="chart-details">The chart shows the number of comments 💬 for a set of questions about <code>{keyword}</code>.</div>
                        <button className='w3-button w3-round-large' style={{backgroundColor:'#8cafbfcf', color:'#ffffff'}} onClick={()=>{downloadChart('analytics-comments')}}>⤵</button>
                        <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-comments'>
                            <AreaChart
                                width={1000}
                                height={600}
                                data={commentsRank}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                onClick={(e)=>{copyToClipboard(e['activeLabel'])}}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="comments" stroke="#4682B4" fill="#4682B4" />
                            </AreaChart>
                        </div>
                        <div className="chart-details">The chart shows the number of shares 📢 for a set of questions about <code>{keyword}</code>.</div>
                        <button className='w3-button w3-round-large' style={{backgroundColor:'#8cafbfcf', color:'#ffffff'}} onClick={()=>{downloadChart('analytics-shares')}}>⤵</button>
                        <div className={window && isMobile() ? 'w3-responsive' : ''} id='analytics-shares'>
                            <AreaChart
                                width={1000}
                                height={600}
                                data={sharesRank}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                onClick={(e)=>{copyToClipboard(e['activeLabel'])}}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" angle={270} orientation="top" fontSize={10} />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="shares" stroke="#FF851B" fill="#FF851B" />
                            </AreaChart>
                        </div>
                        <div className="chart-details">The chart shows the number of views 👁️‍🗨️ for a set of questions about <code>{keyword}</code>.</div>
                        <button className='w3-button w3-round-large' style={{backgroundColor:'#8cafbfcf', color:'#ffffff'}} onClick={()=>{downloadChart('analytics-views')}}>⤵</button>
                        <div className={window && isMobile() ? 'w3-responsive' : ''}  id='analytics-views'>
                            <AreaChart
                                width={1000}
                                height={600}
                                data={viewsRank}
                                margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                onClick={(e)=>{copyToClipboard(e['activeLabel'])}}
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
        </>
    )

}
