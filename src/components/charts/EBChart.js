import ReactEcharts from "echarts-for-react"
import { useState } from "react";
import { DataTableForBarChart, iso } from "../../utils/commons";
import * as echarts from 'echarts/core';
export default function EBChart({ rawData }) {

    const ranges = [
        { min: 100, max: 1000, name: "0.1K - 1K" },
        { min: 1000, max: 10000, name: "1K - 10K" },
        { min: 10000, max: 100000, name: "10K - 100K" },
        { min: 100000, max: 1000000, name: "100K - 1M" },
        { min: 1000000, max: 10000000, name: "1M+" }
    ]
    const _ = [].concat(...Object.values(rawData).map(array => array))
    const categorizedData = ranges.map(({ min, max, name }) => ({
        "level": name,
        "data": _.filter(({ traffic }) => traffic >= min && traffic <= max)
    }));

    const unoOption = {
        title: {
            subtext: "Classification By Searches",
            left: 'left'
        },
        grid: {
            left: '0%',
            right: '0%',
            bottom: '5%',
            containLabel: true
        },
        xAxis: {
            data: categorizedData.map(({ level }) => level),
            axisLabel: {
                inside: true,
                color: '#ffffff'
            },
            axisTick: {
                show: true
            },
            axisLine: {
                show: false
            },
            z: 10,
        },
        yAxis: {
            axisLine: {
                show: false
            },
            axisTick: {
                show: true
            },
            axisLabel: {
                color: '#999'
            }
        },
        tooltip: {
            formatter: function ({ name, value }) {
                return `Range: ${name}<br>Count: ${value} keywords`
            }
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
                data: categorizedData.map(({ data }) => data.length)
            }
        ],
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                saveAsImage: {}
            }
        },
    };

    const [dueOption, setDueOption] = useState(null);
    const [dueCategorized, setDueCategorized] = useState(null);

    const onEventsUno = {
        click: ({ name }) => {
            const filteredData = categorizedData.filter(obj => obj.level === name)[0].data;
            const levels = [...new Set(filteredData.map(({ traffic }) => traffic))];
            const categorized = levels.map(level => ({
                "level": level,
                "data": filteredData.filter(({ traffic }) => traffic === level)
            }));
            const sortedCategorized = categorized.sort((a, b) => a.level - b.level)
            setDueCategorized(sortedCategorized);
            setDueOption({
                title: {
                    subtext: `${name} Range Searches`,
                    left: 'left'
                },
                grid: {
                    left: '0%',
                    right: '0%',
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    data: sortedCategorized.map(({ level }) => level),
                    axisLabel: {
                        inside: true,
                        color: '#ffffff'
                    },
                    axisTick: {
                        show: true
                    },
                    axisLine: {
                        show: false
                    },
                    z: 10,
                },
                yAxis: {
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: true
                    },
                    axisLabel: {
                        color: '#999'
                    }
                },
                tooltip: {
                    formatter: function ({ name, value }) {
                        return `${name}<br>${value} keywords`
                    }
                },
                toolbox: {
                    feature: {
                        saveAsImage: {},
                        myTool1: {
                            show: true,
                            title: 'Go Back',
                            icon: 'path://M44 40.8361C39.1069 34.8632 34.7617 31.4739 30.9644 30.6682C27.1671 29.8625 23.5517 29.7408 20.1182 30.303V41L4 23.5453L20.1182 7V17.167C26.4667 17.2172 31.8638 19.4948 36.3095 24C40.7553 28.5052 43.3187 34.1172 44 40.8361Z',
                            onclick: function () {
                                setDueOption(null);
                            }
                        }
                    }
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
                        data: categorized.map(({ data }) => data.length)
                    }
                ]
            })

        }
    }

    const [treOption, setTreOption] = useState(null);
    const [groupedData, setGroupedData] = useState([]);
    let dueCopy = null;

    const onEventsDue = {
        click: ({ name }) => {
            const filteredData = dueCategorized.filter(obj => obj.level === parseInt(name))[0].data;
            const groupedByCountry = filteredData.reduce((groupedData, item) => {
                const country = item.country;
                if (!groupedData[country]) {
                    groupedData[country] = [];
                }
                groupedData[country].push(item);
                return groupedData;
            }, {});
            setGroupedData(groupedByCountry)
            dueCopy = dueOption;
            setDueOption(null);
            setTreOption({
                title: {
                    subtext: `Searches Classification By Countries (${name}+)`,
                    left: 'left'
                },
                grid: {
                    left: '0%',
                    right: '0%',
                    bottom: '5%',
                    containLabel: true
                },
                xAxis: {
                    data: Object.keys(groupedByCountry),
                    axisLabel: {
                        inside: true,
                        color: '#ffffff'
                    },
                    axisTick: {
                        show: true
                    },
                    axisLine: {
                        show: false
                    },
                    z: 10,
                },
                yAxis: {
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: true
                    },
                    axisLabel: {
                        color: '#999'
                    }
                },
                tooltip: {
                    formatter: function ({ name, value }) {
                        return `${iso[name]}<br>${value} keywords`
                    }
                },
                toolbox: {
                    feature: {
                        saveAsImage: {},
                        myTool1: {
                            show: true,
                            title: 'Go Back',
                            icon: 'path://M44 40.8361C39.1069 34.8632 34.7617 31.4739 30.9644 30.6682C27.1671 29.8625 23.5517 29.7408 20.1182 30.303V41L4 23.5453L20.1182 7V17.167C26.4667 17.2172 31.8638 19.4948 36.3095 24C40.7553 28.5052 43.3187 34.1172 44 40.8361Z',
                            onclick: function () {
                                setDueOption(dueCopy);
                                setTreOption(null);
                            }
                        }
                    }
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
                        data: Object.values(groupedByCountry).map(array => array.length)
                    }
                ]
            })

        }
    }

    const [data_, setData_] = useState([]);
    const onEventsTre = {
        click: (({ name }) => {
            setData_(groupedData[name])
        })
    }


    return (
        <div className="hide-scrollbar loader-container">
            {
                !dueOption && !treOption &&
                (
                    <ReactEcharts
                        option={unoOption}
                        style={{ width: (unoOption.xAxis.data.length) * 100, height: 500 }}
                        onEvents={onEventsUno}
                    />
                )
            }
            {
                dueOption && !treOption &&
                (
                    <ReactEcharts
                        option={dueOption}
                        style={{ width: (dueOption.xAxis.data.length) * 100, height: 500 }}
                        onEvents={onEventsDue}
                    />
                )
            }
            {
                !dueOption && treOption &&
                (
                    <>
                        <ReactEcharts
                            option={treOption}
                            style={{ width: (treOption.xAxis.data.length) * 100, height: 500 }}
                            onEvents={onEventsTre}
                        />
                        <DataTableForBarChart data={data_} setData={setData_} />
                    </>
                )
            }
        </div>
    )
}