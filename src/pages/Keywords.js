import axios from "axios"
import { useEffect, useState } from "react";
import { Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from "react-router-dom";

const CustomizedContent = ({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
    const isLeafNode = depth === 1;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: isLeafNode ? colors[Math.floor((index / root.children.length) * colors.length)] : '#ffffff00',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {isLeafNode && (
                <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
                    {name}
                </text>
            )}
            {isLeafNode && (
                <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
                    {index + 1}
                </text>
            )}
        </g>
    );
};

export default function Keywords() {

    const [colors, setColors] = useState(null);
    const [treeMapData, setTreeMapData] = useState(null);
    const [treeMapDataObj, setTreeMapDataObj] = useState({});

    const nationalColors = {
        "India": "#FF9933",
        "United States": "#B22234",
        "Indonesia": "#CE1126",
        "Brazil": "#009B3A",
        "Russia": "#D52B1E",
        "Japan": "#BC002D",
        "Nigeria": "#008751",
        "Mexico": "#006847",
        "Germany": "#000000",
        "Canada": "#FF0000"
    }
    const flags = {
        "India": "🇮🇳",
        "United States": "🇺🇸",
        "Indonesia": "🇮🇩",
        "Brazil": "🇧🇷",
        "Russia": "🇷🇺",
        "Japan": "🇯🇵",
        "Nigeria": "🇳🇬",
        "Mexico": "🇲🇽",
        "Germany": "🇩🇪",
        "Canada": "🇨🇦"
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('https://trendsapi-1-q3464257.deta.app')
                const Countries = res.data;
                const treeMapDataArr = []
                const treeMapDataObj = {}
                const colorsArr = []
                for (const Country of Countries) {
                    const obj = {};
                    const { country, trends, flag } = Country;
                    colorsArr.push(nationalColors[country])
                    obj['name'] = `${flag} ${country}`;
                    obj['children'] = trends.map(({ keyword, traffic }) => ({ name: keyword, size: traffic }))
                    treeMapDataArr.push(obj);
                    treeMapDataObj[country] = trends.map(({ keyword, traffic }) => ({ keyword, traffic }));
                }
                setColors(colorsArr);
                setTreeMapData(treeMapDataArr);
                setTreeMapDataObj(treeMapDataObj)
            } catch (error) {
                console.error(error.message);
            }
        })()
    }, [])


    return (
        <div className="w3-content">
            <div className="w3-center w3-padding">
                <Link to="/" style={{ textDecoration: 'none' }} className="w3-xxlarge">Daily Search Trends</Link>
                <p className="w3-center">The 10 countries with the highest amount of internet users</p>
            </div>
            <div className="w3-padding-32">
                <div className="w3-large w3-center"><b>Daily Trends</b></div>
                {
                    treeMapData &&
                    <Treemap
                        width={1000}
                        height={600}
                        data={treeMapData}
                        dataKey="size"
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedContent colors={colors} />}
                    />
                }
            </div>
            {
                treeMapDataObj.length !== 0 &&
                Object.entries(treeMapDataObj).map(([country, data], index) => (
                    <div className="w3-padding-32" key={country}>
                        <div className="w3-center"><b>Daily Search Trends - {country} {flags[country]}</b></div>
                        <BarChart
                            title={country}
                            width={1000}
                            height={600}
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="keyword" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="traffic" fill={nationalColors[country]} background={{ fill: '#F0F0F0' }} />
                        </BarChart>
                    </div>
                ))
            }

        </div>
    )
}