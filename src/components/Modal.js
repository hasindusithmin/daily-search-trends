import Rodal from 'rodal';
import { Treemap } from 'recharts';
import { Typewriter } from 'react-simple-typewriter';
import { downloadChart, copyToClipboard } from '../utils/commons';
import CustomizedContent from './CustomContentTreemap';
import { isMobile } from "../utils/commons";


export default function BarModal({ country, color, chartData, setChartData }) {

    return (
        <Rodal
            visible={chartData}
            width={isMobile() ? window.innerWidth : window.innerWidth * 0.5}
            height={isMobile() ? window.innerHeight : window.innerHeight * 0.75}
            showMask={true}
            closeOnEsc={true}
            className='w3-padding-64 w3-mobile'
            onClose={() => { setChartData(null) }}
        >
            <div className='w3-center w3-padding-32 w3-large w3-opacity' style={{ textDecoration: 'underline' }}>
                <Typewriter words={[`Here are top trending keywords in the ${country}`]} typeSpeed={20} />
            </div>
            <p id={country + '-treemap'} className='w3-center'>
                <Treemap
                    width={isMobile() ? window.innerWidth * 0.95 : window.innerWidth * 0.48}
                    height={isMobile() ? window.innerHeight * 0.5 : window.innerHeight * 0.49}
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
                <button className='w3-button w3-round-large' style={{ backgroundColor: '#8cafbfcf', color: '#ffffff' }} onClick={() => { downloadChart(country + '-treemap') }}>Download ⤵</button>
            </div>
        </Rodal>
    )
}