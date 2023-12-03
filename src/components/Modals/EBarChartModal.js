import ReactEcharts from "echarts-for-react"
import Rodal from "rodal";
import { copyToClipboard, flags, formatNumberAbbreviation, formatToBrowserTimezone, openAnalysisModal, getDevice, iso, BackendURL, languages } from "../../utils/commons";
import Swal from "sweetalert2";
import ReactDOMServer from 'react-dom/server';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import moment from "moment";
import Quora from "../Sw/Quora";

export default function EBarChartModal({ code, data, setData, fromTime, toTime }) {
    const { device, width, height } = getDevice();
    const options = {
        title: {
            text: `${data && data.length} trending searches in ${iso[code]} ${flags[code]}`,
            subtext: `From ${moment(fromTime).format('MMM Do YYYY, h:mm A')} To ${moment(toTime).format('MMM Do YYYY, h:mm A')}`,
            left: 'left'
        },
        tooltip: {
            formatter: function (props) {
                const { name, value, date } = props.data;
                return `${name}<br>${formatNumberAbbreviation(value)}+ searches<br>${formatToBrowserTimezone(date)}`
            }
        },
        series: [
            {
                name: '',
                type: 'pie',
                radius: "75%",
                center: ['50%', '50%'],
                data: data ? data.map(({ title, traffic, pubDate }) => ({ name: title, value: traffic, date: pubDate })) : null,
                emphasis: {}
            }
        ],
        toolbox: {
            feature: {
                saveAsImage: {},
                myTool1: {
                    show: true,
                    title: 'Entity Analysis',
                    icon: 'path://M42.3 22.6H26.9v6.2H41v5H26.9v7.5H43v5.2H21v-29h21.3v5.1z',
                    onclick: function () {
                        const title = "Entity Analysis"
                        const text = "Identify entities and label by types such as person, organization, location, events, products and media."
                        const keywords = data.map(({ title }) => title)
                        openAnalysisModal(title, text, keywords, "E", function (result, error) {
                            if (result) {
                                Swal.fire({
                                    title: title,
                                    html: ReactDOMServer.renderToString(<ReactMarkdown children={result.replaceAll("\n", "\n\n")} remarkPlugins={[remarkGfm]} className="w3-justify scrollable-container" />),
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                })
                            }
                            else {
                                Swal.showValidationMessage(error)
                            }
                        })
                    }
                },
                myTool2: {
                    show: true,
                    title: 'Sentiment Analysis',
                    icon: 'path://M94.9 71.35c-8.08-7.63-21.82-13.99-30.91-18.2c-1.54-.71-2.93-1.35-4.11-1.92c-3.43-1.65-8.12-6.22-6.1-11.47c1.36-3.55 4.81-5.34 10.27-5.34c1.75 0 3.67.2 5.72.58c7.12 1.33 12.52 3.99 15.58 5.5c.38.19.82.21 1.22.07c.39-.15.72-.45.89-.84l7.01-15.81c.31-.69.07-1.51-.57-1.93c-4.94-3.28-17.27-8.15-30.97-8.15c-1.98 0-3.95.1-5.87.3c-10.92 1.12-21.86 4.03-27.92 17.64c-3.78 8.47-3.77 18.01.01 24.89c4.04 7.51 10.66 10.87 19.04 15.11l1.08.55c6.05 3.02 13.3 6.38 18.07 8.59c7.05 3.4 9.66 9.44 8.04 13.08c-2.61 5.87-8.38 7.16-18.36 4.33c-8.81-2.39-16.94-9.14-19.21-11.15c-.34-.3-.79-.44-1.25-.38c-.45.06-.85.32-1.1.69L24.6 104.14c-.41.63-.32 1.46.22 1.98c5.63 5.43 10.22 8.59 18.17 12.5c5.35 2.63 13.18 4.21 20.95 4.21c8.12 0 27.95-1.88 36.65-19.26c5.55-11.12 3.48-22.84-5.69-32.22z',
                    onclick: function () {
                        const title = "Sentiment Analysis"
                        const text = "Understand the overall sentiment expressed in the keywords."
                        const keywords = data.map(({ title }) => title)
                        openAnalysisModal(title, text, keywords, "S", function (result, error) {
                            if (result) {
                                Swal.fire({
                                    title: title,
                                    html: ReactDOMServer.renderToString(<ReactMarkdown children={result.replaceAll("\n", "\n\n")} remarkPlugins={[remarkGfm]} className="w3-justify scrollable-container" />),
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                })
                            }
                            else {
                                Swal.showValidationMessage(error)
                            }
                        })
                    }
                },
                myTool3: {
                    show: true,
                    title: 'Topic Modeling',
                    icon: 'path://M111.84 15.36H16.16c-1.24 0-2.24 1-2.24 2.24v17.99c0 1.24 1 2.24 2.24 2.24h34.65v80.73c0 1.24 1 2.24 2.24 2.24h21.9c1.24 0 2.24-1 2.24-2.24V37.83h34.65c1.24 0 2.24-1 2.24-2.24V17.6c0-1.24-1-2.24-2.24-2.24z',
                    onclick: function () {
                        const title = "Topic Modeling"
                        const text = "Identify common themes and topics in the keywords."
                        const keywords = data.map(({ title }) => title)
                        openAnalysisModal(title, text, keywords, "T", function (result, error) {
                            if (result) {
                                Swal.fire({
                                    title: title,
                                    html: ReactDOMServer.renderToString(<ReactMarkdown children={result.replaceAll("\n", "\n\n")} remarkPlugins={[remarkGfm]} className="w3-justify scrollable-container" />),
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                })
                            }
                            else {
                                Swal.showValidationMessage(error)
                            }
                        })
                    }
                },
                myTool4: {
                    show: true,
                    title: 'Clustering',
                    icon: 'path://M17.023 9.216s-.386-3.293-3.955-3.385c-3.57-.091-5.402 2.47-5.402 6.13 0 3.66 2.026 6.588 5.498 6.588 3.473 0 3.86-3.66 3.86-3.66l6.656.366s.391 3.306-2.394 5.828C18.5 23.605 15.082 24.017 12.694 24c-2.388-.018-5.698.034-8.9-2.969C.595 18.03.05 15.113.05 12.248c0-2.866.607-6.661 4.414-9.54C7.05.754 9.673.033 12.296.033 23.246.032 23.98 9.28 23.98 9.28z',
                    onclick: function () {
                        const title = "Clustering"
                        const text = "Group similar keywords together based on their content"
                        const keywords = data.map(({ title }) => title)
                        openAnalysisModal(title, text, keywords, "C", function (result, error) {
                            if (result) {
                                Swal.fire({
                                    title: title,
                                    html: ReactDOMServer.renderToString(<ReactMarkdown children={result.replaceAll("\n", "\n\n")} remarkPlugins={[remarkGfm]} className="w3-justify scrollable-container" />),
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                })
                            }
                            else {
                                Swal.showValidationMessage(error)
                            }
                        })
                    }
                },
                myTool5: {
                    show: true,
                    title: 'Close',
                    icon: 'path://M 20,4 3,21 33,50 3,80 20,97 49,67 79,97 95,80 65,50 95,20 80,4 50,34 z',
                    onclick: function () {
                        setData(null)
                    }
                },
            }
        },
    };

    const size = device === "SM" ? width : 600

    const onEvents = {
        click: ({ name }) => {
            copyToClipboard(name)
            const { description } = data.find(({ title }) => title === name);
            if (description !== "") {
                const Toast = Swal.mixin({
                    toast: true,
                    position: "center",
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: false,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                const inputOptions = {};
                description.split(", ").forEach(query => { inputOptions[query] = query })
                Swal.fire({
                    title: "Related Queries",
                    input: "select",
                    inputOptions,
                    inputPlaceholder: "Select a query",
                    showCancelButton: false,
                    showCloseButton: true,
                    showConfirmButton: true,
                    confirmButtonText: "Related news",
                    confirmButtonColor: "#2d72d9",
                    showDenyButton: true,
                    denyButtonText: "People also ask",
                    denyButtonColor: "#a82400",
                    showLoaderOnConfirm: true,
                    showLoaderOnDeny: true,
                    allowOutsideClick: true,
                    inputValidator: (value) => {
                        if (value === "") {
                            return "You need to select a query"
                        }
                    },
                    preConfirm: (value) => {
                        return fetch(`${BackendURL}/hotnews/v2`, {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ query: value, language: `${languages[code]}-${code}`, country: code, ceid: `${code}:${languages[code]}` })
                        })
                            .then(async (res) => {
                                if (!res.ok) {
                                    throw new Error(res.statusText)
                                }
                                const payload = await res.json();
                                Swal.fire({
                                    width: 500,
                                    title: `${value} <span class="w3-tag w3-small w3-display-topleft">${payload.length} Results found</span>`,
                                    customClass: {
                                        title: "w3-large w3-text-dark-grey",
                                        htmlContainer: "scrollable-container",
                                    },
                                    html: `
                                        ${payload.length > 0 && payload.map(news =>
                                        `
                                            <div class="w3-card w3-round-xlarge w3-panel w3-padding" style="margin:10px 5px;">
                                                <span
                                                    title="click here to view news"
                                                    class="w3-text-grey w3-hover-text-dark-grey"
                                                    style="text-decoration:none;font-weight:bold;cursor:pointer;"
                                                    onclick="window.open('${news.link}', '_blank', 'width=600,height=400,location=no,menubar=no,toolbar=no')"
                                                >
                                                    ${news.title}
                                                </span>
                                                <div class="w3-padding w3-left-align">
                                                    <a
                                                        href="${news.source['@url']}"
                                                        class="w3-text-blue"
                                                        style="text-decoration:none;font-weight:500px;"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <i class="fa fa-rss-square" aria-hidden="true"></i> ${news.source['#text']}
                                                    </a>
                                                    <br>
                                                    <span>
                                                        <i class="fa fa-clock-o" aria-hidden="true"></i> ${moment(news.pubDate).format("MMM Do YYYY, h:mm A")}
                                                    </span>
                                                    <a class="w3-right" href="${news.link}" target="_blank" rel="noreferrer">
                                                        <i class="fa fa-external-link-square" aria-hidden="true"></i>
                                                    </a>
                                                </div>
                                            </div>
                                            `
                                    ).join("")}
                                    `,
                                    showCloseButton: true,
                                    showCancelButton: false,
                                    showConfirmButton: false
                                })
                            })
                            .catch(error => {
                                Toast.fire({
                                    icon: "error",
                                    title: "Oops! No matching data found"
                                });
                            })
                    },
                    preDeny: () => {
                        const value = Swal.getInput().value;
                        if (!value) {
                            Swal.showValidationMessage("You need to select a query")
                            return false
                        }
                        return fetch(`${BackendURL}/quora/${value}`, {
                            method: "GET",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                        })
                            .then(async (res) => {
                                if (!res.ok) {
                                    throw new Error(res.statusText)
                                }
                                const payload = await res.json();
                                Swal.fire({
                                    title: `Results for ${value}`,
                                    customClass: {
                                        title: "w3-large w3-text-dark-grey",
                                        htmlContainer: "scrollable-container",
                                    },
                                    html: ReactDOMServer.renderToString(<Quora results={payload} />),
                                    showConfirmButton: false,
                                    showCloseButton: true,
                                })
                            })
                            .catch(error => {
                                Toast.fire({
                                    icon: "error",
                                    title: "Oops! No matching data found"
                                });
                            })
                    }
                })
                
            }
        }
    }

    return (
        <Rodal
            visible={data}
            showCloseButton={false}
            onClose={() => { setData(null) }}
            width={size}
            height={size}
            animation="door"
            customStyles={{ padding: 0 }}
        >
            <ReactEcharts
                option={options}
                style={{ width: size, height: size }}
                onEvents={onEvents}
            />
        </Rodal>

    )
}
