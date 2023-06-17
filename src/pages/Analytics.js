import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,Area,AreaChart} from 'recharts';


export default function Analytics({ match }) {

    let { keyword } = useParams();
    const [all, setAll] = useState(null)
    const [upvotesRank, setUpvotesRank] = useState(null)
    const [commentsRank, setCommentsRank] = useState(null)
    const [sharesRank, setSharesRank] = useState(null)
    const [viewsRank, setViewsRank] = useState(null)

    useEffect(()=>{
        if (keyword) getData()
    },[])
    
    const getData = async () => {
        const toastID = toast("Processing, Please Wait...", { autoClose: false, hideProgressBar: true })
            try {
                const res = await axios.get(`https://alsoask-1-r9997761.deta.app/v2?keyword=${encodeURIComponent(keyword)}`)
                const data = res.data;
                const _ = data.map(({ id, question, upvotes, comments, shares, views, time }) => ({ id, question, upvotes, comments, shares, views, time }));
                const __ = data.map(({ question, upvotes }) => ({ question, upvotes }))
                const ___ = data.map(({ question, comments }) => ({ question, comments }))
                const ____ = data.map(({ question, shares }) => ({ question, shares }))
                const _____ = data.map(({ question, views }) => ({ question, views }))
                setAll(_)
                setUpvotesRank(__)
                setCommentsRank(___)
                setSharesRank(____)
                setViewsRank(_____)
                toast.update(toastID, { type: toast.TYPE.SUCCESS, autoClose: 1500 })
            } catch (error) {
                toast.update(toastID, { type: toast.TYPE.ERROR, autoClose: 1500 })
            }
    }


    return (
        <>
            <ToastContainer />

            {
                all &&
                <div className='w3-content'>
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
                            <Legend />
                            <Area type="monotone" dataKey="upvotes" stroke="#8BC34A"  fill="#8BC34A" />
                        </AreaChart>
                    </div>
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
                            <Legend />
                            <Area type="monotone" dataKey="comments" stroke="#4682B4" fill="#4682B4"  />
                        </AreaChart>
                    </div>
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
                            <Legend />
                            <Area type="monotone" dataKey="shares" stroke="#FF851B" fill="#FF851B" />
                        </AreaChart>
                    </div>
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
                            <Legend />
                            <Area type="monotone" dataKey="views" stroke="#E84A5F" fill="#E84A5F"  />
                        </AreaChart>
                    </div>

                </div>

            }

        </>
    )

}