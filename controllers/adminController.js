const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/common");
const User = require("../models/user");
const { logAction, logActivity } = require("./commonController");
const sendEmail = require("../utils/sendMail");
const emailTemplates = require("../utils/emailTemplates");
const { otpRenderTemplate } = require("../utils/templateRenderer");


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

    const templateData = {
      name: admin.name,
      email: admin.email,
      password: password
    }

    const emailTemplate = emailTemplates.createAdminTemplate;
    const htmlBody = otpRenderTemplate(emailTemplate.body, templateData);
    const subject = otpRenderTemplate(emailTemplate.subject, templateData);

    await sendEmail(admin.email, subject, htmlBody);

    return res
      .status(201)
      .json({ success: true, message: "Admin created successfully", admin });
  } catch (error) {
    console.error("Error creating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating admin",
      error: error.message,
    });
  }
};

// // Admin login
// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Validate required fields
//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email and password are required" });
//     }

//     // Find admin by email
//     const admin = await Admin.findOne({ email }).populate("role");
//     if (!admin) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid email or password" });
//     }

//     // Check if password matches
//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid email or password" });
//     }

//     // Check if the account is active
//     if (admin.isDeleted) {
//       return res
//         .status(403)
//         .json({ success: false, message: "Account is deactivated" });
//     }

//     // Update last login timestamp
//     admin.lastLogin = new Date();
//     await admin.save();
//     // Generate token
//     const tokenData = {
//       userId: admin._id,
//       email: admin.email,
//       role: admin.role.name,
//       roleId: admin.role._id
//     };
//     const token = generateToken(tokenData);

//     // Set token in response headers
//     res.setHeader('Authorization', `Bearer ${token}`);
//     console.log(req.ip, "fdhffdjh")
//     // Log the login action
//     const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     await logAction({
//       userId: admin._id,
//       userType: "Admin",
//       action: "login",
//       role: admin.role.name,
//       ipAddress: ip,
//       userAgent: req.headers["user-agent"],
//     });


//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: admin._id,
//         name: admin.name,
//         email: admin.email,
//         role: admin.role.name,
//         roleId: admin.role._id,
//         lastLogin: admin.lastLogin,
//       },
//     });
//   } catch (error) {
//     console.error("Error logging in admin:", error);
//     res
//       .status(500)
//       .json({ message: "Error logging in admin", error: error.message });
//   }
// };


const otpStore = new Map(); // Temporary OTP storage

// ✅ Step 1: Admin Login API (Checks Email/Password & Sends OTP)
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email }).populate("role");
    if (!admin) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (admin.isDeleted) {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    // ✅ Generate OTP (Valid for 60 seconds)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expiresAt: Date.now() + 60 * 1000 });

    const templateData = {
      otp: otp
    }

    const emailTemplate = emailTemplates.otpTemplate;
    const htmlBody = otpRenderTemplate(emailTemplate.body, templateData);
    const subject = otpRenderTemplate(emailTemplate.subject, templateData);

    // // ✅ Send OTP via email
    // await sendEmail({
    //   to: email,
    //   subject: "Your OTP for Admin Login",
    //   text: `Your OTP code is: ${otp}. This code is valid for 60 seconds.`,
    // });

    // Send OTP via Email
    await sendEmail(email, subject, htmlBody);


    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify within 60 seconds.",
    });

  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ success: false, message: "Error logging in admin", error: error.message });
  }
};

// ✅ Step 2: Verify OTP & Complete Login
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }

    if (storedOtpData.expiresAt < Date.now()) {
      otpStore.delete(email); // Remove expired OTP
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new OTP." });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    otpStore.delete(email); // ✅ OTP Verified, remove from store

    const admin = await Admin.findOne({ email }).populate("role");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const tokenData = {
      userId: admin._id,
      email: admin.email,
      role: admin.role.name,
      roleId: admin.role._id,
    };
    const token = generateToken(tokenData);

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await logAction({
      userId: admin._id,
      userType: "Admin",
      action: "login",
      role: admin.role.name,
      ipAddress: req.userIp,// ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({
      success: true,
      message: "OTP verified, login successful",
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role.name,
        roleId: admin.role._id,
        lastLogin: admin.lastLogin,
      },
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP", error: error.message });
  }
};

// ✅ Resend OTP API
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const storedOtpData = otpStore.get(email);

    // Check if previous OTP exists & is still valid
    if (storedOtpData && storedOtpData.expiresAt > Date.now()) {
      return res.status(400).json({ success: false, message: "Please wait before requesting a new OTP." });
    }

    // ✅ Generate new 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp: newOtp, expiresAt: Date.now() + 60 * 1000 });

    const templateData = {
      otp: newOtp
    }

    const emailTemplate = emailTemplates.otpTemplate;
    const htmlBody = otpRenderTemplate(emailTemplate.body, templateData);
    const subject = otpRenderTemplate(emailTemplate.subject, templateData);

    // // ✅ Send OTP via email
    // await sendEmail({
    //   to: email,
    //   subject: "Your OTP for Admin Login",
    //   text: `Your OTP code is: ${otp}. This code is valid for 60 seconds.`,
    // });

    // Send OTP via Email
    await sendEmail(email, subject, htmlBody);


    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify within 60 seconds.",
    });

  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ success: false, message: "Error resending OTP", error: error.message });
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

