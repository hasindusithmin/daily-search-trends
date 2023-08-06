import Modal from 'react-modal';
import { PieChart, Pie, Tooltip } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
import { downloadChart } from '../utils/commons';


export default function PieChartModal({ country, pieChartData, setPieChartData }) {

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
            isOpen={pieChartData}
            style={customStyles}
            ariaHideApp={false}
        >
            <div className='w3-center'>
                <span onClick={() => { setPieChartData(null) }} className="w3-btn w3-red w3-round w3-padding">close</span>
            </div>
            <div className='w3-center w3-padding-32 w3-large w3-opacity'>
                <Typewriter words={[`Here are top trending keywords in the ${country}`]} typeSpeed={20} />
            </div>
            <p id={country + '_trends'}>
                <PieChart width={700} height={500}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={true}
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={200}
                        fill="#2196F3"
                        label
                    />
                    <Tooltip />
                </PieChart>
            </p>
            <div className='w3-padding w3-center'>
                <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_trends') }}>Download ⤵</button>
            </div>
        </Modal>
    )
}