import Modal from 'react-modal';
import { Treemap } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
import { downloadChart, copyToClipboard } from '../utils/commons';
import CustomizedContent from './CustomContentTreemap';
import { isMobile } from "../utils/commons";


export default function BarModal({ country, color, chartData, setChartData }) {

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
            <div className='w3-center'>
                <span onClick={() => { setChartData(null) }} className="w3-btn w3-red w3-round-large w3-padding">close</span>
            </div>
            <div className='w3-center w3-padding-32 w3-large w3-opacity'>
                <Typewriter words={[`Here are top trending keywords in the ${country}`]} typeSpeed={20} />
            </div>
            <p id={country + '_trends'}>
                <Treemap
                    width={isMobile() ? 380 : 800}
                    height={isMobile() ? 285 : 500}
                    data={chartData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    content={<CustomizedContent colors={new Array(20).fill(color)} />}
                    style={{ cursor: 'pointer' }}
                    onClick={e => { copyToClipboard(e['name']) }}
                />
            </p>
            <div className='w3-padding w3-center'>
                <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_trends') }}>Download ⤵</button>
            </div>
        </Modal>
    )
}