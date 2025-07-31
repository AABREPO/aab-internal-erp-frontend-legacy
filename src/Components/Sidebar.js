import React from "react";
import "./Sidebar.css";
import menu from ''
import coin from './Images/coin.png'
import money from './Images/money.png'
import wirte from './Images/wirte.png'
import wishlist from './Images/wishlist.png'
import addfriend from  './Images/add-friend.png'

const Sidebar = () => {
    return (
        <div className="sidebar">
            <ul className="sidebar-list">
                <li className="sidebar-item">
                    <img src={menu} alt="#"></img>
                </li>
                <li className="sidebar-item">
                    <img src={money} alt="#"></img>
                </li>
                <li className="sidebar-item">
                    <img src={coin} alt="#"></img>
                </li>
                <li className="sidebar-item">
                    <img src={wirte} alt="#"></img>
                </li>
                <li className="sidebar-item">
                    <img src={addfriend} alt="#"></img>
                </li>
                <li className="sidebar-item active">
                    <img src={wishlist} alt="#"></img>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
