import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { IoAirplaneSharp } from "react-icons/io5";
import './FlightCard.css'
import { airports } from '../../airports';

function FlightCard({flight}) {
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
    console.log('Save button clicked.');
  };

  const handleBook = () => {
    console.log('Book button clicked.');
  }

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
                  {departureCity}, {departureCountry}
                </Card.Text>
              </div>

              <div>
                Date: {flight.flight_date} <IoAirplaneSharp className='plane-icon'/> Status: {flight.flight_status}
              </div>

              <div className='flight-section right-section'>
                <Card.Title>B</Card.Title>
                <Card.Text>
                  Arrival: {flight.arrival.airport} ({flight.arrival.iata}), <br/>
                  {arrivalCity}, {arrivalCountry}
                </Card.Text>
              </div>
              
          </div>
          <br/>
          <div className='button-container'>
              <Button variant="primary" className='button left-button' onClick={handleSave}>Save this flight</Button>
              <Button variant="primary" className='button right-button' onClick={handleBook}>Book this flight</Button>
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default FlightCard;
