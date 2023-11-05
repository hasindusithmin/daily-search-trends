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
