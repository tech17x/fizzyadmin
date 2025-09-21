import React from "react";
import InputField from "./InputField";
import SelectInput from "./SelectInput";

const PhoneNumberInput = ({
    label = "Phone Number",
    countryOptions = [],
    selectedCountry = null,
    onCountryChange,
    phoneNumber = "",
    onPhoneNumberChange,
    disable = false,
}) => {
    return (
        <div className="phone-input__row">
            <div className="input-field__container">
                <SelectInput
                    label="Country Code"
                    selectedOption={selectedCountry}
                    onChange={onCountryChange}
                    options={countryOptions}
                    disabled={disable}
                />
            </div>
            <div className="input-field__container">
                <InputField
                    label="Phone Number"
                    type="tel"
                    name="phone_number"
                    format="##########"
                    value={phoneNumber}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    disabled={disable}
                    placeholder="Enter phone number"
                />
            </div>
        </div>
    );
};

export default PhoneNumberInput;