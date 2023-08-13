import Rodal from 'rodal';
import { isMobile, codes, formatNumberAbbreviation, openNewsModal } from '../utils/commons';
import { TagCloud } from 'react-tagcloud'

export default function HomeTagCloudM({ showTC, setShowTC }) {

    const { country, trends, flag } = showTC;

    const customRenderer = (tag, size, color) => {
        return (
            <span key={tag.value} style={{ color, fontWeight: 400, fontSize: `${size}px`, margin: '3px', padding: '3px', cursor: 'cell' }} className='w3-tag w3-transparent' title={tag.value}>
                {tag.value}<sup style={{ fontWeight: 500, color: '#111' }}>{formatNumberAbbreviation(tag.count)}+</sup>
            </span>
        )
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