import e from "express";
import {
	newFabric,
	fetchFabric,
	updatefabric,
	deleteFabric,
	avaliableFabric,
	premiumFabric,
	qualityFabric,
} from "../controller/fabric api controller.js";
import {
	createNewStaff,
	loginStaff,
} from "../controller/staff user api controller.js";
import {
	createNewCustomer,
	loginCustomer,
	refreshCustomerToken,
	logoutCustomer,
	getCustomerProfile,
	updateCustomerProfile,
	changeCustomerPassword,
} from "../controller/customer api controller.js";
import {
	authenticateStaff,
	authorizeStaffRegistration,
	authorizeStaffRoles,
} from "../middleware/staffAuth.js";
import {
	authenticateCustomer,
	optionalCustomerAuth,
} from "../middleware/customerAuth.js";

const router = e.Router();

router.route("/new").post(
	authenticateStaff,
	authorizeStaffRoles("manager"),
	newFabric,
);
router.route("/all").get(optionalCustomerAuth, fetchFabric);
router.route("/available").get(optionalCustomerAuth, avaliableFabric);
router.route("/premium").get(authenticateCustomer, premiumFabric);
router.route("/quality").get(qualityFabric);

router.route("/update/:id").put(
	authenticateStaff,
	authorizeStaffRoles("manager", "cashier"),
	updatefabric,
);

router.route("/delete/:id").delete(
	authenticateStaff,
	authorizeStaffRoles("manager"),
	deleteFabric,
);

router.route("/staff/reg").post(authorizeStaffRegistration, createNewStaff);
router.route("/staff/login").post(loginStaff);

router.route("/customer/new").post(createNewCustomer);
router.route("/customer/login").post(loginCustomer);
router.route("/customer/refresh").post(refreshCustomerToken);
router.route("/customer/logout").post(logoutCustomer);
router.route("/auth/logout").post(logoutCustomer);
router.route("/customer/profile").get(authenticateCustomer, getCustomerProfile).patch(authenticateCustomer, updateCustomerProfile).put(authenticateCustomer, updateCustomerProfile);
router.route("/customer/me").get(authenticateCustomer, getCustomerProfile).patch(authenticateCustomer, updateCustomerProfile).put(authenticateCustomer, updateCustomerProfile);
router.route("/customer/me/password").patch(authenticateCustomer, changeCustomerPassword);
export default router;
