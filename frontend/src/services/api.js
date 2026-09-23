import axios from "./axios";


// ======================================================
// AUTH APIs
// ======================================================

export const registerUser = async (userData) => {
  const response = await axios.post(
    "/user/register",
    userData
  );

  return response.data;
};


export const loginUser = async (loginData) => {
  const response = await axios.post(
    "/user/login",
    loginData
  );

  return response.data;
};


// ======================================================
// ADMIN APIs
// ======================================================

export const getAdminDashboard = async () => {
  const response = await axios.get(
    "/admin/dashboard"
  );

  return response.data;
};


export const getAdminProfile = async () => {
  const response = await axios.get(
    "/admin/profile"
  );

  return response.data;
};


export const getAdminRequests = async () => {
  const response = await axios.get(
    "/admin/requests"
  );

  return response.data;
};


// ======================================================
// DEPARTMENT APIs
// ======================================================

export const getAllDepartments = async () => {
  const response = await axios.get(
    "/department/getAllDepartments"
  );

  return response.data;
};


// ======================================================
// CATEGORY APIs
// ======================================================

export const getCategoriesByDepartment = async (
  departmentId
) => {
  const response = await axios.get(
    `/category/getCategoryByDepartmentId/${departmentId}`
  );

  return response.data;
};


// ======================================================
// PRODUCT APIs
// ======================================================

export const raiseRequest = async (productData) => {
  const response = await axios.post(
    "/product/raiseRequest",
    productData
  );

  return response.data;
};


export const getAllProducts = async () => {
  const response = await axios.get(
    "/product/getAllProducts"
  );

  return response.data;
};


export const getProductById = async (id) => {
  const response = await axios.get(
    `/product/${id}`
  );

  return response.data;
};


// ======================================================
// PRODUCT APPROVAL APIs
// ======================================================

export const productDecision = async (
  id,
  action
) => {
  const response = await axios.put(
    `/product/decision/${id}`,
    {
      action: action,
    }
  );

  return response.data;
};


// ======================================================
// SUPPLIER APIs
// ======================================================

export const getSuppliers = async () => {
  const response = await axios.get(
    "/supplier"
  );

  return response.data;
};


export const getSupplierById = async (id) => {
  const response = await axios.get(
    `/supplier/${id}`
  );

  return response.data;
};


export const addSupplier = async (supplierData) => {
  const response = await axios.post(
    "/supplier",
    supplierData
  );

  return response.data;
};


export const updateSupplier = async (
  id,
  supplierData
) => {
  const response = await axios.put(
    `/supplier/${id}`,
    supplierData
  );

  return response.data;
};


export const deleteSupplier = async (id) => {
  const response = await axios.delete(
    `/supplier/${id}`
  );

  return response.data;
};


export const updateSupplierStatus = async (
  id,
  status
) => {
  const response = await axios.put(
    `/supplier/${id}/status`,
    {
      status: status,
    }
  );

  return response.data;
};


// ======================================================
// PAYMENT APIs
// ======================================================

export const createPayment = async (
  paymentData
) => {
  const response = await axios.post(
    "/payment",
    paymentData
  );

  return response.data;
};


export const getPayments = async () => {
  const response = await axios.get(
    "/payment"
  );

  return response.data;
};


// ======================================================
// CSB / CSV REPORT
// ======================================================

export const downloadCSBReport = async (
  userId
) => {
  const response = await axios.get(
    `/payment/csb/${userId}`,
    {
      responseType: "blob",
    }
  );

  return response;
};


// ======================================================
// PRODUCT RATING APIs
// ======================================================

export const addProductRating = async (
  ratingData
) => {
  const response = await axios.post(
    "/product-rating",
    ratingData
  );

  return response.data;
};


export const getProductRatings = async () => {
  const response = await axios.get(
    "/product-rating"
  );

  return response.data;
};


// ======================================================
// ACCOUNT APIs
// ======================================================

export const createAccount = async (
  accountData
) => {
  const response = await axios.post(
    "/account",
    accountData
  );

  return response.data;
};


export const getAccounts = async () => {
  const response = await axios.get(
    "/account"
  );

  return response.data;
};


export const updateAccount = async (
  id,
  accountData
) => {
  const response = await axios.put(
    `/account/${id}`,
    accountData
  );

  return response.data;
};


export const deleteAccount = async (id) => {
  const response = await axios.delete(
    `/account/${id}`
  );

  return response.data;
};

export const getMyRequests = async () => {
  const response = await axios.get("/product/getAllProducts");
  return response.data;
};