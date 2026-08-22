const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../Models/User");

const register = async (req, res) => {
  console.log("Register endpoint reached");
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, password and role are required",
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or phone number is required",
      });
    }

    if (!["student", "recruiter"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (email) {
      const existingEmail = await User.findByEmail(email);

      if (existingEmail) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }
    }

    if (phone) {
      const existingPhone = await User.findByPhone(phone);

      if (existingPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number already registered",
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email || null,
      phone: phone || null,
      passwordHash,
      role,
    });

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async(req,res)=>{
  try{
    const{identifier, password}=req.body;

    if(!identifier || !password){
      return res.status(400).json({
        success: false,
        message:"Email or phone and password are required",
      });
    }
    const user = await User.findByIdentifier(identifier);

    if(!user){
      return res.status(401).json({
        success:false,
        message:"Invalid credentials",
      });
    }
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );
    if(!passwordMatch){
      return res.status(401).json({
        success:false,
        message:"Invalid credentials",
      });
    }
    const token = jwt.sign(
      {
      userId:user.id,
      role:user.role,
    },
    process.env.JWT_SECRET,
  {
    expiresIn:"7d",
  }
);
    
    return res.status(200).json({
      success:true,
      message:"Login successful",
      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        role:user.role,
      },
      token,
    });
  }
  catch(error){
    console.error("LOGIN ERROR:",error);

    return res.status(500).json({
      success:false,
      message:"Internal server error",
    });
  }
};


module.exports = {
  register,
  login,
};