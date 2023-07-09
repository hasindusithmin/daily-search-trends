import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { Treemap } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
import { downloadChart } from '../utils/commons';
import CustomizedContent from './CustomContentTreemap';

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
                <Typewriter words={[`Here are top trending keywords in the ${country} ${flags[country]}`]} typeSpeed={20} />
            </div>
            <p id={country + '_trends'}>
                <Treemap
                    width={1000}
                    height={600}
                    data={chartData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomizedContent colors={new Array(20).fill(color)} />}
                    style={{ cursor: 'pointer' }}
                />
            </p>
            <div className='w3-padding w3-center'>
                <Link to="/keywords" style={{ textDecoration: "none" }} className='w3-button w3-round w3-blue-grey w3-margin-right'>All Countries 🗺</Link>
                <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_trends') }}>⤵</button>
            </div>
        </Modal>
    )
}