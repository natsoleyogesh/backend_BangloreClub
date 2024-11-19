const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/common");
const User = require("../models/user");


// Create a new admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
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
      age: member.age,
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
    const userId = req.params.userId; // Extract userId from the token's decoded data

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
        relation: user.relation,
        parentUserId: user.parentUserId,
        age: user.age,
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
    const users = await User.find({});
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


module.exports = {
  createAdmin,
  adminLogin,
  getAdmins,
  getUserDetailsById,
  getAllUsers,
  deleteMember
};
