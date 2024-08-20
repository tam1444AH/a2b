import React, { useState } from 'react';
import './Hotels.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FlightCard from '../FlightCard/FlightCard.js';
import axios from 'axios';
import { IoCloudOutline } from 'react-icons/io5';
import HotelCard from '../HotelCard/HotelCard.js';

function Hotels() {

  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hotelsFound, setHotelsFound] = useState([]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const IATA = form['IATA'].value;
    const dist = form['dist'].value;
    const rating = form['rating'].value;

    console.log('Form submitted successfully:', { IATA, dist, rating });
    // Perform the form submission logic here
    try {
      const response = await axios.get(`http://www.a2bapp.xyz/hotels/${IATA}-${dist}-${rating}`);
      const foundHotels = response.data;
      console.log(foundHotels);
      setHotelsFound(foundHotels);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotelsFound([]);
      showErrorMessage('Error fetching hotels. Please try again later.');
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
      <div className='outer-containerH'>
        <div className='form-containerH'>
          <Form onSubmit={handleSubmit} className='formH'>
            <Form.Group className="mb-3">
              <legend>Enter the following:</legend>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="text" placeholder="IATA code of airport of arrival" name='IATA' pattern="[A-Z]{3}" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Control type="number" placeholder="Maximum distance from airport of arrival (in miles)" name='dist' min="1" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Select name="rating" class="form-select" required>
                <option value="">Rating</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit" id='submit-button'>
              Search for hotels
            </Button>
          </Form>
        </div>
        <div className='form-messageH'>
          
          {errorMessage && (
              <center><h5 className='error-messageH'>{errorMessage}</h5></center>
          )}
          
          {showSuccessMessage && hotelsFound.length > 0 && (
            <center><h5 className='messageH'>{hotelsFound.length} hotels found.</h5></center>
          )}

        </div>
        <div className='hotels-containerH'>
          <div className='hotels-innerContainerH'>
            <div className='hotelsList'>
              {hotelsFound.length === 0 ? (
                <div className='no-hotels'>
                  <IoCloudOutline className='cloud-icon' />
                  <p>Fill out the form to search for hotels</p>
                </div>
              ) : (
                hotelsFound.map(hotel => (
                  <HotelCard key={hotel.hotelId} hotel={hotel} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      
    </>
  );
}

export default Hotels;
