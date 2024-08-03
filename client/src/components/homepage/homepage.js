import React, { useState } from 'react';
import './homepage.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FlightCard from '../FlightCard/FlightCard.js';
import axios from 'axios';
import { IoCloudOutline } from 'react-icons/io5';

function Homepage() {
  const [flightsFound, setFlightsFound] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // const userId = localStorage.getItem('userId');
  // const token = localStorage.getItem('token');


  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const departureIATA = form['departureIATA'].value;
    const arrivalIATA = form['arrivalIATA'].value;

    setSubmitted(true);

    if (departureIATA.length !== 3 || arrivalIATA.length !== 3) {
      showErrorMessage('Invalid IATA code. Please enter a valid 3-letter IATA code.');
      return;
    }

    try {
      const response = await axios.get(`http://3.144.42.63/flights/${departureIATA}-${arrivalIATA}`);
      const foundFlights = response.data;
      setFlightsFound(foundFlights);
      console.log(foundFlights);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error fetching flights:", error);
      setFlightsFound([]);
      showErrorMessage('Error fetching flights. Please try again later.');
    }
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowSuccessMessage(false);
    setTimeout(() => {
      setErrorMessage('');
      setShowSuccessMessage(true);
    }, 5000);
  };

  return (
    <>
      <div className='outer'>
        <div className='form-container'>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <legend>Enter the following:</legend>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="text" placeholder="IATA code of airport of departure" name='departureIATA' required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="text" placeholder="IATA code of airport of arrival" name='arrivalIATA' required />
            </Form.Group>
            <Button variant="primary" type="submit" id='submit-button'>
              Search for flights
            </Button>
          </Form>
        </div>
      </div>

      <div className='form-message'>
        {errorMessage && (
          <div className='error-container'>
            <h5 className='error-message'>{errorMessage}</h5>
          </div>
        )}
        {showSuccessMessage && flightsFound.length > 0 && (
          <h5 className='message'>{flightsFound.length} flights found.</h5>
        )}
      </div>

      <div className='flightsOuterContainer'>
        <div className='flightsInnerContainer'>
          <div className='flightsList'>
            {flightsFound.length === 0 ? (
              <div className='no-flights'>
                <IoCloudOutline className='cloud-icon' />
                <p>Enter the IATA codes of your trip to search for flights</p>
              </div>
            ) : (
              flightsFound.map(flight => (
                <FlightCard key={flight.flight.number} flight={flight} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Homepage;
