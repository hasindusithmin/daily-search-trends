import Rodal from 'rodal';
import { PieChart, Pie, Tooltip } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
import { downloadChart, isMobile } from '../utils/commons';


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
        <Rodal
            visible={pieChartData}
            width={isMobile() ? window.innerWidth : window.innerWidth * 0.5}
            height={isMobile() ? window.innerHeight : window.innerHeight * 0.75}
            showMask={true}
            closeOnEsc={true}
            className='w3-padding-64 w3-mobile'
            onClose={() => { setPieChartData(null) }}
        >
            <div className='w3-center w3-padding-32 w3-large w3-opacity' style={{ textDecoration: 'underline' }}>
                <Typewriter words={[`Here are top trending keywords in the ${country}`]} typeSpeed={20} />
            </div>
            <p id={country + '_trends'}>
                <PieChart width={isMobile() ? window.innerWidth : window.innerWidth * 0.49} height={isMobile() ? window.innerWidth / 1.2 : window.innerHeight * 0.5}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={true}
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={isMobile() ? window.innerWidth / 4 : window.innerWidth * 0.1}
                        fill="#2196F3"
                        label
                    />
                    <Tooltip />
                </PieChart>
            </p>
            <div className='w3-padding w3-center'>
                <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '_trends') }}>Download ⤵</button>
            </div>
        </Rodal>
    )
}