import { toast } from "react-toastify"
import Swal from "sweetalert2";
import axios from "axios";


export const BackendURL = process.env.REACT_APP_TRENDY_WORLD_BACKEND;

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

export const content = `
**Welcome To The Trendy World : Stay Ahead with Daily Search Trends 😉**

Are you ready to unlock the power of daily search trends? At Trendy World, we offer you a gateway to stay at the forefront of what's buzzing and trending in the online world. Whether you're a content creator, marketer, or just a curious mind, our platform provides valuable insights that can drive your success. 💪💼🌐

**Why Embrace Daily Search Trends?**

In today's fast-paced digital landscape, staying relevant is key. By harnessing the power of daily search trends, you can:

**1. Boost Your Content:** Discover popular keywords and phrases that resonate with your audience. Tailor your content to their interests and watch your engagement soar. 📝✨

**2. Seize Timely Opportunities:** Capitalize on trending topics to create timely and compelling content that captivates your audience. 🚀⏰📢

**3. Understand User Intent:** Get inside the minds of your audience by analyzing their search behavior. Understand what they are looking for and deliver solutions that truly matter. 🧠🔍💡

**4. Stay Ahead of Competitors:** Keep a keen eye on your competition. Track their strategies and adapt your own to maintain a competitive edge. 👀📊🏆

**5. Embrace Seasonal Trends:** Plan ahead and align your marketing campaigns with seasonal trends, tapping into heightened interest during specific periods. 🗓️🎉🎁

**6. Be Informed:** Be the first to know about breaking news and current events with real-time updates on what's trending globally. 🌐📰🔔

**How Trendy World Works**

Our intuitive platform provides you with instant access to the most relevant and up-to-date search trends. Simply browse through our user-friendly interface and explore the trending topics that matter most to you. 🖥️🔍🚀

**Start Your Trend Journey Today**

Embrace the power of daily search trends and unlock your potential for success. Join us at Trendy World and make every day a step towards a brighter, trendier future. 🚀🌟

**Stay in the know. Stay trendy.** 🧭📲📈
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

export function generateNewsHTMLV1(news) {
  let html = '<p>';

  news.forEach(item => {
    html += `    <div>\n`;
    html += `        <h5><a href="${item['ht:news_item_url']}" target="_blank" >${item['ht:news_item_title']}</a></h5>\n`;
    html += `        <p>${item['ht:news_item_snippet']}</p>\n`;
    html += `        <p>Source: <em>${item['ht:news_item_source']}</em></p>\n`;
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
    html += `        <h5><a href="${item['link']}" target="_blank" >${item['title']}</a></h5>\n`;
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
