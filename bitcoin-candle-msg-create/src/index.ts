import { config } from "dotenv";
import axios from "axios";
import Period from "./enums/period";
import Candle from "./models/Candle";
import { createMessageChannel } from "./messages/messageChannet";

config();

export const readMarketPrice = async (): Promise<number> => {
  const urlBiticon = process.env.PRICES_API;
  if (urlBiticon) {
    const { data } = await axios.get(urlBiticon);
    return data.bitcoin.usd;
  }
  return 0;
};

const generateCandles = async () => {
  const messageChannel = await createMessageChannel();

  if (messageChannel) {
    while (true) {
      const loopTimes = Period.FIVE_MINUTES / Period.TEN_SECONDS;
      const candle = new Candle("BTC");

      console.log("---------------------------------------");
      console.log("Generating new candle");

      for (let i = 0; i < loopTimes; i++) {
        const price = await readMarketPrice();
        candle.addValue(price);
        console.log(`Market price #${i + 1} of ${loopTimes}`);
        await new Promise((r) => setTimeout(r, Period.TEN_SECONDS));
      }

      candle.closeCandle();
      console.log("Candle close");
      const candleObj = candle.toSimpleObject();
      console.log(candleObj);
      const candleJson = JSON.stringify(candleObj);
      messageChannel.sendToQueue(
        process.env.QUEUE_NAME,
        Buffer.from(candleJson)
      );
      console.log("Candle sent to queue");
    }
  }
};

generateCandles();
