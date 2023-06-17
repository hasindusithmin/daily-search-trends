import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link, useNavigate } from "react-router-dom";
import { Treemap } from 'recharts';
import { toast,ToastContainer } from 'react-toastify';

export default function Home() {

    const navigate = useNavigate();

    const columns = [
        {
            cell: row => <img src={row.picture} alt={row.title} width="30px" className="w3-circle" />,
            width: '30px',
            style: {
                padding: '10px'
            }
        },
        {
            name: 'Keyword',
            selector: row => row.title,
            sortable: true
        },
        {
            name: 'Traffic',
            selector: row => row.approx_traffic,
            sortable: true
        },
        {
            name: 'Description',
            selector: row => row.description,
        },
        {
            name: 'Public Date',
            selector: row => row.pub_date,
            sortable: true
        },
        {
            cell: row => <Link to={`/analytics/${row.title}`} className="w3-button w3-light-gray w3-round-large">View</Link>,
            allowOverflow: true,
            button: true,
            style: {
                padding: '10px'
            }
        }
    ];

    const [trends, setTrends] = useState(null);
    const [treeMapData, setTreeMapData] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await axios.get('https://trends-1-d9762565.deta.app');
                const trendingsearches = res.data;
                const data = trendingsearches.map(trendingsearch => ({
                    title: trendingsearch['title'],
                    approx_traffic: trendingsearch['ht:approx_traffic'],
                    description: trendingsearch['description'],
                    pub_date: moment(trendingsearch['pubDate'], "ddd, DD MMM YYYY HH:mm:ss Z").format("ddd, DD MMM YYYY HH:mm A"),
                    picture: trendingsearch['ht:picture'],
                }));
                setTrends(data);
                const _ = data.map(({ title, approx_traffic }) => ({ name: title, size: parseInt(approx_traffic.replace(/,/g, '').replace(/\+/g, ''), 10) }))
                setTreeMapData(_)
            } catch (error) {
                toast.info("Please try again in a few minutes", { autoClose: 1500, hideProgressBar: true })
            }
        })();
    }, []);

    const customStyles = {
        headCells: {
            style: {
                backgroundColor: '#f2f2f2',
                fontWeight: 'bold',
                paddingLeft: '12px',
                paddingRight: '12px',
            },
        },
        cells: {
            style: {
                paddingLeft: '12px',
                paddingRight: '12px',
                fontSize: '14px',
            },
        },
        rows: {
            style: {
                borderBottomStyle: 'solid',
                borderBottomWidth: '1px',
                borderBottomColor: '#f2f2f2',
                minHeight: '56px',
            },
            selectedHighlightStyle: {
                backgroundColor: '#e6e6e6',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#f5f5f5',
            },
        },
    };

    const treeMapHandler = (e) => {
        navigate(`/analytics/${e.name}`)
    }

    return (
        <div className="w3-content">
            <ToastContainer />
            <div className="w3-center w3-xxlarge w3-padding">Daily Search Trends</div>
            {trends && (
                <DataTable
                    columns={columns}
                    data={trends}
                    customStyles={customStyles}
                    pagination
                />
            )}
            {
                treeMapData && (
                    <Treemap
                        width={1000}
                        height={600}
                        data={treeMapData}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#7F7F7F"
                        onClick={treeMapHandler}
                        style={{ cursor: 'pointer' }}
                    />
                )
            }
            <hr />
        </div>
    );
}
