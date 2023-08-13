import Rodal from 'rodal';
import { Typewriter } from 'react-simple-typewriter';
import { isMobile, formatNumberAbbreviation } from '../utils/commons';
import CanvasJSReact from '@canvasjs/react-charts';
import { useEffect, useState } from 'react';


export default function PieChartModal({ country, pieChartData, setPieChartData }) {

    const [chartOpts, setChartOpts] = useState(null);
    useEffect(() => {
        setChartOpts({
            theme: "light",
            animationEnabled: true,
            exportFileName: `${country}_daily_search_trends`,
            exportEnabled: true,
            title: {
                text: `${country} Trending Searches`
            },
            data: [{
                type: "pie",
                showInLegend: true,
                legendText: `{label}`,
                toolTipContent: "{label}<b><sup>{abbr}+</sup></b>",
                indexLabel: "{y}",
                indexLabelPlacement: "inside",
                dataPoints: pieChartData
            }]
        })
    }, [])

    const CanvasJSChart = CanvasJSReact.CanvasJSChart;


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
            {
                chartOpts && (
                    <div >
                        <CanvasJSChart options={chartOpts} />
                    </div>
                )
            }
        </Rodal>
    )
}