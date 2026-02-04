import axios from "axios";
import { config } from "../../utils/axiosconfig";
import { base_url } from "../../utils/baseUrl";

// const getTokenFromLocalStorage = localStorage.get("user")
//   ? JSON.parse(localStorage.getItem("user"))
//   : null;

const login = async (user) => {
  const response = await axios.post(
    `${base_url}user/admin-login`,
    user,
    { withCredentials: true }
  );
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};
const getConfig = () => {
  const getTokenFromLocalStorage = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  return {
    headers: {
      Authorization: `Bearer ${
        getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""
      }`,
      Accept: "application/json",
    },
  };
};

const getOrders = async (data) => {
  const response = await axios.get(`${base_url}user/getallorders`, getConfig());

  return response.data;
};
const getOrder = async (id) => {
  const response = await axios.get(
    `${base_url}user/getaOrder/${id}`,

    getConfig()
  );

  return response.data;
};

const updateOrder = async (data) => {
  const response = await axios.put(
    `${base_url}user/updateOrder/${data.id}`,
    { status: data.status },
    getConfig()
  );

  return response.data;
};

const getMonthlyOrders = async (data) => {
  const response = await axios.get(
    `${base_url}user/getMonthWiseOrderIncome`,

    getConfig()
  );

  return response.data;
};

const getYearlyStats = async (data) => {
  const response = await axios.get(
    `${base_url}user/getyearlyorders`,

    getConfig()
  );

  return response.data;
};

const authService = {
  login,
  getOrders,
  getOrder,
  getMonthlyOrders,
  getYearlyStats,
  updateOrder,
};

export default authService;
