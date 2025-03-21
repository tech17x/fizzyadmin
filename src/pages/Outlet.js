// src/pages/Brand.js

import { useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import Popup from '../components/Popup';
import './Brand.css';
import './Outlet.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';

const Outlet = () => {

    const [username, setUsername] = useState("");
    const [selectedValue, setSelectedValue] = useState("");


    return (
        <>
            <HeadingText>Outlet</HeadingText>
            <div className="brand-filter">
                <SelectInput
                    label="Brand Name"
                    options={["Option 1", "option 2", "option 3"]}
                    placeholder="Seclect Brand"
                    value={selectedValue}
                    onChange={setSelectedValue}
                />
                <div className="filter-action-btns">
                    <GradientButton>Submit</GradientButton>
                    <Button>Reset</Button>
                </div>
            </div>
            <HeadingText>Outlet List</HeadingText>
            <div className="cards-container">
                <EditCard firstLetter={"d"} title={"Dhindhu Delhi"} time={"2024-04-04 20:53:15"} link={"https://menu.tmbill.com/brand/Techptivate"} status={"active"} />
                <EditCard firstLetter={"d"} title={"Dhindhu Delhi"} time={"2024-04-04 20:53:15"} link={"https://menu.tmbill.com/brand/Techptivate"} status={"inactive"} />
                <CardAdd />
            </div>
            {
                false &&
                <Popup
                    title={"Outlet Configuration"}
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
                                label="Outlet name"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter outlet name"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Outlet code"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter outlet code"
                                required
                            />
                            <InputField
                                label="Timezone"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Select timezone"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Opening Time"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="select time"
                                required
                            />
                            <InputField
                                label="Closing  Time"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="select time"
                                required
                            />
                        </div>
                        <div className="inputs-row">
                            <InputField
                                label="Email"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter email"
                                required
                            />
                            <InputField
                                label="Phone no"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter phone no"
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

export default Outlet;
