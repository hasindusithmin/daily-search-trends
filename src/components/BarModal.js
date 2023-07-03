import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
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

    return (
        <Modal
            isOpen={chartData}
            style={customStyles}
            ariaHideApp={false}
        >
            <span onClick={() => { setChartData(null) }} className="w3-button w3-display-topright w3-padding">✖️</span>
            <div className='w3-center w3-padding-32 w3-xlarge w3-opacity'><b></b></div>
            <div className='w3-center w3-padding-32 w3-large w3-opacity'>
                <b><Typewriter words={[`Here are today's top trending keywords in the ${country} ${flags[country]}`]} typeSpeed={10}/></b>
            </div>

            <BarChart
                width={1000}
                height={600}
                data={chartData}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="keyword" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="traffic" fill={color} />
            </BarChart>
            <div className='w3-padding w3-center'>
                <Link to="/keywords" style={{ textDecoration: "none" }} className='w3-button w3-round w3-blue'>View All Countries 🗺</Link>
            </div>
        </Modal>
    )
}