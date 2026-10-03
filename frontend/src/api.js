import axios from 'axios';

// Hna kat-7et l-lien d Render wa7ed marra safi!
const API = axios.create({
  baseURL: 'https://alugestion.onrender.com',
});

export default API;