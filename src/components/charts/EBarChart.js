import ReactEcharts from "echarts-for-react"
import * as echarts from 'echarts/core';
import { flags, isMobile, iso } from "../../utils/commons";
import moment from "moment";
import { useState } from "react";
import RoModal from "../Modals/RoModal";
export default function EBarCharart({ rawData, fromTime, toTime }) {

    const options = {
        title: {
            text: '',
            subtext: `from ${moment(fromTime).format('MMMM Do YYYY, h:mm A')} to ${moment(toTime).format('MMMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            data: Object.keys(rawData),
            axisLabel: {
                inside: true,
                color: '#fff'
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            z: 10
        },
        yAxis: {
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                color: '#999'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function ({ name, value }) {
                return `${flags[name]}${iso[name]} ${value} Results`
            },
        },
        series: [
            {
                type: 'bar',
                showBackground: true,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: '#355C7D' },
                        { offset: 0.5, color: '#6C5B7B' },
                        { offset: 0, color: '#C06C84' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#355C7D' },
                            { offset: 0.5, color: '#6C5B7B' },
                            { offset: 1, color: '#C06C84' }
                        ])
                    }
                },
                data: Object.values(rawData).map(array => array.length)
            }
        ]
    };

    const [code, setCode] = useState(null);
    const [data, setData] = useState(null);

    const onEvents = {
        click: ({ name }) => {
            setCode(name);
            setData(rawData[name]);
        }
    }

    return (
        <>
            <ReactEcharts
                option={options}
                style={{ width: (options.xAxis.data.length) * 50, height: 500 }}
                onEvents={onEvents}
            />
            <RoModal
                code={code} 
                data={data} 
                setData={setData}
                fromTime={fromTime}
                toTime={toTime}
            />
        </>
    )
}
