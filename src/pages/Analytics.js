import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


export default function Analytics({ match }) {

    let { keyword } = useParams();
    const [questions, setQuestion] = useState(null)
    if (keyword && !questions) {
        (async () => {
            const toastID = toast("Processing, Please Wait...", { autoClose: false, hideProgressBar: true })
            try {
                const res = await axios.get(`https://alsoask-1-r9997761.deta.app/v2?keyword=${encodeURIComponent(keyword)}`)
                const data = res.data;
                const chartData = data.map(({ id, question, upvotes, comments, shares, views, time }) => {
                    return { id, question, upvotes, comments, shares, views };
                });
                setQuestion(chartData)
                toast.update(toastID, { type: toast.TYPE.SUCCESS, autoClose: 1500 })
            } catch (error) {
                toast.update(toastID, { type: toast.TYPE.ERROR, autoClose: 1500 })
            }
        })()
    }


    return (
        <>
            <ToastContainer />

            {
                questions &&
                <div className='w3-center'>
                    <BarChart
                        width={1000}
                        height={600}
                        data={questions}
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
                        <Bar dataKey="upvotes" stackId="a" fill="#8884d8" />
                        <Bar dataKey="comments" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="shares" stackId="a" fill="#3d34f4" />
                    </BarChart>
                </div>

            }

        </>
    )

}