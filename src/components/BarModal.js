import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
import { toast } from "react-toastify"
import { downloadChart } from '../utils/download-chart';
export default function BarModal({ country, color, chartData, setChartData }) {

    const flags = {
        "India": "🇮🇳",
        "United States": "🇺🇸",
        "Indonesia": "🇮🇩",
        "Brazil": "🇧🇷",
        "Russia": "🇷🇺",
        "Japan": "🇯🇵",
        "Nigeria": "🇳🇬",
        "Mexico": "🇲🇽",
        "Germany": "🇩🇪",
        "Canada": "🇨🇦"
    }

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };

    function copyToClipboard(text) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        toast.success(`Copy To Clipboard`, { hideProgressBar: true, autoClose: 250, position: 'top-left' })
    }

    return (
        <Modal
            isOpen={chartData}
            style={customStyles}
            ariaHideApp={false}
        >
            <span onClick={() => { setChartData(null) }} className="w3-button w3-display-topright w3-padding">✖️</span>
            <div className='w3-center w3-padding-32 w3-xlarge w3-opacity'><b></b></div>
            <div className='w3-center w3-padding-32 w3-large w3-opacity'>
                <b><Typewriter words={[`Here are today's top trending keywords in the ${country} ${flags[country]}`]} typeSpeed={10} /></b>
            </div>
            <p id={country + '_trends'}>
                <BarChart
                    width={1000}
                    height={600}
                    data={chartData}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="keyword" angle={270} orientation="top" fontSize={10} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="traffic" fill={color} onClick={e => { copyToClipboard(e.keyword) }} />
                </BarChart>
            </p>
            <div className='w3-padding w3-center'>
                <Link to="/keywords" style={{ textDecoration: "none" }} className='w3-button w3-round w3-green w3-margin-right'>All Countries 🗺</Link>
                <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_trends') }}>⤵</button>
            </div>
        </Modal>
    )
}