import ReactEcharts from "echarts-for-react"
import { formatNumberAbbreviation, getDevice, iso } from "../../utils/commons";
import { useState } from "react";
import EPieChartModal from "../Modals/EPieChartModal";
import moment from "moment";
export default function EPieChart({ rawData, fromTime, toTime }) {

  const totalTraffic = formatNumberAbbreviation(
    Object.values(rawData)
      .reduce((acc, array) => acc + array.reduce((subAcc, { traffic }) => subAcc + traffic, 0), 0)
  )

  const { device, width } = getDevice()

  const options = {
    title: {
      text: `${totalTraffic}+ Searches in ${Object.values(rawData).length} Countries`,
      subtext: `From ${moment(fromTime).format('MMM Do, h:mm A')} To ${moment(toTime).format('MMM Do, h:mm A')}`,
      // left: device === "SM" ? "left" : "right"
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
    ],
    toolbox: {
      feature: {
        saveAsImage: {},
      }
    },
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
        style={{ width: device === "SM" ? width : 600, height: device === "SM" ? width : 600 }}
        onEvents={onEvents}
      />
      <EPieChartModal
        code={code}
        data={data}
        color={color}
        setData={setData}
        fromTime={fromTime}
        toTime={toTime}
      />
    </>
  )
}
