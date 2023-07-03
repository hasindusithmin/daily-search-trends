import axios from "axios"
import { useEffect, useState } from "react";
import { Treemap, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from "react-router-dom";
import CustomizedContent from "../components/CustomContentTreemap";
import { Typewriter } from "react-simple-typewriter";
export default function Keywords() {

    const [treeMapData, setTreeMapData] = useState(null);
    const [treeMapDataObj, setTreeMapDataObj] = useState({});

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
                // const res = await axios.get('https://gist.githubusercontent.com/hasindusithmin/8d411a5eb73b290aaceebb5fcb8626ad/raw/9291d0baf760841e755fa30380eb003b15c3eba8/keywords.json');
                const Countries = res.data;
                const treeMapDataArr = []
                const treeMapDataObj = {}
                for (const Country of Countries) {
                    const obj = {};
                    const { country, trends, flag } = Country;
                    obj['name'] = `${flag} ${country}`;
                    const data = trends.map(({ keyword, traffic }) => ({ name: keyword, size: traffic }));
                    data.sort((a, b) => b.size - a.size);
                    obj['children'] = data
                    obj['traffic'] = data.reduce((sum, item) => sum + item.size, 0)
                    treeMapDataArr.push(obj);
                    treeMapDataObj[`${flag} ${country}`] = trends.map(({ keyword, traffic }) => ({ keyword, traffic }));
                }
                treeMapDataArr.sort((a, b) => b.traffic - a.traffic);
                const countryRank = treeMapDataArr.map(({ name }) => name)
                const sortedTreeMapDataObj = Object.fromEntries(
                    countryRank.map(name => [name, treeMapDataObj[name]])
                );
                setTreeMapData(treeMapDataArr);
                setTreeMapDataObj(sortedTreeMapDataObj)
            } catch (error) {
                console.error(error.message);
            }
        })()
    }, [])

    const isMobile = () => {
        if (/Android|iPhone/i.test(window.navigator.userAgent)) {
            return true
        } else {
            return false
        }
    }

    const colors = [
        "#004400",  // dark green
        "#006600",  // pakistan green
        "#008000",  // office green
        "#228B22",  // forest green
        "#32CD32",  // lime green
        "#3CB371",  // medium sea green
        "#66CDAA",  // medium aquamarine
        "#98FB98",  // pale green
        "#ADFF2F",  // green yellow
        "#ccffcc"   // honeydew
    ];



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
                <h5 className="w3-center w3-opacity" style={{ fontWeight: 'bold' }}>🗺 Countries with the highest number of internet users</h5>
                {
                    treeMapData &&
                    <div className={window && isMobile() ? 'w3-responsive' : ''}>
                        <Treemap
                            width={1000}
                            height={600}
                            data={treeMapData}
                            dataKey="size"
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent colors={colors} />}
                        />
                    </div>
                }
            </div>
            {
                treeMapDataObj.length !== 0 &&
                Object.entries(treeMapDataObj).map(([country, data], index) => (
                    <div className="w3-padding-32">
                        <div className="w3-center w3-padding"><b>Daily Search Trends - {country} {flags[country]}</b></div>
                        <div className={window && isMobile() ? 'w3-responsive' : ''}>
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
                                <Bar dataKey="traffic" fill={colors[index]} />
                            </BarChart>
                        </div>
                    </div>
                ))
            }

        </div>
    )
}