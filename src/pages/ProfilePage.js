import React from 'react';
import './ProfilePage.css';
import './Brand.css';
import Loader from '../components/Loader';
import HeadingText from '../components/HeadingText';
import GradientButton from "../components/GradientButton";
import { Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';

const user = {
    "_id": "67ed727fd16f702d39096410",
    "name": "Karan Rao",
    "email": "admin@sector17.com",
    "phone": "555-555-5555",
    "pos_login_pin": "$2b$10$v5Ldsf.7AmYmanChx0ZJx.I134Pon.1uEukZ7uOtkSHb839CiSzTa",
    "status": "active",
    "role": {
        "_id": "67ed727fd16f702d390963f2",
        "name": "Admin",
        "default_permissions": [
            "dashboard_view",
            "orders_view",
            "orders_edit",
            "orders_delete",
            "sales_view",
            "sales_create",
            "sales_edit",
            "sales_delete",
            "customers_view",
            "customers_edit",
            "customers_delete",
            "inventory_view",
            "inventory_edit",
            "inventory_delete",
            "settings_manage",
            "reports_view",
            "reports_edit",
            "reports_delete",
            "staff_manage"
        ],
        "createdAt": "2025-04-02T17:23:11.437Z",
        "updatedAt": "2025-04-02T17:23:11.437Z",
        "__v": 0
    },
    "permissions": [
        "dashboard_view",
        "orders_view",
        "orders_edit",
        "orders_delete",
        "sales_view",
        "sales_create",
        "sales_edit",
        "sales_delete",
        "customers_view",
        "customers_edit",
        "customers_delete",
        "inventory_view",
        "inventory_edit",
        "inventory_delete",
        "settings_manage",
        "reports_view",
        "reports_edit",
        "reports_delete",
        "staff_manage"
    ],
    "brands": [
        {
            "_id": "67ed727fd16f702d39096404",
            "name": "Sector 17",
            "short_name": "17sector2",
            "email": "sector17@example.com",
            "phone": "320-948-0932",
            "owner_id": "67ed727fd16f702d39096401",
            "status": "active",
            "gst_no": "GST123456789",
            "license_no": "LIC987654321",
            "food_license": "FSSAI123456",
            "website": "https://sector17.com",
            "city": "Toronto",
            "state": "Ontario",
            "country": "Canada",
            "postal_code": "M5H 2N2",
            "street_address": "123 Queen Street W",
            "createdAt": "2025-04-02T17:23:11.456Z",
            "updatedAt": "2025-04-22T04:23:44.430Z",
            "__v": 0,
            "full_name": "Simran"
        },
        {
            "_id": "680485860fb4f631e475204f",
            "full_name": "Sector 17",
            "short_name": "17sector",
            "email": "sahilyadav9704@gmail.com",
            "phone": "090-509-6264",
            "owner_id": "67ed727fd16f702d39096410",
            "status": "active",
            "gst_no": "GST123456780",
            "license_no": "LIC987654323",
            "food_license": "FSSAI123453",
            "website": "https://sector17.in",
            "city": "Hisar",
            "state": "Haryana",
            "country": "India",
            "postal_code": "125001",
            "street_address": "H. No. 659-A",
            "createdAt": "2025-04-20T05:26:30.794Z",
            "updatedAt": "2025-04-22T04:25:35.649Z",
            "__v": 0
        }
    ],
    "outlets": [
        {
            "timezone": {
                "label": "(UTC-11:00) Samoa, Midway Atoll",
                "value": "Pacific/Midway"
            },
            "_id": "67f0d4d4960492b41f279d8c",
            "brand_id": "67ed727fd16f702d39096404",
            "name": "Sahil",
            "code": "2342",
            "email": "sahilyadav97042@gmail.com",
            "phone": "230-948-2093",
            "opening_time": "12:12",
            "closing_time": "12:12",
            "website": "https://sector17.com",
            "street": "H. No. 659-A",
            "city": "Hisar",
            "state": "Haryana",
            "country": "India",
            "postal_code": "125001",
            "status": "active",
            "createdAt": "2025-04-05T06:59:32.463Z",
            "updatedAt": "2025-04-22T05:53:53.270Z",
            "__v": 0
        },
        {
            "timezone": {
                "label": "(UTC-11:00) Samoa, Midway Atoll",
                "value": "Pacific/Midway"
            },
            "_id": "680720384d7af658018580ed",
            "brand_id": "67ed727fd16f702d39096404",
            "name": "Sahil 2",
            "code": "2343",
            "email": "sahilyadav9704@gmail.com",
            "phone": "090-509-6264",
            "opening_time": "12:12",
            "closing_time": "12:12",
            "website": "https://outletA.com",
            "street": "H. No. 659-A",
            "city": "Hisar",
            "state": "Haryana",
            "country": "India",
            "postal_code": "125001",
            "status": "active",
            "createdAt": "2025-04-22T04:51:04.102Z",
            "updatedAt": "2025-04-22T05:58:48.376Z",
            "__v": 0
        },
        {
            "timezone": {
                "label": "(UTC-12:00) Baker Island",
                "value": "Etc/GMT+12"
            },
            "_id": "680721bccce8c05a4a2ce24c",
            "brand_id": "680485860fb4f631e475204f",
            "name": "Simran",
            "code": "2343",
            "email": "sahilyadav9704@gmail.com",
            "phone": "090-509-6264",
            "opening_time": "12:12",
            "closing_time": "12:12",
            "website": "https://sector17.com",
            "street": "H. No. 659-A",
            "city": "Hisar",
            "state": "Haryana",
            "country": "India",
            "postal_code": "125001",
            "status": "active",
            "createdAt": "2025-04-22T04:57:32.414Z",
            "updatedAt": "2025-04-22T05:52:54.578Z",
            "__v": 0
        },
        {
            "timezone": {
                "label": "(UTC-12:00) Baker Island",
                "value": "Etc/GMT+12"
            },
            "_id": "68072726a4e3235ef38a3f03",
            "brand_id": "680485860fb4f631e475204f",
            "name": "Simran 2",
            "code": "2321",
            "email": "sahilyadav970422@gmail.com",
            "phone": "090-509-6263",
            "opening_time": "12:12",
            "closing_time": "12:12",
            "website": "https://outletA.com",
            "street": "H. No. 659-A",
            "city": "Hisar",
            "state": "Haryana",
            "country": "India",
            "postal_code": "125001",
            "status": "active",
            "createdAt": "2025-04-22T05:20:38.144Z",
            "updatedAt": "2025-04-22T05:53:34.435Z",
            "__v": 0
        }
    ],
    "createdAt": "2025-04-02T17:23:11.624Z",
    "updatedAt": "2025-04-22T07:13:49.697Z",
    "__v": 0,
    "image": "https://images.pexels.com/photos/31225680/pexels-photo-31225680/free-photo-of-outdoor-basketball-hoop-under-blue-sky.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
}

const ProfilePage = () => {
    return (
        <>
            {
                false && <Loader />
            }
            <HeadingText title={"Profile"} />
            <div className="profile-container">
                {/* user info */}
                <div className="profile-header card">
                    <div className='user-info'>
                        <img src={user.image} alt="Profile" className="profile-image" />
                        <div>
                            <h2>{user.name}</h2>
                            <div>
                                <p>{user.email}</p>
                                <p>{user.phone}</p>
                            </div>
                            <span className="status active">{user.status.toUpperCase()}</span>
                        </div>
                    </div>
                    <GradientButton className={"user-info-edit-btn"}>
                        <Pencil size={16} />
                        <span>Edit Info</span>
                    </GradientButton>

                </div>

                {/* user role & permissions */}
                <h3>Role & Permissions</h3>
                <div className="card role-permissions">
                    <p><strong>Role:</strong> {user.role.name}</p>
                    <strong>Permissions:</strong>
                    <div className="permissions">
                        {user.permissions.map((perm, index) => (
                            <span key={index} className="permission">{perm}</span>
                        ))}
                    </div>
                </div>

                {/* Assigned brands */}
                <h3>Assigned Brands</h3>
                <div className="flex-section">
                    {user.brands.map((brand) => (
                        <div key={brand._id} className="card card-section">
                            <p><strong>Name:</strong> {brand.name}</p>
                            <p><strong>Email:</strong> {brand.email}</p>
                            <p><strong>Phone:</strong> {brand.phone}</p>
                            <p><strong>Location:</strong> {brand.city}, {brand.state}, {brand.country}</p>
                            <p><strong>GST:</strong> {brand.gst_no}</p>
                            <p><strong>License:</strong> {brand.license_no}</p>
                            <p><strong>Food License:</strong> {brand.food_license}</p>
                            <p><strong>Website:</strong> <Link to={brand.website} target="_blank">{brand.website}</Link></p>
                        </div>
                    ))}
                </div>

                {/* Assigned Outlets */}
                <h3>Assigned Outlets</h3>
                <div className="flex-section">
                    {user.outlets.map((outlet) => (
                        <div key={outlet._id} className="card card-section">
                            <p><strong>Name:</strong> {outlet.name}</p>
                            <p><strong>Code:</strong> {outlet.code}</p>
                            <p><strong>Email:</strong> {outlet.email}</p>
                            <p><strong>Phone:</strong> {outlet.phone}</p>
                            <p><strong>Website:</strong> <Link to={outlet.website} target="_blank">{outlet.website}</Link></p>
                            <p><strong>Address:</strong> {outlet.street}, {outlet.city}, {outlet.state}, {outlet.country} - {outlet.postal_code}</p>
                            <p><strong>Opening Time:</strong> {outlet.opening_time}</p>
                            <p><strong>Closing Time:</strong> {outlet.closing_time}</p>
                            <p><strong>Timezone:</strong> {outlet.timezone.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default ProfilePage;
