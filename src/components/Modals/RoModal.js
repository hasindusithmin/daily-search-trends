import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { flags, iso } from "../../utils/commons";
export default function RoModal({ code, data, setData }) {

    const options = {
        title: {
            text: 'Trending searches',
            subtext: `In ${iso[code]} ${flags[code]}`,
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

    return (
        <Rodal
            visible={data}
            onClose={() => { setData(null) }}
            width={size}
            height={size}
            animation="door"
            customStyles={{padding:0}}
        >
            <ReactEcharts
                option={options}
                style={{ width: size, height: size }}
            />
        </Rodal>

    )
}
