const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
require('dotenv').config(); 
const nodemailer = require('nodemailer');
const path = require('path');


const corsOptions = {
    origin: 'http://3.128.170.201', 
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));


const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS, 
    }
});


transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to take our messages.');
    }
});



const JWT_SECRET = process.env.JWT_SECRET;


const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};



const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});


(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connected to the database.');
        connection.release();
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
})();


app.use(express.json()); 



const _dirname = path.dirname("");
const buildPath = path.join(_dirname  , "../client/build");

app.use(express.static(buildPath));


let moduleF = require('../client/src/flights.js');
let flightsArr = moduleF.flights;

let moduleH = require('../client/src/hotelsList.js');
let hotelsArr = moduleH.hotels;

const verifyToken = (req, res, next) => {
    
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        }
        req.userId = decoded.id;
        next();
    });
};


app.get('/flights/:from-:to', async (req, res) => {

    const from = req.params.from.trim().toUpperCase();
    const to = req.params.to.trim().toUpperCase();

    // res.json(flightsArr);

    try {
        const response = await axios.get(`http://api.aviationstack.com/v1/flights`, {
            params: {
                access_key: process.env.API_ACCESS_KEY,
                dep_iata: from,
                arr_iata: to,
            }
        });
        
        res.json(response.data.data);
    } catch (error) {       
        console.error('Error fetching flights:', error);
        res.status(500).json({ error: 'Error fetching flights' });
    }
});


