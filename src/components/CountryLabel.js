import { iso, flags } from "../utils/commons";
export default function CountryLable({ selectedCountries }) {
    return (
        <span>{selectedCountries.map(code => (<span className="w3-tooltip">{flags[code]}&nbsp;<span className="w3-text">{iso[code]}</span></span>))}</span>
    )
}