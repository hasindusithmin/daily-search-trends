import 'echarts-wordcloud';
import ReactEcharts from "echarts-for-react"
import { codes, getDevice, iso } from '../../utils/commons';
import { useState } from 'react';
import ETagCloudModal from '../Modals/ETagCloudModal';

export default function ETagCloud({ rawData }) {
    const { device, width } = getDevice();
    const size = device === "SM" ? width : 600;
    const option = {
        tooltip: {},
        series: [
            {
                type: 'wordCloud',
                shape: 'apple',
                width: size,
                height: size,
                sizeRange: device === "SM" ? [15, 40] : [25, 50],
                rotationRange: [-90, 90],
                rotationStep: 90,
                gridSize: 15,
                drawOutOfBound: true,
                shrinkToFit: true,
                layoutAnimation: true,
                textStyle: {
                    fontFamily: 'sans-serif',
                    fontWeight: 'bold',
                    color: function () {
                        return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                    }
                },
                data: Object.entries(rawData).map(([code, trends]) => ({
                    name: iso[code],
                    value: trends.reduce((sum, item) => sum + item.traffic, 0)
                }))
            }
        ],
        toolbox: {
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                saveAsImage: {},
            }
        },
    };

    const [data, setData] = useState([]);
    const [code, setCode] = useState(null);
    const [color, setColor] = useState(null);

    const onEvents = {
        click: ({ name, color }) => {
            setColor(color);
            setCode(codes[name])
            setData(codes[name] ? rawData[codes[name]] : [])
        }
    }

    return (
        <>
            <ReactEcharts
                option={option}
                style={{ width: size, height: size }}
                onEvents={onEvents}
            />
            <ETagCloudModal
                code={code}
                color={color}
                data={data}
                setData={setData}
            />
        </>
    )
}
