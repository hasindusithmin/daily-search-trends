import axios from "axios";
import moment from "moment";
import { useEffect, useState } from "react";
import DataTable from 'react-data-table-component';
import { Link } from "react-router-dom";

export default function Home() {
    const columns = [
        {
            cell: row => <img src={row.picture} alt={row.title} width="30px" />,
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
            } catch (error) {
                console.log(error.message);
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

    return (
        <div className="w3-content">
            {trends && (
                <DataTable
                    columns={columns}
                    data={trends}
                    customStyles={customStyles}
                    pagination
                />
            )}
        </div>
    );
}
