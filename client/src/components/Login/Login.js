import React from 'react'
import './Login.css';
import Form from 'react-bootstrap/Form';
import NavbarF from '../Navbar/Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Button from 'react-bootstrap/esm/Button';

export default function Login({ setAuth }) {

    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const { Email, Password } = event.target.elements;

        try {
            const response = await axios.post(`http://3.128.170.201/login`, {
                Email: Email.value,
                Password: Password.value
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.user_id);
                localStorage.setItem('userName', response.data.userName);
                console.log(response.data);
                setAuth(true);
                navigate('/');
            } else {
                showErrorMessage('Incorrect email or password. Please try again.');
            }
        } catch (error) {
            showErrorMessage('Incorrect email or password. Please try again.');
            console.error('An error occured during log in:', error.message);
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
                <Form.Group className="mb-3">
                    <h1>Login</h1>
                </Form.Group>
                <br/>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="InputEmail" className="form-label">Email address:</Form.Label>
                    <Form.Control type="email" className="form-control" id="InputEmail" name="Email" required/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="InputPassword" className="form-label">Password:</Form.Label>
                    <Form.Control type="password" className="form-control" id="InputPassword" name="Password" required/>
                </Form.Group>
                <br/>
                <Button variant="primary" type="submit" id='submit-button'>Submit</Button>
            </Form>

            {errorMessage && <div className='error'>
                <br/>
                <h5>{errorMessage}</h5>
            </div>}

        </div>
    </div>
    </>
    )
}

