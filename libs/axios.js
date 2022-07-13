import Axios from 'axios'
//const BASE_URL = 'http://localhost:8000'
const BASE_URL  =  'https://starcode-nest-starter.herokuapp.com'


export default Axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

export const axiosPrivate = Axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})
