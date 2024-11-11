import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { IoAirplaneSharp } from "react-icons/io5";
import './FlightCard.css'
import { airports } from '../../airports';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { flights } from "../../flights";


function FlightCard({flight}) {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [numTickets, setNumTickets] = useState(1);
  const [cardInfo, setCardInfo] = useState('');
  const [cardExpDate, setCardExpDate] = useState('');

  let departureCity = null;
  let departureCountry = null;
  let arrivalCity = null;
  let arrivalCountry = null;

  for (let city of airports) {
    if (city.code === flight.departure.iata) {
      departureCity = city.city;
      departureCountry = city.country;
    }
    else if (city.code === flight.arrival.iata) {
      arrivalCity = city.city;
      arrivalCountry = city.country;
    }
  }

  const handleSave = () => {
    setIsSaving(true);

    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const savedFlight = {
      airline: flight.airline.name,
      flight_number: flight.flight.iata,
      departure_airport_iata: flight.departure.iata,
      arrival_airport_iata: flight.arrival.iata,
      flight_date: flight.flight_date,
      status: flight.flight_status,
      arrival_time: flight.arrival.scheduled,
      departure_time: flight.departure.scheduled
    };

    if (userId && token) {
      axios.post(`http://www.a2bapp.xyz/savedflights`, savedFlight, {
        headers: { 'Authorization': token }
      })
      .then(response => {
        console.log('Flight saved:', response.data);
        setIsSaved(true);
        setIsSaving(false);
        alert('Flight saved successfully!');
      })
      .catch(error => {
        console.error('Error saving flight:', error);
        alert('Failed to save flight.');
        setIsSaving(false);
      });
    } else {
        setIsSaving(false);
        alert('You need to be logged in to save a flight.'); 
    }
    
  };

  const handleBookClick = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleBookFlight = () => {
    setIsBooking(true);
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      alert('You need to be logged in to book a flight');
      setIsBooking(false);
      return;
    }

    const totalCost = numTickets * 100;

    const bookedFlight = {
      airline: flight.airline.name,
      flight_number: flight.flight.iata,
      departure_airport_iata: flight.departure.iata,
      arrival_airport_iata: flight.arrival.iata,
      flight_date: flight.flight_date,
      status: flight.flight_status,
      arrival_time: flight.arrival.scheduled,
      departure_time: flight.departure.scheduled
    };

    const bookingDetails = {
      flight: bookedFlight,
      numTickets,
      totalCost
    };

    // Check if form is valid
    if (document.getElementById('flightBookingForm').checkValidity()) {
      const token = localStorage.getItem('token');

      axios.post('http://www.a2bapp.xyz/bookflight', bookingDetails, {
      headers: {
          Authorization: token,
      },
      })
      .then((response) => {
          console.log('Booking confirmed:', response.data);
          setIsBooking(false);
          setIsBooked(true);
          alert('Booking confirmed! Check your email for details.');
      })
      .catch((error) => {
          console.error('Error booking flight:', error);
          setIsBooking(false);
          alert('Failed to book flight. Please try again.');
      });

      handleCloseModal();
    } else {
        setIsBooking(false);
        alert('Please fill out the form correctly.');
    }

  };

  

  return (
    <>
      <Card className='mb-3 flight-card' text='light' border='dark'>
        <Card.Header as="h3" className='header'><center>{flight.airline.name} - {flight.flight.number}</center></Card.Header>
        <Card.Body className='body'>
          <div className='flight-info'>
              <div className='flight-section'>
                <Card.Title>A</Card.Title>
                <Card.Text>
                  Departure: {flight.departure.airport} ({flight.departure.iata}),<br/>
                  {departureCity}, {departureCountry}, <br/>
                  Departure Time: {flight.departure.scheduled}
                </Card.Text>
              </div>

              <div>
                Date: {flight.flight_date} <IoAirplaneSharp className='plane-icon'/> Status: {flight.flight_status} <br/>
                <center><p className="small-text">(local airport times in 24hr time)</p></center>
              </div>

              <div className='flight-section right-section'>
                <Card.Title>B</Card.Title>
                <Card.Text>
                  Arrival: {flight.arrival.airport} ({flight.arrival.iata}), <br/>
                  {arrivalCity}, {arrivalCountry}, <br/>
                  Arrival Time: {flight.arrival.scheduled}
                </Card.Text>
              </div>
              
          </div>
          <br/>
          <div className='button-container'>
            <Button 
              variant="primary" 
              className='button left-button' 
              onClick={handleSave}
              disabled={isSaving || isSaved}
            >
              {isSaving ? 'Saving...' : isSaved ? 'Flight Saved' : 'Save this flight'}
            </Button>
            <Button 
              variant="primary" 
              className='button right-button' 
              onClick={handleBookClick}
              disabled={isBooking || isBooked}
            >
              {isBooking ? 'Booking...' : isBooked ? 'Flight Booked' : 'Book a flight'}
            </Button>
          </div>
        </Card.Body>

        <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Book Flight</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form id="flightBookingForm" className="modal-form">
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
      </Card>
    </>
  );
}

export default FlightCard;
