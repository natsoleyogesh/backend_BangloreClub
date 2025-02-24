// const mongoose = require("mongoose");

// const permissionSchema = new mongoose.Schema({
//     menuName: { type: String, required: true }, // e.g., "Masters"
//     subMenus: [
//         {
//             name: { type: String, required: true }, // e.g., "Departments"
//             canView: { type: Boolean, default: false }, // Permission to view
//             canEdit: { type: Boolean, default: false }, // Permission to edit
//             canDelete: { type: Boolean, default: false }, // Permission to delete
//             canAdd: { type: Boolean, default: false }, // Permission to add
//         },
//     ],
//     description: { type: String }, // Optional description
//     status: { type: Boolean, default: true }, // Role activation status
// });

// const Permission = mongoose.model("Permission", permissionSchema);
// module.exports = Permission;


const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        role: {
            type: mongoose.Schema.Types.ObjectId, // Reference to the Role schema
            ref: "Role",
            required: true,
        },
        menuName: { type: String, required: true }, // Main menu name, e.g., "Masters", "Billings"
        subMenus: [
            {
                name: { type: String, required: true }, // Submenu name, e.g., "Departments", "Invoices"
                canView: { type: Boolean, default: false }, // View permission
                canEdit: { type: Boolean, default: false }, // Edit permission
                canDelete: { type: Boolean, default: false }, // Delete permission
                canAdd: { type: Boolean, default: false }, // Add permission
            },
        ],
        status: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true } // Adds createdAt and updatedAt timestamps
);

const Permission = mongoose.model("Permission", permissionSchema);
module.exports = Permission;
