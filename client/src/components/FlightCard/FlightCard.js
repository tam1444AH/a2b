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
import { BiCalendar } from 'react-icons/bi'


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
      <div className="col-md-4 mb-4">
        <Card className="flight-card shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="flight-time">{new Date(flight.departure.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</h3>
              <IoAirplaneSharp className="plane-icon text-danger"/>
              <h3 className="flight-time">{new Date(flight.arrival.scheduled).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</h3>
            </div>
            <div className="d-flex justify-content-between align-items-center flight-route">
              <span className="iata-code fw-normal">{flight.departure.iata}</span>
              <div className="time-line"></div>
              <span className="iata-code fw-normal">{flight.arrival.iata}</span>
            </div>
            <Card.Text className="text-center mt-3 mb-2 flight-name">
              <strong>{flight.airline.name} {flight.flight.number}</strong>
            </Card.Text>
            <div className="d-flex justify-content-between">
              <span className="badge bg-dark text-white">{flight.flight_status}</span>
              <span className="badge bg-dark text-white">{flight.flight_date}</span>
            </div>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between">
            <Button variant={isSaved ? "secondary" : "danger"} size="sm" onClick={handleSave}>
              {isSaved ? "Saved" : "Save Flight"}
            </Button>
            <Button variant="danger" size="sm">Book Flight</Button>
          </Card.Footer>
        </Card>
      </div>
    </>
  );
}

export default FlightCard;