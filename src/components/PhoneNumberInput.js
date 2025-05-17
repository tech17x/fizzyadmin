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
        <div className="inputs-row phone-input__row">
            <SelectInput
                label={"Phone"}
                selectedOption={selectedCountry}
                onChange={onCountryChange}
                options={countryOptions}
                disabled={disable}
            />
            <InputField
                type="tel"
                name="phone_number"
                format="##########"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                disabled={disable}
                placeholder="Enter phone number"
            />
        </div>
    );
};

export default PhoneNumberInput;
