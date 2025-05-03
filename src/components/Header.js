import React, { useContext, useEffect, useState } from 'react';
import './Header.css';
import logo from "../assets/dark-logo.png";
import downArrow from "../assets/downArrow.png";
import AuthContext from "../context/AuthContext";
import Popup from './Popup';

const Header = () => {
  const { staff, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownToggle = () => {
    setDropdownOpen(prevState => !prevState);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    console.log(staff);
  }, [staff]);

  return (
    <header className="header">
      <div className="left-side">
        <img src={logo} alt="POS logo" />
        {/* <h1>Fizzy</h1> */}
      </div>
      <div className="right-side">
        <div className="profile-image" onClick={handleDropdownToggle}>
          <img
            src={staff.image}
            alt="user profile"
            onError={(e) =>
              (e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png")
            }
          />
        </div>
        <div>
          <p className="name">{staff.name}</p>
          <p className="role">{staff.role.name}</p>
        </div>
        <button onClick={handleDropdownToggle}>
          <img src={downArrow} alt="toggle profile dropdown" />
        </button>

        {dropdownOpen && (
          <Popup closePopup={handleDropdownToggle}>
            <div style={{ padding: '1rem', minWidth: '250px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
                borderBottom: '1px solid #eee',
                paddingBottom: '0.5rem'
              }}>
                <img
                  src={staff.image}
                  alt="user profile"
                  style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) =>
                    (e.target.src = "https://cdn.pixabay.com/photo/2014/04/02/10/25/man-303792_1280.png")
                  }
                />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{staff.name}</h3>
                  <p style={{ margin: 0, color: '#666' }}>{staff.role.name}</p>
                </div>
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                <p><strong>Email:</strong> {staff.email}</p>
                <p><strong>Phone:</strong> {staff.phone}</p>
                <p><strong>Status:</strong> {staff.status}</p>
                <p><strong>Permissions:</strong> {staff.permissions?.length}</p>
                <p><strong>Outlets:</strong> {staff.outlets?.length}</p>
                <p><strong>Brands:</strong> {staff.brands?.length}</p>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Logout
              </button>
            </div>
          </Popup>
        )}
      </div>
    </header>
  );
};

export default Header;
