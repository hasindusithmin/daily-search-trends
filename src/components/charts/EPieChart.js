import ReactEcharts from "echarts-for-react"
import { formatNumberAbbreviation, iso } from "../../utils/commons";
import { useState } from "react";
import TtModal from "../Modals/TtModal";
export default function EPieChart({ rawData }) {

  const totalTraffic = formatNumberAbbreviation(
    Object.values(rawData)
      .reduce((acc, array) => acc + array.reduce((subAcc, { traffic }) => subAcc + traffic, 0), 0)
  )

  const options = {
    title: {
      text: 'Worldwide teach in one slice',
      subtext: `${totalTraffic}+ Searches in ${Object.values(rawData).length} Countries`,
      left: 'right'
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
        center: ['50%', '50%'],
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

  const [code, setCode] = useState(null);
  const [data, setData] = useState(null);
  const [color, setColor] = useState(null);

  const onEvents = {
    click: ({ name, color }) => {
      setCode(name);
      setData(rawData[name]);
      setColor(color);
    }
  }

  return (
    <>
      <ReactEcharts
        option={options}
        style={{ width: window.innerWidth / 3, height: window.innerWidth / 3 }}
        onEvents={onEvents}
      />
      <TtModal
        code={code}
        data={data}
        color={color}
        setData={setData}
      />
    </>
  )
}
