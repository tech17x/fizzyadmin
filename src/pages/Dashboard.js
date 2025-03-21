// src/pages/Dashboard.js

import React, { useContext } from 'react';
import './Dashboard.css'
import HeadingText from '../components/HeadingText';
import AuthContext from '../context/AuthContext';


const Dashboard = () => { 

  const { staff } = useContext(AuthContext);

  console.log(staff);

  return (
    <div className='dashboard-content'>
      <HeadingText>Dashboard</HeadingText>
    </div>
  );
};

export default Dashboard;
