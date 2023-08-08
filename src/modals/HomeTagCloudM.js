import Rodal from 'rodal';
import { isMobile, codes, copyToClipboard } from '../utils/commons';
import { TagCloud } from 'react-tagcloud'

export default function HomeTagCloudM({ showTC, setShowTC }) {

    const { country, trends, flag } = showTC;
    function formatNumberAbbreviation(number) {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const suffixNum = Math.floor(('' + number).length / 3);
        let shortNumber = parseFloat((suffixNum !== 0 ? (number / Math.pow(1000, suffixNum)) : number).toPrecision(2));
        if (shortNumber % 1 !== 0) {
            shortNumber = shortNumber.toFixed(1);
        }
        return shortNumber + suffixes[suffixNum];
    }

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
            <p className='w3-center' style={{ fontWeight: 500 }}>Explore the Latest {flag}{codes[country]} <sup style={{ fontWeight: 500 }}>{formatNumberAbbreviation(trends.reduce((sum, item) => sum + item.traffic, 0))}+</sup> Trending Keywords</p>
            <TagCloud
                className='w3-padding'
                minSize={12}
                maxSize={35}
                tags={trends.map(({ title, traffic }) => ({ value: title, count: traffic }))}
                onClick={({ value }) => { copyToClipboard(value) }}
            />
        </Rodal >
    )
}