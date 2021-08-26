require('dotenv/config')
const Discord = require("discord.js");
const client = new Discord.Client();

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { commands } = require("./src/commands");
puppeteer.use(StealthPlugin());


async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    'args' : [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
  });

  const page = await browser.newPage();

  // Add adblocker plugin to block all ads and trackers (saves bandwidth)
  const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

  const cookies = [
    {
      name: "ATERNOS_SESSION",
      value:
        "Dp9vS6lRruxwawuON6ZtUTjmXykfzjuD27xRV1zrJym24ZnZaapVorzq1gLi5YePIjb6XU6nNSNIKIC30GiqwYgYd4D49cRFOu6Q",
    },
  ];

  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  await page.setUserAgent(userAgent);

  await page.goto("https://aternos.org/server/", {
    waitUntil: "networkidle2",
  });

  await page.setCookie(...cookies);
  //   await page.reload();

  await page.click(".create-btn");

  let server, playersNumber, playersMax;

  async function check() {
    await page.waitForSelector(".servers .server-name");
    let element = await page.$(".server-name");
    let value = await page.evaluate((el) => el.textContent, element);

    const servers = await page.evaluate(() => {
      const els = Array.from(
        document.querySelectorAll(".server"),
        (element) => {
          return {
            test: element.classList,
            name: element.textContent,
            isOnline: element.classList.contains("online"),
            isLoading: element.classList.contains("loading"),
            players: element.querySelector(".statusplayerbadge").textContent,
          };
        }
      );

      return els;
    });

    server = servers[1];

    playersNumber = server.players.split("/")[0];
    playersMax = server.players.split("/")[1];

    return {
      server,
      playersNumber,
      playersMax,
    };
  }




  const prefix = "bot";

  client.on("message", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const command = commandBody.trim();

    try {
      const { server, playersNumber, playersMax } = await check();

      commands(message, server, command, playersNumber, playersMax);
    } catch (err) {
      return err;
    }
  });



  client.on("ready", (msg) => {
    console.log("msg :>> ", msg);
  });

  client.login(process.env.BOT_TOKEN);
}

console.log('process.env.BOT_TOKEN :>> ', process.env.BOT_TOKEN);

main();
