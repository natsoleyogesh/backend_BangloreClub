const {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    getActiveDepartments
} = require("../../controllers/masterController/departmentController");

module.exports = (router) => {
    router.post("/department", createDepartment);
    router.get("/departments", getAllDepartments);
    router.get("/department/:id", getDepartmentById);
    router.put("/department/:id", updateDepartment);
    router.delete("/department/:id", deleteDepartment);
    router.get("/active-departments", getActiveDepartments)
};
