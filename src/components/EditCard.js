import { Link } from 'react-router-dom';
import './EditCard.css';

const EditCard = ({ firstLetter, title, link, status, time, role, location, handleEdit }) => {


    return (
        <div className="edit-card">
            <button className='edit-btn' type='button' onClick={handleEdit}>
                <svg width="14" height="14" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 10V17.5C18 17.8978 17.842 18.2794 17.5607 18.5607C17.2794 18.842 16.8978 19 16.5 19H1.5C1.10218 19 0.720644 18.842 0.43934 18.5607C0.158035 18.2794 0 17.8978 0 17.5V2.50001C0 2.10219 0.158035 1.72065 0.43934 1.43935C0.720644 1.15805 1.10218 1.00001 1.5 1.00001H9C9.19891 1.00001 9.38968 1.07903 9.53033 1.21968C9.67098 1.36033 9.75 1.5511 9.75 1.75001C9.75 1.94892 9.67098 2.13969 9.53033 2.28034C9.38968 2.42099 9.19891 2.50001 9 2.50001H1.5V17.5H16.5V10C16.5 9.8011 16.579 9.61033 16.7197 9.46968C16.8603 9.32903 17.0511 9.25001 17.25 9.25001C17.4489 9.25001 17.6397 9.32903 17.7803 9.46968C17.921 9.61033 18 9.8011 18 10ZM18.5306 4.53064L9.53063 13.5306C9.46092 13.6003 9.37818 13.6555 9.28714 13.6931C9.19609 13.7308 9.09852 13.7501 9 13.75H6C5.80109 13.75 5.61032 13.671 5.46967 13.5303C5.32902 13.3897 5.25 13.1989 5.25 13V10C5.24992 9.90149 5.26926 9.80392 5.3069 9.71287C5.34454 9.62183 5.39975 9.53909 5.46937 9.46939L14.4694 0.469385C14.539 0.399653 14.6217 0.344333 14.7128 0.30659C14.8038 0.268847 14.9014 0.24942 15 0.24942C15.0986 0.24942 15.1962 0.268847 15.2872 0.30659C15.3783 0.344333 15.461 0.399653 15.5306 0.469385L18.5306 3.46938C18.6004 3.53904 18.6557 3.62176 18.6934 3.71281C18.7312 3.80385 18.7506 3.90145 18.7506 4.00001C18.7506 4.09857 18.7312 4.19617 18.6934 4.28722C18.6557 4.37826 18.6004 4.46098 18.5306 4.53064ZM16.9369 4.00001L15 2.06032L13.8103 3.25001L15.75 5.1897L16.9369 4.00001Z" fill="black" />
                </svg>
            </button>
            {firstLetter &&
                <div className="first-letter">
                    <span>{firstLetter}</span>
                </div>
            }
            {
                title &&
                <div className="title">{title}</div>
            }
            {
                role ?
                    <div className="sub-title">{role}</div> : null
            }
            {
                location ?
                    <div className="sub-title">{location}</div> : null
            }
            {
                time ?
                    <div className="timing">{time}</div> : null
            }
            {
                link &&
                <Link className='truncate-link' to={link} type='link' target='_blank'>{link}</Link>
            }
            {
                status &&
                <div className={`status ${status}`}>{status}</div>
            }
        </div>
    )
}

export default EditCard;