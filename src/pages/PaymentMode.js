// src/pages/Brand.js

import { useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import './Brand.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';
import SelectInput from '../components/SelectInput';

const PaymentMode = () => {

    const [username, setUsername] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [isChecked, setIsChecked] = useState(false);

    return (
        <>
            <HeadingText>Payment Type</HeadingText>
            <div className="brand-filter">
                <div className="two-col-row">
                    <SelectInput
                        label="Brand Name"
                        options={["Option 1"]}
                        placeholder="Seclect Brand"
                        value={selectedValue}
                        onChange={setSelectedValue}
                    />
                    <SelectInput
                        label="Outlet Name"
                        options={["Option 1"]}
                        placeholder="Select Outlet"
                        value={selectedValue}
                        onChange={setSelectedValue}
                    />
                </div>
                <div className="filter-action-btns">
                    <GradientButton>Submit</GradientButton>
                    <Button>Reset</Button>
                </div>
            </div>
            <HeadingText>Payment Type List</HeadingText>
            <div className="cards-container">
                <EditCard title="Dhindhu" status="active" />
                <EditCard title="Findu" status="inactive" />
                <CardAdd />
            </div>
            {
                false &&
                <Popup
                    title={"Payment Type"}
                    closePopup={() => alert('ok')}
                >
                    <div className="inputs-container">
                        <InputField
                            label="Payment Name"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter payment name"
                            required
                        />
                        <div className="checkbox-container" style={{marginTop: '1rem'}}>
                            <Checkbox
                                label="Status"
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                            />
                        </div>
                    </div>

                    <div className="action-btns-container">
                        <GradientButton>Update</GradientButton>
                        <Button>Close</Button>
                    </div>
                </Popup>
            }
        </>
    )
}

export default PaymentMode;
