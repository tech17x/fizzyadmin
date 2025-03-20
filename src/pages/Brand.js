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

const Brand = () => {

    const [username, setUsername] = useState("");

    return (
        <>
            <HeadingText>Brand List</HeadingText>
            <div className="cards-container">
                <EditCard firstLetter="d" title="Dhindhu" link="https://menu.tmbill.com/brand/Techptivate" status="active" />
                <EditCard firstLetter="f" title="Findu" link="https://menu.tmbill.com/brand/Techptivate" status="inactive" />
                <CardAdd />
            </div>
            {
                false &&
                <Popup
                    title={"Brand Configuration"}
                    closePopup={() => alert('ok')}
                >
                    <div className="inputs-container">
                        <div className="inputs-row">
                            <InputField
                                label="Brand name"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Brand name"
                                required
                            />
                            <InputField
                                label="Short name"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Short name"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="GST No"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter GST no"
                                required
                            />
                            <InputField
                                label="License no"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter License no"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Food License"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Food license"
                                required
                            />
                            <InputField
                                label="Phone no"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Phone no"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Website"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Website"
                                required
                            />
                            <InputField
                                label="Street & City"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter street & city"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="State"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter state"
                                required
                            />
                            <InputField
                                label="Country"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter country"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Pin Code"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter pin code"
                                required
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

export default Brand;
