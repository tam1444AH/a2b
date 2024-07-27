import React, { useEffect, useState } from 'react';
import './Profile.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { IoCloudOutline } from 'react-icons/io5';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';

function Profile() {

    const [flights, setFlights] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [numTickets, setNumTickets] = useState(1);
    const [cardInfo, setCardInfo] = useState('');
    const navigate = useNavigate();
    const name = localStorage.getItem('userName');

    useEffect(() => {
        // Check if user is logged in
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        
        if (!userId || !token) {
            navigate('/login'); // Redirect to login if not logged in
        } else {
            // Fetch saved flights and hotels
            axios.get(`http://localhost:3001/savedflights/${userId}`, {
                headers: { 'Authorization': token }
            })
            .then(response => {
                setFlights(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching flights:', error);
            });

            axios.get(`http://localhost:3001/savedhotels/${userId}`, {
                headers: { 'Authorization': token }
            })
            .then(response => {
                setHotels(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching hotels:', error);
            });
        }
    }, [navigate]);

    const handleDeleteFlight = async (flightId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3001/deleteflight/${flightId}`, {
                headers: { 'Authorization': token }
            });
            setFlights(flights.filter(flight => flight.flight_id !== flightId));
        } catch (error) {
            console.error('Error deleting flight:', error.message);
        }
    };

    const handleDeleteHotel = async (hotelId) => {
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`http://localhost:3001/deletehotel/${hotelId}`, {
                headers: { 'Authorization': token }
            });
            setHotels(hotels.filter(hotel => hotel.hotel_id !== hotelId));
        } catch (error) {
            console.error('Error deleting hotel:', error.message);
        }
    };

    const handleBookClick = (flight) => {
        setSelectedFlight(flight);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedFlight(null);
    };

    const handleBookFlight = () => {

        const userId = localStorage.getItem('userId');

        const bookingDetails = {
            flight: selectedFlight,
            numTickets,
            cardInfo,
        };

        
        const token = localStorage.getItem('token');
    
        axios.post('http://localhost:3001/bookflight', bookingDetails, {
            headers: {
                'Authorization': token
            }
        })
        .then(response => {
            console.log('Booking confirmed:', response.data);
            alert('Booking confirmed! Check your email for details.');
        })
        .catch(error => {
            console.error('Error booking flight:', error);
            alert('Failed to book flight. Please try again.');
        });
    
        handleCloseModal();
    };


    return (

        <>
        
            <div className='outer-containerP'>

                <div className='welcome-containerP'>
                    <h1>Welcome {name}!</h1>
                </div>

                <div className='flight-containerP'> 
                    <div className='table-container'>
                        <Table striped bordered hover variant="dark" className='flights-table'>
                            <thead>
                                <tr>
                                    <th>Airline</th>
                                    <th>Flight Number</th>
                                    <th>Departure Airport IATA</th>
                                    <th>Arrival Airport IATA</th>
                                    <th>Flight Date</th>
                                    <th>Status</th>
                                    <th>Arrival Time</th>
                                    <th>Departure Time</th>
                                    <th>Book</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody className='table-body'>
                                {flights.length > 0 ? (
                                    flights.map(flight => (
                                        <tr key={flight.flight_id}>
                                            <td>{flight.airline}</td>
                                            <td>{flight.flight_number}</td>
                                            <td>{flight.departure_airport_iata}</td>
                                            <td>{flight.arrival_airport_iata}</td>
                                            <td>{flight.flight_date}</td>
                                            <td>{flight.status}</td>
                                            <td>{flight.arrival_time}</td>
                                            <td>{flight.departure_time}</td>
                                            <td>
                                                <Button variant="primary" onClick={() => handleBookClick(flight)}>Book</Button>
                                            </td>
                                            <td>
                                                <Button variant="danger" onClick={() => handleDeleteFlight(flight.flight_id)}>Delete</Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10">
                                            <div className='empty-message'>
                                                <IoCloudOutline size={50} />
                                                <p>Save a flight for it to appear here</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <div className='hotel-containerP'>
                    <div className='table-container'>
                        <Table striped bordered hover variant="dark" className='hotels-table'>
                            <thead>
                                <tr>
                                    <th>Hotel Name</th>
                                    <th>Rating</th>
                                    <th>Country Code</th>
                                    <th>Distance from local airport (in miles)</th>
                                    <th>Airport IATA Code</th>
                                    <th>Book</th>
                                    <th>Delete</th>
                                </tr>
                            </thead>
                            <tbody className='table-body'>
                                {hotels.length > 0 ? (
                                        flights.map(hotel => (
                                            <tr key={hotel.name}>
                                                <td>{hotel.name}</td>
                                                <td>{hotel.rating}</td>
                                                <td>{hotel.country_code}</td>
                                                <td>{hotel.distance_from_airport}</td>
                                                <td>{hotel.airport_iata_code}</td>
                                                <td>
                                                    <Button variant="primary">Book</Button>
                                                </td>
                                                <td>
                                                    <Button variant="danger" onClick={() => handleDeleteHotel(hotel.hotel_id)}>Delete</Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7">
                                                <div className='empty-message'>
                                                    <IoCloudOutline size={50} />
                                                    <p>Save a hotel for it to appear here</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Book Flight</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formTickets">
                            <Form.Label>Number of Tickets</Form.Label>
                            <Form.Control
                                type="number"
                                value={numTickets}
                                onChange={(e) => setNumTickets(e.target.value)}
                                min="1"
                                max="10"
                            />
                        </Form.Group>

                        <Form.Group controlId="formCardInfo" className="mt-3">
                            <Form.Label>Card Information</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Card Number"
                                value={cardInfo}
                                onChange={(e) => setCardInfo(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleBookFlight}>
                        Book Now
                    </Button>
                </Modal.Footer>
            </Modal>
        
        </>
        
    );
}

export default Profile;
