import { toast } from "react-toastify"
import Swal from "sweetalert2";
import axios from "axios";
import ReactDOMServer from 'react-dom/server';

export const BackendURL = process.env.REACT_APP_TRENDY_WORLD_BACKEND;
export const NodeAPI = process.env.REACT_APP_TRENDY_WORLD_NODE_API;

function downloadSvgAsJpg(svgElement, filename) {
  try {
    // Convert SVG element to XML string
    const svgXml = new XMLSerializer().serializeToString(svgElement);

    // Create a Blob from the SVG XML
    const blob = new Blob([svgXml], { type: 'image/svg+xml' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an image element
    const img = new Image();

    // Set up an event listener for the image load
    img.onload = function () {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match the SVG element
      canvas.width = svgElement.width.baseVal.value;
      canvas.height = svgElement.height.baseVal.value;

      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);

      // Convert the canvas content to a data URL
      const dataUrl = canvas.toDataURL('image/jpeg');

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up the temporary URL
      URL.revokeObjectURL(url);
    };

    // Set the source of the image to the temporary URL
    img.src = url;
  } catch (error) {
    toast.error("Sorry, can't download chart at this moment", { autoClose: 250, hideProgressBar: true });
  }
}


export const downloadChart = (parent) => {
  try {
    const container = document.getElementById(parent);
    const svgElement = container.children[0].children[0]
    downloadSvgAsJpg(svgElement, `${parent}.jpg`)
  } catch (error) {
    console.log(error.message);
    toast.error("Sorry, can't download chart at this moment", { autoClose: 250, hideProgressBar: true })
  }
}

export function copyToClipboard(text) {
  var textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  toast.success(`Copied to the clipboard`, { hideProgressBar: true, autoClose: 250, position: 'top-left' })
}


export function isMobile() {
  return window.innerWidth < 601;
}

export function isLarge() {
  return window.innerWidth >= 1280;
}

export const codes = {
  'Argentina': 'AR',
  'Australia': 'AU',
  'Austria': 'AT',
  'Belgium': 'BE',
  'Brazil': 'BR',
  'Canada': 'CA',
  'Chile': 'CL',
  'Colombia': 'CO',
  'Czechia': 'CZ',
  'Denmark': 'DK',
  'Egypt': 'EG',
  'Finland': 'FI',
  'France': 'FR',
  'Germany': 'DE',
  'Greece': 'GR',
  'Hong Kong': 'HK',
  'Hungary': 'HU',
  'India': 'IN',
  'Indonesia': 'ID',
  'Ireland': 'IE',
  'Israel': 'IL',
  'Italy': 'IT',
  'Japan': 'JP',
  'Kenya': 'KE',
  'Malaysia': 'MY',
  'Mexico': 'MX',
  'Netherlands': 'NL',
  'New Zealand': 'NZ',
  'Nigeria': 'NG',
  'Norway': 'NO',
  'Peru': 'PE',
  'Philippines': 'PH',
  'Poland': 'PL',
  'Portugal': 'PT',
  'Romania': 'RO',
  'Russia': 'RU',
  'Saudi Arabia': 'SA',
  'Singapore': 'SG',
  'South Africa': 'ZA',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Sweden': 'SE',
  'Switzerland': 'CH',
  'Taiwan': 'TW',
  'Thailand': 'TH',
  'Türkiye': 'TR',
  'Ukraine': 'UA',
  'United Kingdom': 'GB',
  'United States': 'US',
  'Vietnam': 'VN'
}

export const iso = {
  'AR': 'Argentina',
  'AU': 'Australia',
  'AT': 'Austria',
  'BE': 'Belgium',
  'BR': 'Brazil',
  'CA': 'Canada',
  'CL': 'Chile',
  'CO': 'Colombia',
  'CZ': 'Czechia',
  'DK': 'Denmark',
  'EG': 'Egypt',
  'FI': 'Finland',
  'FR': 'France',
  'DE': 'Germany',
  'GR': 'Greece',
  'HK': 'Hong Kong',
  'HU': 'Hungary',
  'IN': 'India',
  'ID': 'Indonesia',
  'IE': 'Ireland',
  'IL': 'Israel',
  'IT': 'Italy',
  'JP': 'Japan',
  'KE': 'Kenya',
  'MY': 'Malaysia',
  'MX': 'Mexico',
  'NL': 'Netherlands',
  'NZ': 'New Zealand',
  'NG': 'Nigeria',
  'NO': 'Norway',
  'PE': 'Peru',
  'PH': 'Philippines',
  'PL': 'Poland',
  'PT': 'Portugal',
  'RO': 'Romania',
  'RU': 'Russia',
  'SA': 'Saudi Arabia',
  'SG': 'Singapore',
  'ZA': 'South Africa',
  'KR': 'South Korea',
  'ES': 'Spain',
  'SE': 'Sweden',
  'CH': 'Switzerland',
  'TW': 'Taiwan',
  'TH': 'Thailand',
  'TR': 'Türkiye',
  'UA': 'Ukraine',
  'GB': 'United Kingdom',
  'US': 'United States',
  'VN': 'Vietnam'
}

export const flags = {
  'AR': '🇦🇷',
  'AU': '🇦🇺',
  'AT': '🇦🇹',
  'BE': '🇧🇪',
  'BR': '🇧🇷',
  'CA': '🇨🇦',
  'CL': '🇨🇱',
  'CO': '🇨🇴',
  'CZ': '🇨🇿',
  'DK': '🇩🇰',
  'EG': '🇪🇬',
  'FI': '🇫🇮',
  'FR': '🇫🇷',
  'DE': '🇩🇪',
  'GR': '🇬🇷',
  'HK': '🇭🇰',
  'HU': '🇭🇺',
  'IN': '🇮🇳',
  'ID': '🇮🇩',
  'IE': '🇮🇪',
  'IL': '🇮🇱',
  'IT': '🇮🇹',
  'JP': '🇯🇵',
  'KE': '🇰🇪',
  'MY': '🇲🇾',
  'MX': '🇲🇽',
  'NL': '🇳🇱',
  'NZ': '🇳🇿',
  'NG': '🇳🇬',
  'NO': '🇳🇴',
  'PE': '🇵🇪',
  'PH': '🇵🇭',
  'PL': '🇵🇱',
  'PT': '🇵🇹',
  'RO': '🇷🇴',
  'RU': '🇷🇺',
  'SA': '🇸🇦',
  'SG': '🇸🇬',
  'ZA': '🇿🇦',
  'KR': '🇰🇷',
  'ES': '🇪🇸',
  'SE': '🇸🇪',
  'CH': '🇨🇭',
  'TW': '🇹🇼',
  'TH': '🇹🇭',
  'TR': '🇹🇷',
  'UA': '🇺🇦',
  'GB': '🇬🇧',
  'US': '🇺🇸',
  'VN': '🇻🇳'
}

export const coordinates = {
  Argentina: [-63.616672, -38.416097],
  Australia: [133.775136, -25.274398],
  Austria: [14.550072, 47.516231],
  Belgium: [4.469936, 50.503887],
  Brazil: [-51.92528, -14.235004],
  Canada: [-106.346771, 56.130366],
  Chile: [-71.542969, -35.675147],
  Colombia: [-74.297333, 4.570868],
  Czechia: [15.472962, 49.817492],
  Denmark: [9.501785, 56.26392],
  Egypt: [30.802498, 26.820553],
  Finland: [25.748151, 61.92411],
  France: [2.213749, 46.227638],
  Germany: [10.451526, 51.165691],
  Greece: [21.824312, 39.074208],
  'Hong Kong': [114.109497, 22.396428],
  Hungary: [19.503304, 47.162494],
  India: [78.96288, 20.593684],
  Indonesia: [113.921327, -0.789275],
  Ireland: [-8.24389, 53.41291],
  Israel: [34.851612, 31.046051],
  Italy: [12.56738, 41.87194],
  Japan: [138.252924, 36.204824],
  Kenya: [37.906193, -0.023559],
  Malaysia: [101.975766, 4.210484],
  Mexico: [-102.552784, 23.634501],
  Netherlands: [5.291266, 52.132633],
  'New Zealand': [174.885971, -40.900557],
  Nigeria: [8.675277, 9.081999],
  Norway: [8.468946, 60.472024],
  Peru: [-75.015152, -9.189967],
  Philippines: [121.774017, 12.879721],
  Poland: [19.145136, 51.919438],
  Portugal: [-8.224454, 39.399872],
  Romania: [24.96676, 45.943161],
  Russia: [105.318756, 61.52401],
  'Saudi Arabia': [45.079162, 23.885942],
  Singapore: [103.819836, 1.352083],
  'South Africa': [22.937506, -30.559482],
  'South Korea': [127.766922, 35.907757],
  Spain: [-3.74922, 40.463667],
  Sweden: [18.643501, 60.128161],
  Switzerland: [8.227512, 46.818188],
  Taiwan: [120.960515, 23.69781],
  Thailand: [100.992541, 15.870032],
  'Türkiye': [35.243322, 38.963745],
  Ukraine: [31.16558, 48.379433],
  'United Kingdom': [-3.435973, 55.378051],
  'United States': [-95.712891, 37.09024],
  Vietnam: [108.277199, 14.058324]
}

export const content = `
**Welcome To The Trendy World : Stay Ahead with Daily Search Trends 😉**

Are you ready to unlock the power of daily search trends? At Trendy World, we offer you a gateway to stay at the forefront of what's buzzing and trending in the online world. Whether you're a content creator, marketer, or just a curious mind, our platform provides valuable insights that can drive your success. 💪

**Why Embrace Daily Search Trends?**

In today's fast-paced digital landscape, staying relevant is key. By harnessing the power of daily search trends, you can:

**1. Boost Your Content:** Discover popular keywords and phrases that resonate with your audience. Tailor your content to their interests and watch your engagement soar. ✨

**2. Seize Timely Opportunities:** Capitalize on trending topics to create timely and compelling content that captivates your audience. 📢

**3. Understand User Intent:** Get inside the minds of your audience by analyzing their search behavior. Understand what they are looking for and deliver solutions that truly matter. 💡

**4. Stay Ahead of Competitors:** Keep a keen eye on your competition. Track their strategies and adapt your own to maintain a competitive edge. 🏆

**5. Embrace Seasonal Trends:** Plan ahead and align your marketing campaigns with seasonal trends, tapping into heightened interest during specific periods. 🗓️

**6. Be Informed:** Be the first to know about breaking news and current events with real-time updates on what's trending globally. 🔔

**How Trendy World Works**

Our intuitive platform provides you with instant access to the most relevant and up-to-date search trends. Simply browse through our user-friendly interface and explore the trending topics that matter most to you. 🚀

**Start Your Trend Journey Today**

Embrace the power of daily search trends and unlock your potential for success. Join us at Trendy World and make every day a step towards a brighter, trendier future. 🚀🌟

**Stay in the know. Stay trendy.** 📲
`


export function formatNumberAbbreviation(number) {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(('' + number).length / 3);
  let shortNumber = parseFloat((suffixNum !== 0 ? (number / Math.pow(1000, suffixNum)) : number).toPrecision(2));
  if (shortNumber % 1 !== 0) {
    shortNumber = shortNumber.toFixed(1);
  }
  return shortNumber + suffixes[suffixNum];
}

export function formatToBrowserTimezone(datetimeString) {
  const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
  };

  return new Date(datetimeString).toLocaleString(undefined, options);
}

