const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/common");
const User = require("../models/user");
const { logAction, logActivity } = require("./commonController");


// Create a new admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await admin.save();
    res
      .status(201)
      .json({ success: true, message: "Admin created successfully", admin });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: error.message,
    });
  }
};

// Admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if the account is active
    if (admin.isDeleted) {
      return res
        .status(403)
        .json({ success: false, message: "Account is deactivated" });
    }

    // Update last login timestamp
    admin.lastLogin = new Date();
    await admin.save();
    // Generate token
    const tokenData = {
      userId: admin._id,
      email: admin.email,
      role: admin.role,
    };
    const token = generateToken(tokenData);

    // Set token in response headers
    res.setHeader('Authorization', `Bearer ${token}`);
    console.log(req.ip, "fdhffdjh")
    // Log the login action
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await logAction({
      userId: admin._id,
      userType: "Admin",
      action: "login",
      role: admin.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
    });


    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res
      .status(500)
      .json({ message: "Error logging in admin", error: error.message });
  }
};

// Get all admins
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res
      .status(500)
      .json({ message: "Error fetching admins", error: error.message });
  }
};

const fetchFamilyTree = async (userId) => {
  const familyMembers = await User.find({ parentUserId: userId }, "-otp -__v").populate('parentUserId');

  // Recursively fetch sub-family members for each family member
  const familyTree = await Promise.all(
    familyMembers.map(async (member) => ({
      _id: member._id,
      name: member.name,
      email: member.email,
      mobileNumber: member.mobileNumber,
      memberId: member.memberId,
      relation: member.relation,
      address: member.address,
      address1: member.address1,
      address2: member.address2,
      city: member.city,
      state: member.state,
      country: member.country,
      pin: member.pin,
      dateOfBirth: member.dateOfBirth,
      maritalStatus: member.maritalStatus,
      marriageDate: member.marriageDate,
      title: member.title,
      status: member.status,
      activatedDate: member.activatedDate,
      profilePicture: member.profilePicture,
      parentUserId: member.parentUserId,
      familyMembers: await fetchFamilyTree(member._id), // Recursively fetch sub-family members
    }))
  );

  return familyTree;
};

const getUserDetailsById = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract userId from the request parameters

    // Find the primary user by ID
    const user = await User.findById(userId, "-otp -__v").populate('parentUserId');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch the full family tree for this user
    const familyMembers = await fetchFamilyTree(userId);

    // Send the response including the user and their full family tree
    res.status(200).json({
      message: "User details retrieved successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        memberId: user.memberId,
        lastLogin: user.lastLogin,
        profilePicture: user.profilePicture,
        address: user.address,
        address1: user.address1,
        address2: user.address2,
        city: user.city,
        state: user.state,
        country: user.country,
        pin: user.pin,
        dateOfBirth: user.dateOfBirth,
        maritalStatus: user.maritalStatus,
        marriageDate: user.marriageDate,
        title: user.title,
        relation: user.relation,
        parentUserId: user.parentUserId,
        status: user.status,
        activatedDate: user.activatedDate,
        familyMembers, // Nested family members
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // const userId = req.user.userId; // Extract userId from the token's decoded data

    // Find the primary user by ID
    // const users = await User.find({});
    const users = (await User.find({ relation: "Primary" })).reverse();
    // Send the response including the user and their full family tree
    res.status(200).json({
      message: "User details retrieved successfully",
      users
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the user is a parent (parentUserId is null)
    if (!user.parentUserId) {
      // The user is a parent, so it cannot be deleted
      return res.status(400).json({
        message: 'Cannot delete the user because it is a parent member.',
        userId,
      });
    }

    // The user is a child, so proceed with deletion
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: 'Child user has been permanently deleted.',
      userId,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};


const adminLogout = async (req, res) => {
  try {
    const admin = req.user;
    // const adminId = req.user.id; // Assuming JWT middleware attaches `user` to `req`
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    await logAction({
      userId: admin.userId,
      userType: "Admin",
      action: "logout",
      role: admin.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
    });


    res.status(200).json({
      message: 'Logout successful, action logged.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
};

const qrScanDetails = async (req, res) => {
  try {
    const { memberId } = req.body;
    const userDetails = req.user;
    if (!memberId) {
      return res.status(400).json({ message: "memberId  are required." });
    }


    // Fetch member details
    const member = await User.findById(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    // Log activity
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await logActivity({
      memberId: member._id,
      gatekeeperId: userDetails.userId,
      activity: "qrScan",
      details: "QR code scanned and member details fetched.",
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
    })

    // Respond with member details
    return res.status(200).json({
      message: "Member details fetched successfully.",
      member
    });
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    console.error("Error fetching member details:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getAllActiveUsers = async (req, res) => {
  try {
    // const userId = req.user.userId; // Extract userId from the token's decoded data

    // Find the primary user by ID
    // const users = await User.find({ status: "Active", isDeleted: false });
    const users = (await User.find({ status: "Active", isDeleted: false })).reverse();

    // Send the response including the user and their full family tree
    res.status(200).json({
      message: "Active User details retrieved successfully",
      users
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

module.exports = {
  createAdmin,
  adminLogin,
  getAdmins,
  getUserDetailsById,
  getAllUsers,
  deleteMember,
  adminLogout,
  qrScanDetails,
  getAllActiveUsers
};
