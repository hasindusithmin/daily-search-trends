import ReactEcharts from "echarts-for-react"
import { flags } from "../../utils/commons";
export default function E3Map({ rawData }) {
    const options = {
        title: {
            text: 'Hierarchical Trends Analysis of Popular Searches (beta)',
            subtext: 'Easily Spot Patterns in Trending Searches',
            left: ''
        },
        tooltip: {},
        series: [
            {
                name: 'countries',
                type: 'treemap',
                visibleMin: 300,
                zoomLock:true,
                left:0,
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
            style={{ width: 1600, height: 500 }}
        ></ReactEcharts>
    )
}
