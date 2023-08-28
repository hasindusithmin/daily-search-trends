import ReactEcharts from "echarts-for-react"
import { formatNumberAbbreviation, iso } from "../../utils/commons";
export default function EPieChart({ rawData }) {

  const options = {
    title: {
      text: 'TOTAL TRAFFIC',
      subtext: 'By Countries',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: function ({ name, value, percent }) {
        return `${iso[name]} ${formatNumberAbbreviation(value)}+ ${percent}%`
      }
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: '80%',
        center: ['40%', '50%'],
        data: Object.entries(rawData).map(([key, value]) => ({ name: key, value: value.reduce((total, item) => total + item.traffic, 0) })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          }
        }
      }
    ]
  };

  return (
    <ReactEcharts
      option={options}
      style={{ width:window.innerWidth, height: 500 }}
    ></ReactEcharts>
  )
}
