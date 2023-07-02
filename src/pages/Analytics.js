import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Typewriter } from 'react-simple-typewriter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart } from 'recharts';


export default function Analytics({ match }) {

    let { keyword } = useParams();
    const [all, setAll] = useState(null)
    const [upvotesRank, setUpvotesRank] = useState(null)
    const [commentsRank, setCommentsRank] = useState(null)
    const [sharesRank, setSharesRank] = useState(null)
    const [viewsRank, setViewsRank] = useState(null)
    const [notFound, setNotFound] = useState(null)

    useEffect(() => {
        if (keyword) getData()
    }, [])

    const getData = async () => {
        const toastID = toast("Processing, Please Wait...", { autoClose: false, hideProgressBar: true })
        setOverview('')
        setOverviewErr('')
        try {
            setNotFound(null);
            const res = await axios.get(`https://alsoask-1-r9997761.deta.app/v2?keyword=${encodeURIComponent(keyword)}`)
            const data = res.data;
            if (data.length < 5) throw Error("Results not found")
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
            toast.update(toastID, { type: toast.TYPE.SUCCESS, autoClose: 1000 })
        } catch (error) {
            setNotFound(error.message);
            toast.update(toastID, { type: toast.TYPE.ERROR, autoClose: 1000 })
        }
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
        prompt += '- It should be useful\n'
        prompt += '- It should be silly\n'
        prompt += '- It should spark creativity'
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

    return (
        <>
            <ToastContainer />
            <div className="w3-content">
                <div className="w3-center w3-xxlarge w3-padding">
                    <Link to="/" style={{ textDecoration: 'none' }}>Daily Search Trends</Link>
                </div>
                <hr />
                {
                    all && all.length === 50 &&
                    (
                        <button disabled={analyzing} className='w3-button w3-round-large w3-blue' onClick={analyseData}>{!analyzing ? 'AI Analytics' : <span>Analyzing <i className="fa fa-spinner w3-spin" aria-hidden="true"></i></span>}</button>
                    )
                }
                {
                    overview && (
                        <div className='w3-padding-32'>
                            <div className='w3-card w3-padding w3-round-large w3-text-blue-grey' style={{ fontWeight: "bold" }}>
                                {overview.split('\n').map(sentence => {
                                    if (sentence) return (
                                        <div style={{ lineHeight: 1.8 }}>
                                            <Typewriter words={[sentence]} typeSpeed={25} />
                                        </div>
                                    )
                                })}
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
                    notFound &&
                    <p className="w3-center w3-text-red w3-xlarge">{notFound}</p>
                }
                {
                    all &&
                    <div className=''>
                        <h3 className="chart-details">The chart shows the number of upvotes, comments, and shares for a set of questions about <code>{keyword}</code>.</h3>
                        <div>
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
                            >
                                <CartesianGrid strokeDasharray="1 1" />
                                <XAxis dataKey="question" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="upvotes" stackId="a" fill="#8BC34A" />
                                <Bar dataKey="comments" stackId="a" fill="#4682B4" />
                                <Bar dataKey="shares" stackId="a" fill="#FF851B" />
                            </BarChart>
                        </div>
                        <h3 className="chart-details">The chart shows the number of upvotes for a set of questions about <code>{keyword}</code>.</h3>
                        <div>
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
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="upvotes" stroke="#8BC34A" fill="#8BC34A" />
                            </AreaChart>
                        </div>
                        <h3 className="chart-details">The chart shows the number of comments for a set of questions about <code>{keyword}</code>.</h3>
                        <div>
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
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="comments" stroke="#4682B4" fill="#4682B4" />
                            </AreaChart>
                        </div>
                        <h3 className="chart-details">The chart shows the number of shares for a set of questions about <code>{keyword}</code>.</h3>
                        <div>
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
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="shares" stroke="#FF851B" fill="#FF851B" />
                            </AreaChart>
                        </div>
                        <h3 className="chart-details">The chart shows the number of views for a set of questions about <code>{keyword}</code>.</h3>
                        <div>
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
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="question" />
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