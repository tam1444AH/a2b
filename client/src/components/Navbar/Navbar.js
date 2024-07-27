import React from 'react';
import './Navbar.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { IoIosAirplane } from "react-icons/io";

function NavbarF({ auth, setAuth }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuth(false);
  };

  return (
    <Navbar className="navbar">
      <Container>
        <Navbar.Brand href="/">A<IoIosAirplane />B</Navbar.Brand>
        <Nav className="me-auto">
          {auth ? (
            <>
              <Nav.Link href="/hotels">Hotels</Nav.Link>
              <Nav.Link href="/profile">Profile</Nav.Link>
              <Nav.Link href="/" onClick={handleLogout}>Log Out</Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link href="/login">Log In</Nav.Link>
              <Nav.Link href="/signup">Sign Up</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavbarF;
