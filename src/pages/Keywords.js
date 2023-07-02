import axios from "axios"
import { useEffect, useState } from "react";
import { Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from "react-router-dom";
import CustomizedContent from "../components/CustomContentTreemap";
import { Typewriter } from "react-simple-typewriter";
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
            <div className="w3-center w3-padding-64">
                <div className="w3-xlarge">
                    Daily Search Trends
                </div>
                <p>
                    <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                </p>
                <Link to="/" className='w3-button w3-small w3-round-large'>↩ Back To Home</Link>
            </div>
            <div className="w3-padding-32">
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