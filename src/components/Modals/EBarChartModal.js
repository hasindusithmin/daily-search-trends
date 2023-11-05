import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { copyToClipboard, flags, formatNumberAbbreviation, formatToBrowserTimezone, getDevice, iso } from "../../utils/commons";

export default function EBarChartModal({ code, data, setData }) {
    const { device, width, height } = getDevice();
    const options = {
        title: {
            text: `${data && data.length} trending searches in ${iso[code]} ${flags[code]}`,
            subtext: `${width} x ${height}`,
            left: 'left'
        },
        tooltip: {
            formatter: function (props) {
                const { name, value, date } = props.data;
                return `${name}<br>${formatNumberAbbreviation(value)}+ searches<br>${formatToBrowserTimezone(date)}`
            }
        },
        series: [
            {
                name: '',
                type: 'pie',
                radius: "75%",
                center: ['50%', '50%'],
                data: data ? data.map(({ title, traffic, pubDate }) => ({ name: title, value: traffic, date: pubDate })) : null,
                emphasis: {}
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
                myTool1: {
                    show: true,
                    title: 'Entity Analysis',
                    icon: 'path://M42.3 22.6H26.9v6.2H41v5H26.9v7.5H43v5.2H21v-29h21.3v5.1z',
                    onclick: function () {
                        
                    }
                },
                myTool2: {
                    show: true,
                    title: 'Sentiment Analysis',
                    icon: 'path://M26,2C12.8,2,2,12.8,2,26.1c0,13.3,10.8,24.1,24,24.1s24-10.8,24-24.1C50,12.8,39.2,2,26,2z M17,15 c1.7,0,3,1.8,3,4c0,2.2-1.3,4-3,4c-1.7,0-3-1.8-3-4C14,16.8,15.3,15,17,15z M14,38.7c0.5-6.1,5-11.2,12.1-11.2 c7,0,11.4,5.1,11.9,11.2H14z M35,23c-1.7,0-3-1.8-3-4c0-2.2,1.3-4,3-4c1.7,0,3,1.8,3,4C38,21.2,36.7,23,35,23z',
                    onclick: function () {
                        
                    }
                },
                myTool3: {
                    show: true,
                    title: 'Content Classification',
                    icon: 'path://M17.023 9.216s-.386-3.293-3.955-3.385c-3.57-.091-5.402 2.47-5.402 6.13 0 3.66 2.026 6.588 5.498 6.588 3.473 0 3.86-3.66 3.86-3.66l6.656.366s.391 3.306-2.394 5.828C18.5 23.605 15.082 24.017 12.694 24c-2.388-.018-5.698.034-8.9-2.969C.595 18.03.05 15.113.05 12.248c0-2.866.607-6.661 4.414-9.54C7.05.754 9.673.033 12.296.033 23.246.032 23.98 9.28 23.98 9.28z',
                    onclick: function () {
                        
                    }
                },
                myTool4: {
                    show: true,
                    title: 'Close',
                    icon: 'path://M 20,4 3,21 33,50 3,80 20,97 49,67 79,97 95,80 65,50 95,20 80,4 50,34 z',
                    onclick: function () {
                        setData(null)
                    }
                },
            }
        },
    };

    const size = device === "SM" ? width : 600

    const onEvents = {
        click: ({ name }) => {
            copyToClipboard(name)
        }
    }

    return (
        <Rodal
            visible={data}
            showCloseButton={false}
            onClose={() => { setData(null) }}
            width={size}
            height={size}
            animation="door"
            customStyles={{ padding: 0 }}
        >
            <ReactEcharts
                option={options}
                style={{ width: size, height: size }}
                onEvents={onEvents}
            />
        </Rodal>

    )
}
