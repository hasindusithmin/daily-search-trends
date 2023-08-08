import Rodal from 'rodal';
import { isMobile, codes, copyToClipboard } from '../utils/commons';
import { TagCloud } from 'react-tagcloud'

export default function HomeTagCloudM({ showTC, setShowTC }) {

    const { country, trends, flag } = showTC

    return (
        <Rodal
            visible={showTC}
            width={isMobile() ? window.innerWidth : window.innerWidth * 0.4}
            height={isMobile() ? window.innerHeight : window.innerHeight * 0.4}
            showMask={true}
            closeOnEsc={true}
            className='w3-padding-64 w3-mobile'
            onClose={() => { setShowTC(null) }}
        >
            <p className='w3-center' style={{ fontWeight: 500 }}>Explore the Latest {flag}{codes[country]} Trending Keywords</p>
            <TagCloud
                className='w3-padding'
                minSize={12}
                maxSize={35}
                tags={trends.map(({ title, traffic }) => ({ value: title, count: traffic }))}
                onClick={({value}) => {copyToClipboard(value)}}
            />
        </Rodal >
    )
}