import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { copyToClipboard, flags, iso } from "../../utils/commons";
import moment from "moment";
export default function RoModal({ code, data, setData, fromTime, toTime }) {

    const options = {
        title: {
            text: `${data && data.length} trending searches in ${iso[code]} ${flags[code]}`,
            subtext: `from ${moment(fromTime).format('MMMM Do YYYY, h:mm A')} to ${moment(toTime).format('MMMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        tooltip: {},
        series: [
            {
                name: '',
                type: 'pie',
                radius: "75%",
                center: ['50%', '50%'],
                data: data ? data.map(({ title, traffic }) => ({ name: title, value: traffic })) : null,
                emphasis: {}
            }
        ]
    };

    const size = window.innerWidth / 3;

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
