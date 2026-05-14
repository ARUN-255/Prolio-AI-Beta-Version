require('./config/db');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

//Guys this is our middleware
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth',authRoutes);
console.log('Auth routes loaded successfully');
const studentRoutes = require('./routes/student.routes');
app.use('/api/student',studentRoutes);
const recruiterRoutes = require('./routes/recruiter.routes');
app.use('/api/recruiter',recruiterRoutes);

//Guys this our test route
app.get('/',function(req,res){
    res.json({message:'ProlioAI Backend is running!'});
});

//Guys this is start server
const PORT = process.env.PORT || 5000;
app.listen(PORT,function(){
    console.log('Server running on port'+PORT);
});
