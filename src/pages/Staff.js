// src/pages/Brand.js

import { useState } from 'react';
import CardAdd from '../components/CardAdd';
import EditCard from '../components/EditCard';
import HeadingText from '../components/HeadingText';
import InputField from '../components/InputField';
import './Brand.css';
import './Outlet.css';
import './Staff.css';
import GradientButton from '../components/GradientButton';
import Button from '../components/Button';
import SelectInput from '../components/SelectInput';
import Checkbox from '../components/Checkbox';

const Staff = () => {

    const [username, setUsername] = useState("");
    const [selectedValue, setSelectedValue] = useState("");
    const [isChecked, setIsChecked] = useState(false);


    return (
        <>
            <HeadingText>Karan</HeadingText>
            {
                false ?
                    <div className="current-staff-info">
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
                        <HeadingText>Staff List</HeadingText>
                        <div className="cards-container">
                            <EditCard firstLetter={"d"} title={"Karan"} role={"Cashier"} location={"Dhindu Delhi"} time={"2024-04-04 20:53:15"} status={"active"} />
                            <CardAdd />
                        </div>
                    </div> :
                    <div className="add-new-staff-info">
                        <div className="step-links">
                            <div className="step-btns">
                                {
                                    true ?
                                        <GradientButton>Profile</GradientButton>
                                        :
                                        <Button>Profile</Button>
                                }
                            </div>
                            <div className="step-btns">
                                {
                                    false ?
                                        <GradientButton>User Permissions</GradientButton>
                                        :
                                        <Button>User Permissions</Button>
                                }
                            </div>
                            <div className="step-btns">
                                {
                                    false ?
                                        <GradientButton>Brand Permissions</GradientButton>
                                        :
                                        <Button>Brand Permissions</Button>
                                }
                            </div>
                            <div className="step-btns">
                                {
                                    false ?
                                        <GradientButton>Outlet Permissions</GradientButton>
                                        :
                                        <Button>Outlet Permissions</Button>
                                }
                            </div>
                        </div>
                        {
                            false &&
                            <div className="profile-info">
                                <InputField
                                    label="Username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Username"
                                    required
                                />
                                <InputField
                                    label="Name"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Name"
                                    required
                                />
                                <InputField
                                    label="Phone"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Phone no"
                                    required
                                />
                                <InputField
                                    label="Email"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Email"
                                    required
                                />
                                <InputField
                                    label="Passowd"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Password"
                                    required
                                />
                                <InputField
                                    label="Pos Login Pin"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter Pin"
                                    required
                                />
                            </div>
                        }
                        {
                            false &&
                            <div className="permissions">
                                <SelectInput
                                    label="Roles (Dropdown)"
                                    options={["Option 1"]}
                                    placeholder="Select Roles"
                                    value={selectedValue}
                                    onChange={setSelectedValue}
                                />

                                <p style={{ margin: "1rem 0" }}>Permissions</p>

                                <table class="checkbox-table">
                                    <thead>
                                        <tr>
                                            <th>Features</th>
                                            <th>Capabilities</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Dashboard</td>
                                            <td>
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Tax</td>
                                            <td>
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                                <Checkbox
                                                    label="Sector 17"
                                                    checked={isChecked}
                                                    onChange={() => setIsChecked(!isChecked)}
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                            </div>
                        }
                        {
                            false &&
                            <div className="brand-permissions">
                                <p>Permissions</p>
                                <div className="box">
                                    <div className="box-head">
                                        Brand
                                    </div>
                                    <div className="box-body">
                                        <Checkbox
                                            label="N&D"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                        <Checkbox
                                            label="Sector 17"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        {
                            true &&
                            <div className="brand-permissions">
                                <SelectInput
                                    label="Brand (Dropdown)"
                                    options={["Option 1"]}
                                    placeholder="Select Brand"
                                    value={selectedValue}
                                    onChange={setSelectedValue}
                                />

                                <p>Permissions</p>
                                <div className="box">
                                    <div className="box-head">
                                        Outlet
                                    </div>
                                    <div className="box-body">
                                        <Checkbox
                                            label="1"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                        <Checkbox
                                            label="2"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                        <Checkbox
                                            label="3"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                        <Checkbox
                                            label="4"
                                            checked={isChecked}
                                            onChange={() => setIsChecked(!isChecked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        }
                        <div className="sections-action-btns-container">
                            <GradientButton>Update</GradientButton>
                            <Button>Close</Button>
                        </div>
                    </div>
            }
        </>
    )
}

export default Staff;
