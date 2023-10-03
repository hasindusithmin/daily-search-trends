import ReactEcharts from "echarts-for-react"
import * as echarts from 'echarts/core';
import { showQuestionModal, truncateText } from "../../../utils/commons";

export default function BarChartComponent({ data, field, keyword, top, bottom }) {

    const options = {
        title: {
            text: field,
            subtext: `${field} Count for ${keyword} - Related Questions`,
            left: 'left'
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            data: data.map(({ question }) => truncateText(question, 50)),
            axisLabel: {
                show: false
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
                return `${name}<br><b>${value}</b> upvotes`;
            },
        },
        series: [
            {
                type: 'bar',
                showBackground: true,
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 1, color: top || '#111' },
                        { offset: 0, color: bottom || '#555' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 1, color: bottom || '#111' },
                            { offset: 0, color: top || '#555' }
                        ])
                    }
                },
                data: data.map(object => object[field.toLowerCase()])
            }
        ]
    };

    const onEvents = {
        click: ({ name }) => {
            const object = data.filter(({ question }) => name === truncateText(question, 50))[0] || {}
            showQuestionModal(object)
        }
    }

    return (
        <>
            <ReactEcharts
                option={options}
                style={{ width: (options.xAxis.data.length) * 50, height: 500 }}
                onEvents={onEvents}
            />
        </>
    )
}