export function generateNewsHTMLV1(news) {
  let html = '<p>';

  news.forEach(item => {
    html += `    <div>\n`;
    html += `        <h5><a href="${item['ht:news_item_url'] || item['url']}" target="_blank" rel="noreferrer">${item['ht:news_item_title'] || item['title']}</a></h5>\n`;
    html += `        <p>${item['ht:news_item_snippet'] || item['snippet']}</p>\n`;
    html += `        <p>Source: <em>${item['ht:news_item_source'] || item['source']}</em></p>\n`;
    html += `    </div>\n`;
    html += `    <hr>\n`;
  });

  html += '</p>';

  return html;
}

export function generateNewsHTMLV2(news) {
  let html = '<p>';

  news.forEach(item => {
    html += `    <div>\n`;
    html += `        <h5><a href="${item['link']}" target="_blank" rel="noreferrer">${item['title']}</a></h5>\n`;
    html += `        <p>💡${item['source']} | ⏰${item['time']} </p>\n`;
    html += `    </div>\n`;
    html += `    <hr>\n`;
  });

  html += '</p>';

  return html;
}

export function arraysHaveSameElements(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  }

  const sortedArray1 = array1.slice().sort();
  const sortedArray2 = array2.slice().sort();

  for (let i = 0; i < sortedArray1.length; i++) {
    if (sortedArray1[i] !== sortedArray2[i]) {
      return false;
    }
  }

  return true;
}

