import axios from "axios";

const csrf = document.querySelector("meta[name='csrf-token']")?.getAttribute("content");

const axiosInstance = axios.create({
  withCredentials: true,
});

axiosInstance.defaults.headers.common = {
  ...axiosInstance.defaults.headers.common,
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

axiosInstance.defaults.headers.post['X-CSRF-Token'] = csrf;

// const handleNormalResponse = (res) => {
//   return res;
// }

// const handleErrorResponse = (res) => {
//   if (res.status == 401) {
//     const newResponse = axios.request(res.config);

//     return newResponse;
//   }
//   return Promise.reject(res);;
// }
// axios.interceptors.response.use(handleNormalResponse, handleErrorResponse)

export default axiosInstance;