const getAccessToken = async () => {
    const apiKey = process.env.AMADEUS_API_KEY;
    const apiSecret = process.env.AMADEUS_API_SECRET;
    const tokenUrl = 'https://test.api.amadeus.com/v1/security/oauth2/token';
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios.post(tokenUrl, 'grant_type=client_credentials', {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${auth}`
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response ? error.response.data : error.message);
        throw error;
    }
};


app.get('/hotels/:to-:dist-:stars', async (req, res) => {
    const to = req.params.to.toUpperCase();
    const dist = req.params.dist;
    const stars = req.params.stars;

    // res.json(hotelsArr);

    try {
        const accessToken = await getAccessToken();
        const response = await axios.get('https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            params: {
                cityCode: to,
                radius: dist,
                radiusUnit: 'MILE',
                ratings: stars,
                hotelSource: 'ALL'
            }
        });
        res.json(response.data.data);
    } catch (error) {
        console.error('Error fetching hotels:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error fetching hotels' });
    }
});

app.post('/bookflight', verifyToken, async (req, res) => {
    
    const { flight, numTickets, totalCost } = req.body;
    const userId = req.userId;
    
    
    try {
        
        const bookingId = '123456'; 
       
        const [userResult] = await db.query('SELECT email, name FROM users WHERE user_id = ?', [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userEmail = userResult[0].email;
        const userName = userResult[0].name;
        

        
        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: userEmail, 
            subject: 'Flight Booking Confirmation', 
            text: `Dear ${userName},

Thank you for booking with us. Your booking details are as follows:

- Airline: ${flight.airline}
- Flight: ${flight.flight_number}
- Departure: ${flight.departure_airport_iata}
- Arrival: ${flight.arrival_airport_iata}
- Date: ${flight.flight_date}
- Departure time: ${flight.departure_time}
- Arrival time: ${flight.arrival_time}
- Number of Tickets: ${numTickets}
- Total cost: $${totalCost}

Booking ID: ${bookingId}

Please keep this information for your records.

Best regards,
A2B
`, 
        };

        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending confirmation email' });
            }
            console.log('Email sent:', info.response);
            res.json({ message: 'Booking confirmed, confirmation email sent.' });
        });

    } catch (error) {
        console.error('Error processing booking:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/bookhotel', verifyToken, async (req, res) => {
    
    const { hotel, numNights, startDate, totalCost } = req.body;
    const userId = req.userId;
    
    
    try {
        
        const bookingId = '123456'; 
       
        const [userResult] = await db.query('SELECT email, name FROM users WHERE user_id = ?', [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userEmail = userResult[0].email;
        const userName = userResult[0].name;
        

        
        const mailOptions = {
            from: process.env.EMAIL_USER, 
            to: userEmail, 
            subject: 'Hotel Booking Confirmation', 
            text: `Dear ${userName},

Thank you for booking with us. Your hotel booking details are as follows:

- Hotel: ${hotel.hotel_name}
- Rating: ${hotel.rating}
- Country Code: ${hotel.country_code}
- Distance from local airport (in miles): ${hotel.distance_from_airport}
- Local airport IATA code: ${hotel.airport_iata_code}
- Start date:  ${new Date(startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
- Number of nights: ${numNights}
- Total cost: ${totalCost}

Booking ID: ${bookingId}

Please keep this information for your records.

Best regards,
A2B
`, 
        };

        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending confirmation email' });
            }
            console.log('Email sent:', info.response);
            res.json({ message: 'Hotel booking confirmed, confirmation email sent.' });
        });

    } catch (error) {
        console.error('Error processing hotel booking:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/signup', async (req, res) => {
    try {
        const { Name, Email, Address, Phone, Password } = req.body;
        const [result] = await db.query('INSERT INTO users (name, email, address, phone, password) VALUES (?, ?, ?, ?, ?)', [Name, Email, Address, Phone, Password]);
        
        const user = {
            user_id: result.insertId,
            name: Name,
            email: Email,
            address: Address,
            phone: Phone
        };
        
        const token = generateToken(user);
        res.status(201).json({ message: 'User created successfully', token, userId: user.user_id, userName: user.name });
    } catch (error) {
        console.error('Error during signup:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/checkEmail/:email', async (req, res) => {
    try {
        const { Email } = req.params;

        
        const [result] = await db.query('SELECT * FROM users WHERE email = ?', [Email]);

       
        res.json({ exists: result.length > 0 });
    } catch (error) {
        console.error('Error checking email existence:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {
    
    try {
        const { Email, Password } = req.body;
        const [result] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [Email, Password]);

        if (result.length > 0) {
            const user = result[0];
            const token = jwt.sign({ id: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user_id: user.user_id, userName: user.name });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/savedflights/:user_id', verifyToken, async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query('SELECT * FROM saved_flights WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching saved flights:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}); 

app.post('/savedflights', verifyToken, async (req, res) => {
    const { airline, flight_number, departure_airport_iata, arrival_airport_iata, flight_date, status, arrival_time, departure_time } = req.body;
    const userId = req.userId;


    try {
        const [result] = await db.query('INSERT INTO saved_flights (user_id, airline, flight_number, departure_airport_iata, arrival_airport_iata, flight_date, status, arrival_time, departure_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [userId, airline, flight_number, departure_airport_iata, arrival_airport_iata, flight_date, status, arrival_time, departure_time]);
        
        res.status(201).json({ message: 'Flight saved successfully', savedFlightId: result.insertId });
    } catch (error) {
        console.error('Error saving flight:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/savedhotels/:user_id', verifyToken, async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await db.query('SELECT * FROM saved_hotels WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching saved hotels:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/savedhotels', verifyToken, async (req, res) => {
    const { hotel_id, hotel_name, rating, country_code, distance_from_airport, airport_iata_code } = req.body;
    const userId = req.userId;

    try {
        const [result] = await db.query('INSERT INTO saved_hotels (hotel_id, user_id, hotel_name, rating, country_code, distance_from_airport, airport_iata_code) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [hotel_id, userId, hotel_name, rating, country_code, distance_from_airport, airport_iata_code]);

        res.status(201).json({ message: 'Hotel saved successfully', savedHotelId: result.insertId });
    } catch (error) {
        console.error('Error saving hotel:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/deleteflight/:flight_id', verifyToken, async (req, res) => {
    const flightId = req.params.flight_id;
    try {
        await db.query('DELETE FROM saved_flights WHERE flight_id = ?', [flightId]);
        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting flight:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/deletehotel/:hotel_id', verifyToken, async (req, res) => {
    const hotelId = req.params.hotel_id;
    try {
        await db.query('DELETE FROM saved_hotels WHERE hotel_id = ?', [hotelId]);
        res.status(204).send(); 
    } catch (error) {
        console.error('Error deleting hotel:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/*", function(req, res){
    
    
    res.sendFile(
        path.join(__dirname, "../client/build/index.html"),
        function (err) {
          if (err) {

            res.status(500).send(err);
            
          }
        }
      );

});


app.listen(3001, () => {console.log('Server started on port 3001.')});
