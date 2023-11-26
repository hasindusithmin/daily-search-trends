import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { flags, getDevice, iso, openNewsModal } from "../../utils/commons";
import moment from "moment";
export default function ETagCloudModal({ code, color, data, setData, fromTime, toTime }) {
    const { device, width, height } = getDevice();
    const size = device === "SM" ? width : 600;
    const option = {
        title: {
            text: `${iso[code]} ${flags[code]}`,
            subtext: `From ${moment(fromTime).format('MMM Do, h:mm A')} To ${moment(toTime).format('MMM Do, h:mm A')}`,
            left: 'left',
            textStyle: {
                fontSize: 20,
                color: color
            }
        },
        tooltip: {},
        series: [
            {
                type: 'wordCloud',
                shape: 'square',
                width: size,
                height: size,
                sizeRange: [15, 30],
                rotationRange: [0, 0],
                // rotationStep: 90,
                gridSize: 10,
                drawOutOfBound: true,
                shrinkToFit: true,
                layoutAnimation: true,
                textStyle: {
                    fontFamily: 'sans-serif',
                    fontWeight: '600',
                    color: color
                },
                data: data.map(({ title, traffic }) => ({
                    name: title,
                    value: traffic
                }))
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
                myTool1: {
                    show: true,
                    title: 'Close',
                    icon: 'path://M 20,4 3,21 33,50 3,80 20,97 49,67 79,97 95,80 65,50 95,20 80,4 50,34 z',
                    onclick: function () {
                        setData([])
                    }
                }
            }
        },
    };

    const onEvents = {
        click: ({ name }) => {
            const object = data.filter(({ title }) => title === name)[0] || {};
            if (Object.keys(object).length > 0) {
                let { title, country, news, picture } = object;
                openNewsModal(title, country = iso[country], news, picture)
            }
        }
    }

    return (
        <Rodal
            visible={data.length > 0}
            onClose={() => { setData([]) }}
            showCloseButton={false}
            width={size}
            height={size}
            animation="flip"
            customMaskStyles={{ padding: 0 }}
        >
            <ReactEcharts
                option={option}
                style={{ width: size, height: size }}
                onEvents={onEvents}
            />
        </Rodal>

    )
}