// Get all admins
const getAdminDetails = async (req, res) => {
  const { userId } = req.user;
  try {

    const admin = await Admin.findById(userId).select("-password");
    return res.status(200).json({ message: "Admin Details", admin });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return res
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
      email2: member.email2,
      mobileNumber2: member.mobileNumber2,
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
      vehicleNumber: member.vehicleNumber,
      vehicleModel: member.vehicleModel,
      drivingLicenceNumber: member.drivingLicenceNumber,
      uploadProofs: member.uploadProofs,
      qrCodeId: member.qrCodeId,
      cardId: member.cardId,
      qrGenratedDate: member.qrGenratedDate,
      qrCode: member.qrCode,
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
        email2: user.email2,
        mobileNumber2: user.mobileNumber2,
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
        vehicleNumber: user.vehicleNumber,
        vehicleModel: user.vehicleModel,
        drivingLicenceNumber: user.drivingLicenceNumber,
        creditLimit: user.creditLimit,
        creditStop: user.creditStop,
        uploadProofs: user.uploadProofs,
        qrCodeId: user.qrCodeId,
        cardId: user.cardId,
        qrGenratedDate: user.qrGenratedDate,
        qrCode: user.qrCode,
        familyMembers, // Nested family members
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};

// const getAllUsers = async (req, res) => {
//   try {
//     const users = (await User.find({ relation: "Primary" })).reverse();
//     // Send the response including the user and their full family tree
//     res.status(200).json({
//       message: "User details retrieved successfully",
//       users
//     });
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ message: "Error fetching user details", error: error.message });
//   }
// };

const getAllUsers = async (req, res) => {
  try {
    let { page, limit } = req.query;

    // Convert query parameters to numbers, set defaults if not provided
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10; // Default limit: 10 users per page

    // Calculate the number of users to skip
    const skip = (page - 1) * limit;

    // Fetch total number of users
    const totalUsers = await User.countDocuments({ relation: "Primary" });

    // Fetch paginated users
    const users = await User.find({ relation: "Primary" })
      .sort({ createdAt: -1 }) // Reverse order
      .skip(skip)
      .limit(limit);

    // Calculate total pages
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      message: "User details retrieved successfully",
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        pageSize: limit,
      }
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
      ipAddress: req.userIp, // ip,
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
      ipAddress: req.userIp, // ip,
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


// const getUsers = async (req, res) => {
//   try {
//     const users = (await User.find()).reverse();
//     // Send the response including the user and their full family tree
//     res.status(200).json({
//       message: "User details retrieved successfully",
//       users
//     });
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     res.status(500).json({ message: "Error fetching user details", error: error.message });
//   }
// };

const getUsers = async (req, res) => {
  try {
    const { relation, search, page, limit } = req.query;

    // Convert pagination parameters
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10; // Default limit is 10
    const skip = (pageNumber - 1) * limitNumber;

    // Build search query
    let query = {};
    if (relation) {
      query.relation = relation; // Always include relation filter
    }
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } }, // Case-insensitive search in `name`
          { memberId: { $regex: search, $options: "i" } } // Case-insensitive search in `memberId`
        ],
      };
    }

    // Get total count of users based on the search
    const totalUsers = await User.countDocuments(query);

    // Fetch paginated & filtered users
    const users = await User.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber);

    // Send the response including pagination info
    res.status(200).json({
      message: "User details retrieved successfully",
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        pageSize: limitNumber,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};


// Update an existing admin
const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    // Check if admin exists
    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if email is already used by another admin
    if (email && email !== admin.email) {
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: "Email already in use by another admin",
        });
      }
      admin.email = email;
    }

    // Update fields if provided
    if (name) admin.name = name;
    if (role) admin.role = role;

    // Hash new password if provided
    if (password) {
      admin.password = await bcrypt.hash(password, 10);
    }

    await admin.save();
    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({
      success: false,
      message: "Error updating admin",
      error: error.message,
    });
  }
};


// Get admin by ID
const getAdminById = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id).select("-password").populate("role");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin,
    });
  } catch (error) {
    console.error("Error fetching admin:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin",
      error: error.message,
    });
  }
};


// Get all admins except the current admin
const getAllAdmins = async (req, res) => {
  try {
    const currentAdminId = req.user.userId;
    const admins = await Admin.find({ _id: { $ne: currentAdminId } }).select("-password").populate("role");

    res.status(200).json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admins",
      error: error.message,
    });
  }
};


const getAdminsSearch = async (req, res) => {
  try {
    const { search, page, limit } = req.query;

    // Convert pagination parameters
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10; // Default limit is 10
    const skip = (pageNumber - 1) * limitNumber;

    // Build search query
    let query = { isDeleted: false };
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } }, // Case-insensitive search in `name`
          { email: { $regex: search, $options: "i" } } // Case-insensitive search in `email`
        ],
      };
    }

    // Get total count of users based on the search
    const totalUsers = await Admin.countDocuments(query);

    // Fetch paginated & filtered users
    const users = await Admin.find(query)
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limitNumber);

    // Send the response including pagination info
    res.status(200).json({
      message: "Admin details retrieved successfully",
      users,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalUsers / limitNumber),
        totalUsers,
        pageSize: limitNumber,
      },
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
  getAllActiveUsers,

  getAdminDetails,
  getUsers,


  updateAdmin,
  getAdminById,
  getAllAdmins,
  getAdminsSearch,

  verifyOtp,
  resendOtp
};
