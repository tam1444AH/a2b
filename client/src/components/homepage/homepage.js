import React, { useState } from 'react';
import './homepage.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FlightCard from '../FlightCard/FlightCard.js';
import axios from 'axios';
import { IoCloudOutline } from 'react-icons/io5';
import { flights } from "../../flights";
import {Row, Col} from 'react-bootstrap'


function Homepage() {
  const [flightsFound, setFlightsFound] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFlightsFound(flights);
  //   event.preventDefault();
  //   const form = event.target;
  //   const departureIATA = form['departureIATA'].value;
  //   const arrivalIATA = form['arrivalIATA'].value;

  //   setSubmitted(true);

  //   if (departureIATA.length !== 3 || arrivalIATA.length !== 3) {
  //     showErrorMessage('Invalid IATA code. Please enter a valid 3-letter IATA code.');
  //     return;
  //   }

  //   try {
  //     const response = await axios.get(`http://www.a2bapp.xyz/flights/${departureIATA}-${arrivalIATA}`);
  //     const foundFlights = response.data;
  //     setFlightsFound(foundFlights);
  //     console.log(foundFlights);
  //     setShowSuccessMessage(true);
  //   } catch (error) {
  //     console.error("Error fetching flights:", error);
  //     setFlightsFound([]);
  //     showErrorMessage('Error fetching flights. Please try again later.');
  //   }
  // };

  // const showErrorMessage = (message) => {
  //   setErrorMessage(message);
  //   setShowSuccessMessage(false);
  //   setTimeout(() => {
  //     setErrorMessage('');
  //     setShowSuccessMessage(true);
  //   }, 5000);
  };


  return (
    <>
      <div className='outer'>
        
        <Form onSubmit={handleSubmit} class='w-25 p-3' className='form-container-home'>
          <div class='text-center'>
            <Form.Group class="mb-1">
              <p class='fs-4 text-white fw-medium'>Enter the following:</p>
            </Form.Group>
            <Form.Group class="row mb-3">
              <Form.Control type="text" placeholder="IATA code of airport of departure" name='departureIATA' required />
            </Form.Group>
            <Form.Group class="row mb-4">
              <Form.Control type="text" placeholder="IATA code of airport of arrival" name='arrivalIATA' required />
            </Form.Group>         
            <Button type='submit' className='btn btn-danger'>
              Search for flights
            </Button>
          </div>
        </Form>

        <div className='flights-box'>
          <div className='flights-list'>
            <Row>
              {flightsFound.length > 0 ? flightsFound.map((flight, index) => (
                <FlightCard flight={flight} key={index}/>
              )) : (
                <div className='no-flights'>
                  <IoCloudOutline className='cloud-icon' />
                  <p>Search for flights.</p>
                </div>
              )}
            </Row>
          </div>
        </div>
        
      </div>
    </>
  );
}

export default Homepage;
