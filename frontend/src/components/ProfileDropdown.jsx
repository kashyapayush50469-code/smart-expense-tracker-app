import React, { useState } from "react";
function ProfileDropdown({ handleLogout }) {
    // Menu open hai ya close, isko manage karne ke liye state
    const [isOpen, setIsOpen] = useState(false);

    // Click karne par toggle (open/close) karne ka function
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="profile-container">
            {/* Gol aakar ka Avatar Button */}
            <button className="avatar-btn" onClick={toggleDropdown}>
                <img
                    src="https://i.pinimg.com/736x/16/d5/21/16d521b76377d7ffaeac268fe28fdebd.jpg"
                    alt="Profile"
                    className="avatar-img"
                />
            </button>

            {/* Agar isOpen true hai, tabhi dropdown dikhega */}
            {isOpen && (
                <ul className="dropdown-menu">
                    <li><button className="Profile">My Profile</button></li>
                    <li><button className="setting">Settings</button></li>
                    <li className="divider"></li>
                    <li>
                        <button type="button" onClick={handleLogout}  className="logout-btn">Logout
                            </button></li>
                </ul>
            )}
        </div>
    );
}

export default ProfileDropdown;