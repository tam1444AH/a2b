import React from 'react';
import './SignUp.css';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from 'react-bootstrap/esm/Button';

export default function SignUp({ setAuth }) {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const checkEmailExists = async (email) => {
    try {
      const response = await fetch(`http://www.a2bapp.xyz/checkEmail/${email}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email existence:', error.message);
      showErrorMessage('Error checking email existence.');
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { Name, Email, Address, Phone, Password } = event.target.elements;

    try {
      const emailExists = await checkEmailExists(Email.value);

      if (emailExists) {
        console.log('Email already exists. Please choose another email.');
        showErrorMessage('Email already exists. Please choose another email.');
        return;
      }

      const response = await axios.post(`http://www.a2bapp.xyz/signup`, {
        Name: Name.value,
        Email: Email.value,
        Address: Address.value,
        Phone: Phone.value,
        Password: Password.value,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.userName);
        setAuth(true);
        console.log(response.data);
        navigate('/');
      } else {
        showErrorMessage('Failed to sign up. Please try again.');
      }
    } catch (error) {
      showErrorMessage('Failed to sign up. Please try again.');
      console.error('An error occurred during sign up:', error.message);
    }
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
    }, 5000);
  };

  return (
    <>
      <div className='outer-container'>
        <div className='form-container'>
          <Form onSubmit={handleSubmit}>
            <Form.Group className='form-title'>
              <h1>Sign Up</h1>
            </Form.Group>
            <br />
            <Form.Group className="mb-3">
              <Form.Label htmlFor="InputName" className="form-label">Name:</Form.Label>
              <Form.Control type="text" className="form-control" id="InputName" name="Name" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="InputEmail" className="form-label">Email address:</Form.Label>
              <Form.Control type="email" className="form-control" id="InputEmail" name="Email" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="InputAddress" className="form-label">Address:</Form.Label>
              <Form.Control type="text" className="form-control" id="InputAddress" name="Address" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="InputPhoneNumber" className="form-label">Phone Number:</Form.Label>
              <Form.Control type="text" className="form-control" id="InputPhoneNumber" name="Phone" required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="InputPassword" className="form-label">Password:</Form.Label>
              <Form.Control type="password" className="form-control" id="InputPassword" name="Password" required />
            </Form.Group>
            <br />
            <Button variant="primary" type="submit" id='submit-button'>Submit</Button>
          </Form>

          {errorMessage && (
            <div className='error'>
              <br />
              <h5>{errorMessage}</h5>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
