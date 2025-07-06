import axios from "axios";

const API_KEY = "480239edb53a4b9f9e436fcef5effa45";
const BASE_URL = "https://api.twelvedata.com";

export async function getQuote(symbol: string) {
  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol,
        apikey: API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching data from TwelveData:", error);
    return null;
  }
}