import 'echarts-wordcloud';
import ReactEcharts from "echarts-for-react"
import { codes, getDevice, iso } from '../../utils/commons';
import { useState } from 'react';
import ETagCloudModal from '../Modals/ETagCloudModal';
import moment from 'moment';

export default function ETagCloud({ rawData, fromTime, toTime }) {
    const { device, width } = getDevice();
    const size = device === "SM" ? width : 600;
    const option = {
        title: {
            subtext: `From ${moment(fromTime).format('MMM Do, h:mm A')} To ${moment(toTime).format('MMM Do, h:mm A')}`,
            left: 'left'
        },
        tooltip: {},
        series: [
            {
                type: 'wordCloud',
                shape: 'square',
                width: "95%",
                // height: size,
                sizeRange: device === "SM" ? [15, 40] : [25, 50],
                rotationRange: [0, 0],
                // rotationStep: 90,
                gridSize: 10,
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
                style={{ width: "80%", height: 300 }}
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
