
import autoComplete from "@tarekraafat/autocomplete.js";
import { useNavigate } from "react-router-dom";

export default function CountriesSearch() {

    const navigate = useNavigate()

    setTimeout(() => {
        const autoCompleteJS = new autoComplete({
            placeHolder: "Search for Countries...",
            data: {
                src: ['Australia', 'Argentina', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'Colombia', 'Czechia', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Kenya', 'Malaysia', 'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Romania', 'Russia', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Türkiye', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam'],
                cache: true,
            },
            resultItem: {
                highlight: true
            },
            events: {
                input: {
                    selection: (event) => {
                        const selection = event.detail.selection.value;
                        autoCompleteJS.input.value = selection;
                        navigate(`/country/${selection}`)
                    }
                }
            }
        });
    }, 1000)

    return (
        <p className="w3-center">
            <div className="autoComplete_wrapper">
                <input
                    id="autoComplete"
                    type="search"
                    dir="ltr"
                    spellCheck="false"
                    autoCorrect="off"
                    autoComplete="off"
                    autoCapitalize="off"
                    placeholder="Loading..."
                />
            </div>
        </p>
    )

}