export const openNewsModal = (title, country, news, picture) => {
  news = Array.isArray(news) ? news : [news];
  axios.defaults.baseURL = BackendURL;
  Swal.fire({
    imageUrl: picture,
    imageWidth: 100,
    imageHeight: 100,
    imageAlt: title,
    title: `<b>${title}</b> <sup style="font-size:15px;color:#34a853;">Latest News</sup>`,
    html: news.length > 0 ? generateNewsHTMLV1(news) : '<span style="font-size:12px;font-weight:bold;color:red;">Sorry, results not found</span>',
    showCloseButton: true,
    showDenyButton: true,
    confirmButtonText: 'Hot News',
    denyButtonText: 'Copy keyword'
  })
    .then((result) => {
      if (result.isConfirmed) {
        const toastID = toast.loading("Processing, Please Wait...")
        axios.get(`/hotnews/${title}?region=${codes[country]}`)
          .then(res => {
            const data = res.data || [];
            toast.update(toastID, { render: "Successfully Completed", type: toast.TYPE.SUCCESS, autoClose: 1000, isLoading: false, hideProgressBar: true })
            Swal.fire({
              title: `<b>${title}</b> <sup style="font-size:15px;color:#34a853;">Hot News</sup>`,
              html: data.length > 0 ? generateNewsHTMLV2(data) : '<span style="font-size:16px;font-weight:bold;color:red;">Sorry, results not found</span>',
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


export const selectOptions = [
  { "label": "Argentina", "value": "AR" },
  { "label": "Australia", "value": "AU" },
  { "label": "Austria", "value": "AT" },
  { "label": "Belgium", "value": "BE" },
  { "label": "Brazil", "value": "BR" },
  { "label": "Canada", "value": "CA" },
  { "label": "Chile", "value": "CL" },
  { "label": "Colombia", "value": "CO" },
  { "label": "Czechia", "value": "CZ" },
  { "label": "Denmark", "value": "DK" },
  { "label": "Egypt", "value": "EG" },
  { "label": "Finland", "value": "FI" },
  { "label": "France", "value": "FR" },
  { "label": "Germany", "value": "DE" },
  { "label": "Greece", "value": "GR" },
  { "label": "Hong Kong", "value": "HK" },
  { "label": "Hungary", "value": "HU" },
  { "label": "India", "value": "IN" },
  { "label": "Indonesia", "value": "ID" },
  { "label": "Ireland", "value": "IE" },
  { "label": "Israel", "value": "IL" },
  { "label": "Italy", "value": "IT" },
  { "label": "Japan", "value": "JP" },
  { "label": "Kenya", "value": "KE" },
  { "label": "Malaysia", "value": "MY" },
  { "label": "Mexico", "value": "MX" },
  { "label": "Netherlands", "value": "NL" },
  { "label": "New Zealand", "value": "NZ" },
  { "label": "Nigeria", "value": "NG" },
  { "label": "Norway", "value": "NO" },
  { "label": "Peru", "value": "PE" },
  { "label": "Philippines", "value": "PH" },
  { "label": "Poland", "value": "PL" },
  { "label": "Portugal", "value": "PT" },
  { "label": "Romania", "value": "RO" },
  { "label": "Russia", "value": "RU" },
  { "label": "Saudi Arabia", "value": "SA" },
  { "label": "Singapore", "value": "SG" },
  { "label": "South Africa", "value": "ZA" },
  { "label": "South Korea", "value": "KR" },
  { "label": "Spain", "value": "ES" },
  { "label": "Sweden", "value": "SE" },
  { "label": "Switzerland", "value": "CH" },
  { "label": "Taiwan", "value": "TW" },
  { "label": "Thailand", "value": "TH" },
  { "label": "Türkiye", "value": "TR" },
  { "label": "Ukraine", "value": "UA" },
  { "label": "United Kingdom", "value": "GB" },
  { "label": "United States", "value": "US" },
  { "label": "Vietnam", "value": "VN" }
]

export function ranLightColor() {
  const hexTab = "6789ABCDEF"; // lighter color range
  let r = hexTab[Math.floor(Math.random() * hexTab.length)];
  let g = hexTab[Math.floor(Math.random() * hexTab.length)];
  let b = hexTab[Math.floor(Math.random() * hexTab.length)];
  return r + g + b;
}

function CDTemplate({ code, detail }) {

  const {
    name,
    currencies,
    capital,
    region,
    subregion,
    languages,
    latlng,
    landlocked,
    borders = [],
    area,
    maps,
    population,
    timezones = [],
    continents,
    coatOfArms,
    startOfWeek,
  } = detail;

  return (
    <div>
      <div className="w3-center w3-padding">
        <img src={coatOfArms.svg} alt="coat of arms" width={100} height={100} />
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-blue">Official name</span> {name.official}</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-green">Capital</span> {capital[0]}</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-teal">Region</span> {region} ({subregion})</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-red">Languages</span> {Object.keys(languages).join(', ')}</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-cyan w3-text-white">Continents</span>: {continents.join(', ')}</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-dark-gray">Latitude</span> {latlng[0]}, <span className="w3-tag w3-round w3-dark-gray">Longitude</span> {latlng[1]}</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-purple">Landlocked</span>: {landlocked ? 'Yes' : 'No'}</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-indigo">Area</span> {area}<sup>sqkm</sup></div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-orange w3-text-white">Population</span> {formatNumberAbbreviation(population)}+</div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-blue-gray">Timezones</span> <span className={timezones.length > 2 ? 'w3-small' : ''}>{timezones.join(', ')}</span></div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-aqua w3-text-white">Borders</span> <span className={borders.length > 2 ? 'w3-small' : ''}>{borders.join(', ')}</span></div>
        <div style={{ padding: "5px 0" }}>
          <span className="w3-tag w3-round w3-amber w3-text-white">Currencies</span> {Object.values(currencies)[0].name}<sup>{Object.values(currencies)[0].symbol}</sup>
        </div>
        <div style={{ padding: "5px 0" }}><span className="w3-tag w3-round w3-brown">Start of Week</span> {startOfWeek}</div>
        <div style={{ padding: "5px 0" }}>
          <span className="w3-tag w3-round w3-pink">Maps</span>&nbsp;
          <a href={maps.openStreetMaps} style={{ textDecoration: "none" }} target="_blank" rel="noreferrer">🗺<i className="fa fa-external-link-square" aria-hidden="true"></i></a>
        </div>
      </div>
    </div>
  );
}


export async function openCountryDetailsModal(code) {
  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${code}`)
    const template = ReactDOMServer.renderToString(<CDTemplate code={code} detail={res.data[0]} />);
    const title = res.data[0].name.common;
    Swal.fire({
      title: title,
      imageAlt: "Coat of Arms",
      html: template,
      showDenyButton: false,
      showConfirmButton: true,
      showCloseButton: true,
      confirmButtonText: "Country Related News",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return fetch(`${BackendURL}/hotnews/${title}?region=${code}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText)
            }
            return response.json()
          })
          .catch(error => {
            Swal.showValidationMessage(error)
          })
      },
      allowOutsideClick: () => !Swal.isLoading()
    })
      .then(results => {
        if (results.isConfirmed) {
          if (results.value.length > 0) {
            Swal.fire({
              title: `<b>${title}</b> <sup style="font-size:15px;color:#34a853;">Related news</sup>`,
              html: generateNewsHTMLV2(results.value),
              showConfirmButton: false,
              showCloseButton: true
            })
          }
        }
      })
  }
  catch (error) {
    console.log(error);
    toast.error(error.message, { autoClose: 1000, hideProgressBar: true })
  }
}