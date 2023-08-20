import Rodal from 'rodal';
import { isMobile, codes, formatNumberAbbreviation, generateNewsHTMLV1, generateNewsHTMLV2, copyToClipboard } from '../utils/commons';
import { TagCloud } from 'react-tagcloud'
import Swal from 'sweetalert2';
import axios from 'axios';

export default function HomeTagCloudM({ toast, showTC, setShowTC }) {


    const { country, trends, flag } = showTC;

    const customRenderer = (tag, size, color) => {
        return (
            <span key={tag.value} style={{ color, fontWeight: 400, fontSize: `${size}px`, margin: '3px', padding: '3px', cursor: 'cell' }} className='w3-tag w3-transparent' title={tag.value}>
                {tag.value}<sup style={{ fontWeight: 500, color: '#111' }}>{formatNumberAbbreviation(tag.count)}+</sup>
            </span>
        )
    }

    const openNewsModal = (title, count, news, picture) => {
        news = Array.isArray(news) ? news : [news]
        Swal.fire({
            imageUrl: picture,
            imageWidth: 100,
            imageHeight: 100,
            imageAlt: title,
            title: `<b>${title}</b><sup style="font-size:15px;">${formatNumberAbbreviation(count)}+</sup>`,
            html: generateNewsHTMLV1(news),
            showCloseButton: true,
            showDenyButton: true,
            confirmButtonText: 'Google News',
            denyButtonText: 'Copy keyword'
        })
            .then((result) => {
                if (result.isConfirmed) {
                    const toastID = toast.loading("Processing, Please Wait...")
                    axios.get(`https://claudeapi-1-t7350571.deta.app/gnews/${title}`)
                        .then(res => {
                            toast.update(toastID, { render: "Successfully Completed", type: toast.TYPE.SUCCESS, autoClose: 1000, isLoading: false, hideProgressBar: true })
                            Swal.fire({
                                title: `<b>${title}</b> <sup style="font-size:15px;color:#34a853;">Google News</sup>`,
                                html: generateNewsHTMLV2(res.data),
                                showConfirmButton: false,
                                showCloseButton: true
                            })
                        })
                        .catch(err => {
                            toast.update(toastID, { render: err.message, type: toast.TYPE.ERROR, autoClose: 1000, isLoading: false, hideProgressBar: true })
                        })
                }
                else if (result.isDenied) {
                    copyToClipboard(title)
                }
            })
    }

    return (
        <Rodal
            visible={showTC}
            width={isMobile() ? window.innerWidth : window.innerWidth * 0.5}
            height={isMobile() ? window.innerHeight : window.innerHeight * 0.5}
            showMask={true}
            closeOnEsc={true}
            className='w3-padding-64 w3-mobile'
            onClose={() => { setShowTC(null) }}
        >
            <div className='w3-padding'>
                <p className='w3-center' style={{ fontWeight: 500, textDecoration: 'underline' }}>Explore the Latest {flag}{codes[country]} <sup style={{ fontWeight: 500 }}>{formatNumberAbbreviation(trends.reduce((sum, item) => sum + item.traffic, 0))}+</sup> Trending Keywords</p>
                <TagCloud
                    className='w3-padding'
                    minSize={12}
                    maxSize={35}
                    tags={trends.map(({ title, traffic, news, picture }) => ({ value: title, count: traffic, news, picture }))}
                    renderer={customRenderer}
                    onClick={({ value, count, news, picture }) => { openNewsModal(value, count, news, picture); }}
                />
            </div>
        </Rodal >
    )
}