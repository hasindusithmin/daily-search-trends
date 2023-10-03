import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Typewriter } from 'react-simple-typewriter';
import DataTable from 'react-data-table-component';
import { BackendURL, showQuestionModal, truncateText } from '../../utils/commons';
import CountriesSearch from '../../components/CountriesSearch';
import BarChartComponent from '../../components/charts/analytics/BarChart';


export default function NewAnalytics() {

    axios.defaults.baseURL = BackendURL;

    const columns = [
        {
            cell: row => <Link to={row.profileUrl} target='_blank'><img src={row.profilImage} width="35px" className="w3-circle" title={row.profileName} /></Link>,
            width: '50px',
        },
        {
            name: 'Question',
            cell: row => <div title='Click' onClick={() => { showQuestionModal(row) }} className='w3-justify' style={{ cursor: "pointer" }}>{truncateText(row.question, 150)}</div>,
            width: '500px',
            sortable: true
        },
        {
            name: 'Upvotes',
            selector: row => row.upvotes,
            sortable: true,
        },
        {
            name: 'Comments',
            selector: row => row.comments,
            sortable: true
        },
        {
            name: 'Shares',
            selector: row => row.shares,
            sortable: true
        },
        {
            name: 'Views',
            selector: row => row.views,
            sortable: true
        },
        {
            cell: row => <Link to={row.link} target='_blank' style={{ textDecoration: 'none', fontWeight: 600 }}>Read More...</Link>,
            width: '150px',
            style: {
                padding: '10px'
            }
        }

    ];

    let { keyword } = useParams();
    const [all, setAll] = useState(null)
    const [notFound, setNotFound] = useState(null)

    useEffect(() => {
        if (keyword) initialize()
    }, [])

    const initialize = async () => {

        const changeState = (data) => {
            setTimeout(() => {
                document.title = `Trendy w... ${keyword}`
            }, 250)
            if (data.length < 5) {
                setNotFound("Sorry, results not found");
                return
            }
            const _ = data.map(({ text, upvotes, comments, shares, views, profilImage, profileUrl, profileName, link }) => ({ question: text, upvotes, comments, shares, views, profilImage, profileUrl, profileName, link }));
            setAll(_)
        }

        const getDataFromAPI = async () => {
            const toastID = toast.loading("Processing, Please Wait...")
            try {
                const res = await axios.get(`/quora/${keyword}`);
                toast.update(toastID, { render: "Successfully Completed", type: toast.TYPE.SUCCESS, autoClose: 1000, isLoading: false, hideProgressBar: true })
                return res.data
            } catch (error) {
                toast.update(toastID, { render: error.message, type: toast.TYPE.ERROR, autoClose: 1000, isLoading: false, hideProgressBar: true })
                return []
            }
        }

        const fetchRenderSave = async () => {
            // get data from API 
            const apiData = await getDataFromAPI();
            if (apiData.length === 0) {
                toast.info("Please try again in a few minutes", { autoClose: 1500, hideProgressBar: true });
            }
            // do state changes 
            changeState(apiData);
            // save data in local storage 
            const store_data = {
                "created": Date.now(),
                "resource": JSON.stringify(apiData)
            }
            sessionStorage.setItem(keyword, JSON.stringify(store_data))
        }

        const treasure = sessionStorage.getItem(keyword);
        if (!treasure) {
            // If there is no data in the local storage
            console.log('there is no data in the local storage');
            fetchRenderSave();
            return
        }
        const { created, resource } = JSON.parse(treasure);
        const now = Date.now();
        const is_data_old = (now - created) > (15 * 60 * 1000)
        if (is_data_old) {
            // If the data is more than 15 minutes old
            console.log('data is more than 15 minutes old');
            fetchRenderSave();
            return
        }
        // do state changes 
        changeState(JSON.parse(resource));
    }


    return (
        <>
            <ToastContainer />
            <div
                style={{
                    backgroundRepeat: "repeat",
                    backgroundSize: "50px",
                    backgroundImage: all ? 'url(https://svggen-1-b2762192.deta.app)':'url()'
                }}
            >
                <div className="w3-center w3-padding-32">
                    <div className="w3-xlarge w3-opacity">
                        <b>TRENDY WORLD | {keyword}</b>
                    </div>
                    <p>
                        <Typewriter words={["Embark on a Journey to Discover the World's Current Search Trends!"]} cursor />
                    </p>
                    <Link to="/" className='w3-button w3-small w3-border w3-round-xlarge'>↩ Back To Home</Link>
                </div>
                <div className="w3-content w3-padding-64">
                    {
                        notFound &&
                        <p className="w3-center w3-text-red w3-xlarge">{notFound}</p>
                    }
                    {
                        all && (
                            <div className="w3-padding-32 w3-center">
                                <DataTable
                                    columns={columns}
                                    data={all}
                                    pagination
                                    responsive
                                    paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
                                    paginationPerPage={5}
                                />
                            </div>
                        )
                    }
                    {
                        all &&
                        (
                            <div style={{ overflow: "scroll" }} className="hide-scrollbar" >
                                <BarChartComponent
                                    data={all}
                                    field="Upvotes"
                                    keyword={keyword}
                                    top="#2980b9"
                                    bottom="#2c3e50"
                                />
                            </div>
                        )
                    }
                    {
                        all &&
                        (
                            <div style={{ overflow: "scroll" }} className="hide-scrollbar" >
                                <BarChartComponent
                                    data={all}
                                    field="Comments"
                                    keyword={keyword}
                                    top="#2980b9"
                                    bottom="#2c3e50"
                                />
                            </div>
                        )
                    }
                    {
                        all &&
                        (
                            <div style={{ overflow: "scroll" }} className="hide-scrollbar" >
                                <BarChartComponent
                                    data={all}
                                    field="Shares"
                                    keyword={keyword}
                                    top="#2980b9"
                                    bottom="#2c3e50"
                                />
                            </div>
                        )
                    }
                    {
                        all &&
                        (
                            <div style={{ overflow: "scroll" }} className="hide-scrollbar" >
                                <BarChartComponent
                                    data={all}
                                    field="Views"
                                    keyword={keyword}
                                    top="#2980b9"
                                    bottom="#2c3e50"
                                />
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )

}
