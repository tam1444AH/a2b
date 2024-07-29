import React, { useEffect, useState } from 'react';
import './Profile.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { IoCloudOutline } from 'react-icons/io5';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Profile() {

    const [flights, setFlights] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showModalHotel, setShowModalHotel] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [numNights, setNumNights] = useState(1);
    const [numTickets, setNumTickets] = useState(1);
    const [cardInfo, setCardInfo] = useState('');
    const [cardExpDate, setCardExpDate] = useState('');
    const [startDate, setStartDate] = useState(new Date());
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

        const totalCost = numTickets * 100;

        const bookingDetails = {
            flight: selectedFlight,
            numTickets,
            cardInfo,
            totalCost
        };

        // Check if form is valid
        if (document.getElementById('flightBookingForm').checkValidity()) {
            const token = localStorage.getItem('token');
    
            axios.post('http://localhost:3001/bookflight', bookingDetails, {
            headers: {
                Authorization: token,
            },
            })
            .then((response) => {
                console.log('Booking confirmed:', response.data);
                alert('Booking confirmed! Check your email for details.');
            })
            .catch((error) => {
                console.error('Error booking flight:', error);
                alert('Failed to book flight. Please try again.');
            });
    
            handleCloseModal();
        } else {
            alert('Please fill out the form correctly.');
        }
    };


    const handleBookHotelClick = (hotel) => {
        setSelectedHotel(hotel);
        setShowModalHotel(true);
    };

    const handleCloseModalHotel = () => {
        setShowModalHotel(false);
        setSelectedHotel(null);
    };

    const handleBookHotel = () => {
        const userId = localStorage.getItem('userId');
        const totalCost = numNights * 100;

        const bookingDetails = {
            hotel: selectedHotel,
            numNights,
            cardInfo,
            cardExpDate,
            startDate,
            totalCost
        };

        // Check if form is valid
        if (document.getElementById('hotelBookingForm').checkValidity()) {
            const token = localStorage.getItem('token');
    
            axios.post('http://localhost:3001/bookhotel', bookingDetails, {
            headers: {
                Authorization: token,
            },
            })
            .then((response) => {
                console.log('Hotel booking confirmed:', response.data);
                alert('Hotel booking confirmed! Check your email for details.');
            })
            .catch((error) => {
                console.error('Error booking hotel:', error);
                alert('Failed to book hotel. Please try again.');
            });
    
            handleCloseModalHotel();
        } else {
            alert('Please fill out the form correctly.');
        }
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
                                    <th>Departure Time</th>
                                    <th>Arrival Time</th>
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
                                            <td>{flight.departure_time}</td>
                                            <td>{flight.arrival_time}</td>
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
                                        hotels.map(hotel => (
                                            <tr key={hotel.hotel_name}>
                                                <td>{hotel.hotel_name}</td>
                                                <td>{hotel.rating}</td>
                                                <td>{hotel.country_code}</td>
                                                <td>{hotel.distance_from_airport}</td>
                                                <td>{hotel.airport_iata_code}</td>
                                                <td>
                                                    <Button variant="primary" onClick={() => handleBookHotelClick(hotel)}>Book</Button>
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
                    <Form id="flightBookingForm">
                        <Form.Group controlId="formTickets">
                            <Form.Label>Number of Tickets ($100 dollar per ticket)</Form.Label>
                            <Form.Control
                                type="number"
                                value={numTickets}
                                onChange={(e) => setNumTickets(e.target.value)}
                                min="1"
                                max="10"
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

                        <div className="mt-3">
                            <p>Total Cost: ${numTickets * 100}</p>
                        </div>
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

            <Modal show={showModalHotel} onHide={handleCloseModalHotel}>
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
                    <Button variant="secondary" onClick={handleCloseModalHotel}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleBookHotel}>
                        Book Now
                    </Button>
                </Modal.Footer>
            </Modal>
        
        </>
        
    );
}

export default Profile;
