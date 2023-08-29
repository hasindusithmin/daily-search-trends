import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { flags, iso, openNewsModal } from "../../utils/commons";
import { useState } from "react";
import Swal from "sweetalert2";
export default function TtModal({ code, data, color, setData }) {

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
            subtext: 'Classification By Traffic',
            text: `${iso[code]} ${flags[code]}`,
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
        tooltip: {},
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
        ]
    };

    const [option, setOption] = useState(null);

    const size = window.innerWidth / 3;

    const onEvents = {
        click: ({ name }) => {
            const filteredData = categorizedData.filter(({ level }) => level === name)[0]['data'];
            setOption({
                title: {
                    text: name,
                    subtext: `${iso[code]} ${flags[code]}`,
                    left: 'left'
                },
                tooltip: {},
                series: [
                    {
                        name: '',
                        type: 'pie',
                        radius: "75%",
                        center: ['50%', '50%'],
                        data: filteredData.map(({ title, traffic }) => ({ name: title, value: traffic })),
                        emphasis: {}
                    }
                ]
            })
        }
    }

    const onEventsV2 = {
        click: ({ name }) => {
            const { title, country, news, picture } = data.filter(({ title }) => title === name)[0];
            openNewsModal(title, country, news, picture)
        }
    }

    return (
        <Rodal
            visible={data}
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
                                <>
                                    <div style={{ padding: 5 }}>
                                        <button
                                            className="w3-btn w3-round-xlarge"
                                            style={{ fontSize: 16 }}
                                            onClick={() => { setOption(null) }}
                                            title="Go back"
                                        >
                                            ↩️
                                        </button>
                                    </div>
                                    <ReactEcharts
                                        option={option}
                                        style={{ width: size, height: size }}
                                        onEvents={onEventsV2}
                                    />
                                </>
                            )
                    }
                </div>
            }
        </Rodal>

    )
}
