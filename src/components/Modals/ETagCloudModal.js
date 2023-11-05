import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { flags, getDevice, iso, openNewsModal } from "../../utils/commons";

export default function ETagCloudModal({ code, color, data, setData }) {
    const { device, width, height } = getDevice();
    const size = device === "SM" ? width : 600;
    const option = {
        title: {
            text: `${iso[code]} ${flags[code]}`,
            subtext: `${width}x${height}`,
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
                shape: 'circle',
                width: size * 0.9,
                height: size * 0.9,
                sizeRange: [15, 30],
                rotationRange: [-90, 90],
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
