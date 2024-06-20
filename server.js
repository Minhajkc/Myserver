const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cookieParser());


const corsOptions = {
  origin: 'http://localhost:3001', 
  credentials: true, 
};
app.use(cors(corsOptions));


const mongoURI = 'mongodb+srv://minhajvvo:dv0IFcAcOn7OuEDh@cluster0.hxqluke.mongodb.net/mydatabase?retryWrites=true&w=majority';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);




app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const newUser = new User({ name, email, password });
    await newUser.save();

    console.log('Received signup data:', { name, email, password });
    res.status(201).send('Signup data received and saved!');
  } catch (error) {
    console.error('Error saving signup data:', error);
    res.status(500).send('Server error');
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(400).send('Invalid email or password');
    }

   
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.cookie('token', token, { httpOnly: true, secure: true });

    res.status(200).send('Login successful');
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Server error');
  }
});


const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).send('Access denied');
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }

    req.user = user;
    next();
  });
};



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
