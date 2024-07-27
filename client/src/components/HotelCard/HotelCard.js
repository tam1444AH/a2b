import React from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './HotelCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

function HotelCard({ hotel }) {
    const handleSave = () => {
        console.log('Saved.')
    }
    const handleBook = () => {
        console.log('Booked.')
    }
    
    // Create an array of stars based on the rating
    const stars = Array(hotel.rating).fill(<FontAwesomeIcon icon={faStar} color="gold" />);

    return (
        <Card className="hotel-card">
            <Card.Header as="h3" className='headerH'><center>{hotel.name}</center></Card.Header>
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted subtitle">
                    <h5>{stars.map((star, index) => <span key={index}>{star}</span>)}</h5>
                </Card.Subtitle>
                <Card.Text>
                    Distance: {hotel.distance.value} {hotel.distance.unit.toLowerCase()}
                </Card.Text>
                <Card.Text>
                    Country Code: {hotel.address.countryCode}
                </Card.Text>
                <Card.Text>
                    Price: $100 per night
                </Card.Text>
                <div className='button-container'>
                    <Button variant="primary" className='button left-button' onClick={handleSave}>Save this hotel</Button>
                    <Button variant="primary" className='button right-button' onClick={handleBook}>Book a room</Button>
                </div>
            </Card.Body>
        </Card>
    );
}

export default HotelCard;
