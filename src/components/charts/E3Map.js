import ReactEcharts from "echarts-for-react"
import { flags, getDevice } from "../../utils/commons";
import moment from "moment";
export default function E3Map({ rawData, fromTime, toTime }) {

    const { device, width } = getDevice()

    const options = {
        title: {
            text: 'Hierarchical Trends Analysis',
            subtext: `From ${moment(fromTime).format('MMMM Do YYYY, h:mm A')} To ${moment(toTime).format('MMMM Do YYYY, h:mm A')}`,
            left: ''
        },
        tooltip: {},
        series: [
            {
                name: 'countries',
                type: 'treemap',
                visibleMin: 300,
                zoomLock: true,
                roam: false,
                left: 0,
                data: Object.entries(rawData).map(([key, value]) => ({ name: flags[key], children: value.map(obj => ({ name: `${flags[key]}.${obj.title}`, value: obj.traffic })) })),
                leafDepth: 1,
                levels: [
                    {
                        itemStyle: {
                            borderColor: '#555',
                            borderWidth: 4,
                            gapWidth: 4
                        }
                    },
                    {
                        colorSaturation: [0.3, 0.6],
                        itemStyle: {
                            borderColorSaturation: 0.7,
                            gapWidth: 2,
                            borderWidth: 2
                        }
                    },
                    {
                        colorSaturation: [0.3, 0.5],
                        itemStyle: {
                            borderColorSaturation: 0.6,
                            gapWidth: 1
                        }
                    },
                    {
                        colorSaturation: [0.3, 0.5]
                    }
                ]
            }
        ]
    }

    return (
        <ReactEcharts
            option={options}
            style={{ width: device === "SM" ? width : width >= 1280 ? 1600 : 1.225 * width, height: 500 }}
        ></ReactEcharts>
    )
}
