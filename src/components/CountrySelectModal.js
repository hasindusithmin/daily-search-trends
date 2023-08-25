import Rodal from "rodal";
import Select from 'react-select'
import { selectOptions } from "../utils/commons";
import { useState } from "react";

export default function CountrySelectModal({ openCounSelectModal, setOpenCounSelectModal, setCountries }) {

    return (
        <Rodal
            visible={openCounSelectModal}
            closeOnEsc={true}
            onClose={() => { setOpenCounSelectModal(false) }}
        >
            <div className="w3-padding">
                <h5 className="w3-center">Select Countries</h5>
                <Select
                    styles={{zIndex:1000}}
                    options={selectOptions}
                    isMulti={true}
                    onChange={opt => setCountries(opt.map(({ value }) => value))}
                />
            </div>
        </Rodal>
    )
}