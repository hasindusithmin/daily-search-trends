import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { flags, formatNumberAbbreviation, formatToBrowserTimezone, getDevice, iso, openNewsModal } from "../../utils/commons";
import { useState } from "react";
export default function EPieChartModal({ code, data, color, setData }) {

    const { device, width, height } = getDevice();
    const size = device === "SM" ? width : 600;

    const ranges = [
        { min: 100, max: 1000, name: "0.1K - 1K" },
        { min: 1000, max: 10000, name: "1K - 10K" },
        { min: 10000, max: 100000, name: "10K - 100K" },
        { min: 100000, max: 1000000, name: "100K - 1M" },
        { min: 1000000, max: 10000000, name: "1M+" }
    ]

    const categorizedData = ranges.map(({ min, max, name }) => ({
        "level": name,
        "data": data ? data.filter(({ traffic }) => traffic >= min && traffic <= max) : [],
    }));

    const initOption = {
        title: {
            text: `Classification By Searches ${flags[code]}`,
            subtext: `${width} x ${height}`,
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
                color: '#333'
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
                    color: color
                },
                emphasis: {},
                data: categorizedData.map(({ data }) => data.length)
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
                myTool1: {
                    show: true,
                    title: 'Close',
                    icon: 'path://M 20,4 3,21 33,50 3,80 20,97 49,67 79,97 95,80 65,50 95,20 80,4 50,34 z',
                    onclick: function () {
                        setData(null);
                        setOption(null);
                    }
                }
            }
        },
    };

    const [option, setOption] = useState(null);

    const onEvents = {
        click: ({ name }) => {
            const filteredData = categorizedData.filter(({ level }) => level === name)[0]['data'];
            setOption({
                title: {
                    text: `Range: ${name}`,
                    subtext: `${width} x ${height}`,
                    left: 'left'
                },
                tooltip: {
                    formatter: function (props) {
                        const { name, value, date } = props.data;
                        return `${name}<br>${formatNumberAbbreviation(value)}+ searches<br>${formatToBrowserTimezone(date)}`
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
                                setOption(null)
                            }
                        },
                        myTool2: {
                            show: true,
                            title: 'Close',
                            icon: 'path://M 20,4 3,21 33,50 3,80 20,97 49,67 79,97 95,80 65,50 95,20 80,4 50,34 z',
                            onclick: function () {
                                setData(null);
                                setOption(null);
                            }
                        }
                    }
                },
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: "75%",
                        center: ['50%', '50%'],
                        data: filteredData.map(({ title, traffic, pubDate }) => ({ name: title, value: traffic, date: pubDate })),
                        emphasis: {}
                    }
                ]
            })
        }
    }

    const onEventsV2 = {
        click: ({ name }) => {
            let { title, country, news, picture } = data.filter(({ title }) => title === name)[0];
            openNewsModal(title, country = iso[country], news, picture)
        }
    }

    return (
        <Rodal
            visible={data}
            showCloseButton={false}
            onClose={() => { setData(null); setOption(null); }}
            width={size}
            height={size}
            animation="door"
            customStyles={{ padding: 0, overflow: "scroll" }}
        >
            {
                <div className="hide-scrollbar">
                    {
                        !option ?
                            (
                                <ReactEcharts
                                    option={initOption}
                                    style={{ width: size, height: size }}
                                    onEvents={onEvents}
                                />
                            )
                            :
                            (
                                <ReactEcharts
                                    option={option}
                                    style={{ width: size, height: size }}
                                    onEvents={onEventsV2}
                                />
                            )
                    }
                </div>
            }
        </Rodal>

    )
}
