

import './Popup.css';

const Popup = ({ title, children }) => {

    return (
        <div className="popup-main card">
            <h2>{title}</h2>
            <div className="popup-body">{children}</div>
        </div>
    )
}

export default Popup;