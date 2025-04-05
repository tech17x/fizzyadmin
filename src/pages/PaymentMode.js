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
import useFetchBrands from '../hooks/useFetchBrands';
import useFetchOutlets from '../hooks/useFetchOutlets';
import axios from 'axios';

const PaymentMode = () => {
    const { brands } = useFetchBrands();
    const { outlets } = useFetchOutlets();
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedOutlet, setSelectedOutlet] = useState(null);
    const [brandOutlet, setBrandOutlet] = useState(null);
    const [username, setUsername] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [isChecked, setIsChecked] = useState(false);


    // const getStaffData = async () => {
    //     if (!selectedBrand?._id || !selectedOutlet?._id) {
    //         return;
    //     }

    //     try {
    //         const response = await axios.get("http://localhost:5001/api/staff/staff", {
    //             params: {
    //                 brand_id: selectedBrand._id,
    //                 outlet_id: selectedOutlet._id,
    //             },
    //             withCredentials: true,
    //         });

    //         if (response.data.success) {
    //             setStaff(response.data.data);
    //             setBrandOutlet({
    //                 brand: selectedBrand,
    //                 outlet: selectedOutlet
    //             })
    //         } else {
    //             console.error("Error fetching staff data:", response.data.message);
    //             return [];
    //         }
    //     } catch (error) {
    //         console.error("API Error:", error.response?.data || error.message);
    //         return [];
    //     }
    // };

    return (
        <>
            <HeadingText>Payment Type</HeadingText>
            <div className="brand-filter">
                <div className="two-col-row">
                    <SelectInput
                        selectedOption={selectedBrand}
                        onChange={setSelectedBrand}
                        options={brands}
                        label="Brand Name"
                    />
                    <SelectInput
                        disable={!selectedBrand}
                        selectedOption={selectedOutlet}
                        onChange={setSelectedOutlet}
                        options={outlets.filter(outlet => outlet.brand_id === selectedBrand?._id)}
                        label="Outlet Name"
                    />
                </div>
                <div className="filter-action-btns">
                    <GradientButton>Submit</GradientButton>
                    <Button clickAction={() => { setSelectedBrand(null); setBrandOutlet(null) }}>Reset</Button>
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
                    title={"Order Type"}
                    closePopup={() => alert('ok')}
                >
                    <div className="inputs-container">
                        <InputField
                            label="Type Name"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter Brand name"
                            required
                        />
                        <SelectInput
                            label="Catageory"
                            options={["Option 1"]}
                            placeholder="Seclect Brand"
                            value={selectedValue}
                            onChange={setSelectedValue}
                        />
                        <SelectInput
                            label="Outlet"
                            options={["Option 1"]}
                            placeholder="Seclect Brand"
                            value={selectedValue}
                            onChange={setSelectedValue}
                        />
                        <div className="checkbox-container">
                            <Checkbox
                                label="Status"
                                checked={isChecked}
                                onChange={() => setIsChecked(!isChecked)}
                            />
                            <Checkbox
                                label="Apply on all outlets"
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
