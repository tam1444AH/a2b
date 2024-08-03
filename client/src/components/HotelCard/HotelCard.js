import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import './HotelCard.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

function HotelCard({ hotel }) {
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isBooked, setIsBooked] = useState(false);
    const [numNights, setNumNights] = useState(1);
    const [cardInfo, setCardInfo] = useState('');
    const [cardExpDate, setCardExpDate] = useState('');
    const [startDate, setStartDate] = useState(new Date());


    const handleSave = () => {
        setIsSaving(true);

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const savedHotel = {
            hotel_id: hotel.dupeId,
            user_id: userId,
            hotel_name: hotel.name,
            rating: hotel.rating,
            country_code: hotel.address.countryCode,
            distance_from_airport: hotel.distance.value,
            airport_iata_code: hotel.iataCode
        };

        if (userId && token) {
            axios.post(`http://3.14.142.122/savedhotels`, savedHotel, {
                headers: { 'Authorization': token }
            })
            .then(response => {
                console.log('Hotel saved:', response.data);
                setIsSaved(true);
                setIsSaving(false);
                alert('Hotel saved successfully!');
            })
            .catch(error => {
                console.error('Error saving hotel:', error);
                alert('Failed to save hotel.');
                setIsSaving(false);
            });
        } else {
            setIsSaving(false);
            alert('You need to be logged in to save a hotel.'); 
        }

    };

    const handleBookClick = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleBookHotel = () => {
        setIsBooking(true);
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId || !token) {
            alert('You need to be logged in to book a flight');
            return;
        }
        
        const totalCost = numNights * 100;

        const bookedHotel = {
            hotel_id: hotel.dupeId,
            user_id: userId,
            hotel_name: hotel.name,
            rating: hotel.rating,
            country_code: hotel.address.countryCode,
            distance_from_airport: hotel.distance.value,
            airport_iata_code: hotel.iataCode
        }

        const bookingDetails = {
            hotel: bookedHotel,
            numNights,
            startDate,
            totalCost
        };

        

        if (document.getElementById('hotelBookingForm').checkValidity()) {
            axios.post('http://3.14.142.122/bookhotel', bookingDetails, {
                headers: { Authorization: token },
            })
            .then((response) => {
                console.log('Hotel booking confirmed:', response.data);
                setIsBooked(true);
                setIsBooking(false);
                alert('Hotel booking confirmed! Check your email for details.');
                handleCloseModal();
            })
            .catch((error) => {
                console.error('Error booking hotel:', error);
                alert('Failed to book hotel. Please try again.');
                setIsBooking(false);
            });
        } else {
            alert('Please fill out the form correctly.');
            setIsBooking(false);
        }
    };
    
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
                    <Button 
                        variant="primary" 
                        className='button left-button' 
                        onClick={handleSave}
                        disabled={isSaving || isSaved}
                    >
                        {isSaving ? 'Saving...' : isSaved ? 'Hotel Saved' : 'Save this hotel'}
                    </Button>
                    <Button 
                        variant="primary" 
                        className='button right-button' 
                        onClick={handleBookClick}
                        disabled={isBooking || isBooked}
                    >
                        {isBooking ? 'Booking...' : isBooked ? 'Hotel Booked' : 'Book a room'}
                    </Button>
                </div>
            </Card.Body>


            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Book Hotel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="hotelBookingForm">
                        <Form.Group controlId="formNights">
                            <Form.Label>Number of Nights ($100 per night)</Form.Label>
                            <Form.Control
                                type="number"
                                value={numNights}
                                onChange={(e) => setNumNights(e.target.value)}
                                min="1"
                                max="30"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formCardInfo" className="mt-3">
                            <Form.Label>Card Number:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Card Number"
                                value={cardInfo}
                                onChange={(e) => setCardInfo(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formCardExpDate" className="mt-3">
                            <Form.Label>Expiration Date:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="MM/YY"
                                value={cardExpDate}
                                onChange={(e) => setCardExpDate(e.target.value)}
                                pattern="^(0[1-9]|1[0-2])\/?([0-9]{2})$"
                                title="Please enter a valid expiration date in MM/YY format."
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formStartDate" className="mt-3">
                            <Form.Label>Start Date:</Form.Label>
                            <br/>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                minDate={new Date()}
                                className="form-control"
                                required
                            />
                        </Form.Group>

                        <div className="mt-3">
                            <p>Total Cost: ${numNights * 100}</p>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleBookHotel}>
                        Book Now
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}

export default HotelCard;
