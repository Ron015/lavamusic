const Discord = require("discord.js");
const {
  Client,
  Collection,
  MessageEmbed,
  MessageAttachment,
  MessageButton,
  MessageActionRow
} = require("discord.js");
const emoji = require(`${process.cwd()}/botconfig/emojis.json`);
const config = require(`${process.cwd()}/botconfig/config.json`);
const settings = require(`${process.cwd()}/botconfig/settings.json`);
const ee = require(`${process.cwd()}/botconfig/embed.json`);
const radios = require("../botconfig/radiostations.json");
const ms = require("ms")
const moment = require("moment")
const fs = require('fs')

module.exports.handlemsg = handlemsg;
module.exports.nFormatter = nFormatter;
module.exports.databasing = databasing;
module.exports.shuffle = shuffle;
module.exports.delay = delay;
module.exports.duration = duration;
module.exports.createBar = createBar;
module.exports.format = format;
module.exports.stations = stations;
module.exports.swap_pages2 = swap_pages2;
module.exports.swap_pages2_interaction = swap_pages2_interaction;
module.exports.swap_pages = swap_pages;
module.exports.escapeRegex = escapeRegex;
module.exports.autoplay = autoplay;
module.exports.arrayMove = arrayMove;
module.exports.isValidURL = isValidURL;
module.exports.check_if_dj = check_if_dj;

function check_if_dj(client, member, song) {
  //if no message added return
  if (!client) return false;
  var roleid = client.settings.get(member.guild.id, `djroles`)
  if (String(roleid) == "") return false;
  var isdj = false;
  for (const djRole of roleid) {
    if (!member.guild.roles.cache.get(djRole)) {
      client.settings.remove(message.guild.id, djRole, `djroles`)
      continue;
    }
    if (member.roles.cache.has(djRole)) isdj = true;
  }
  if (!isdj && !member.permissions.has("ADMINISTRATOR") && song?.requester?.id != member.id)
    return roleid.map(i => `<@&${i}>`).join(", ");
  else
    return false;
}

function handlemsg(txt, options) {
  let text = String(txt);
  for (const option in options) {
    var toreplace = new RegExp(`{${option.toLowerCase()}}`, "ig");
    text = text.replace(toreplace, options[option]);
  }
  return text;
}

function isValidURL(string) {
  const args = string.split(" ");
  let url;
  for (const arg of args) {
    try {
      url = new URL(arg);
      url = url.protocol === "http:" || url.protocol === "https:";
      break;
    } catch (_) {
      url = false;
    }
  }
  return url;
};

function shuffle(a) {
  try {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
    }
    return a;
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}


function duration(duration, useMilli = false) {
  let remain = duration;
  let days = Math.floor(remain / (1000 * 60 * 60 * 24));
  remain = remain % (1000 * 60 * 60 * 24);
  let hours = Math.floor(remain / (1000 * 60 * 60));
  remain = remain % (1000 * 60 * 60);
  let minutes = Math.floor(remain / (1000 * 60));
  remain = remain % (1000 * 60);
  let seconds = Math.floor(remain / (1000));
  remain = remain % (1000);
  let milliseconds = remain;
  let time = {
    days,
    hours,
    minutes,
    seconds,
    milliseconds
  };
  let parts = []
  if (time.days) {
    let ret = time.days + ' Day'
    if (time.days !== 1) {
      ret += 's'
    }
    parts.push(ret)
  }
  if (time.hours) {
    let ret = time.hours + ' Hr'
    if (time.hours !== 1) {
      ret += 's'
    }
    parts.push(ret)
  }
  if (time.minutes) {
    let ret = time.minutes + ' Min'
    if (time.minutes !== 1) {
      ret += 's'
    }
    parts.push(ret)

  }
  if (time.seconds) {
    let ret = time.seconds + ' Sec'
    if (time.seconds !== 1) {
      ret += 's'
    }
    parts.push(ret)
  }
  if (useMilli && time.milliseconds) {
    let ret = time.milliseconds + ' ms'
    parts.push(ret)
  }
  if (parts.length === 0) {
    return ['instantly']
  } else {
    return parts
  }
}

function delay(delayInms) {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, delayInms);
    });
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}

function createBar(player) {
  let { size, line, slider, leftindicator, rightindicator, style } = emoji.msg.progress_bar;
  if(style == "simple") {
    //player.queue.current.duration == 0 ? player.position : player.queue.current.duration, player.position, 25, "▬", "🔷")
    if (!player.queue.current) return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
    let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
    let total = player.queue.current.duration;

    let bar = current > total ? [line.repeat(size / 2 * 2), (current / total) * 100] : [line.repeat(Math.round(size / 2 * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];
    if (!String(bar).includes(slider)) return `**${leftindicator}${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
    return `**${leftindicator}${bar[0]}${rightindicator}**\n**${new Date(player.position).toISOString().substr(11, 8)+" / "+(player.queue.current.duration==0?" ◉ LIVE":new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
  } else {
    try {
      if (!player.queue.current) return `**${emoji.msg.progress_bar.empty_left}${emoji.msg.progress_bar.filledframe}${emoji.msg.progress_bar.emptyframe.repeat(size - 1)}${emoji.msg.progress_bar.empty_right}**\n**00:00:00 / 00:00:00**`;
      let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
      let total = player.queue.current.duration;
      size -= 10;
      let rightside = size - Math.round(size * (current / total));
      let leftside = Math.round(size * (current / total));
      let bar;
      if (leftside < 1) bar = String(emoji.msg.progress_bar.empty_left) + String(emoji.msg.progress_bar.emptyframe).repeat(rightside) + String(emoji.msg.progress_bar.empty_right);
      else bar = String(emoji.msg.progress_bar.filled_left) + String(emoji.msg.progress_bar.filledframe).repeat(leftside) + String(emoji.msg.progress_bar.emptyframe).repeat(rightside) + String(size - rightside !== 1 ? emoji.msg.progress_bar.empty_right : emoji.msg.progress_bar.filled_right);
      return `**${bar}**\n**${new Date(player.position).toISOString().substr(11, 8)+" / "+(player.queue.current.duration==0?" ◉ LIVE":new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
    } catch (e) {
      //if problem, then redo with the new size
      if (!player.queue.current) return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
      let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
      let total = player.queue.current.duration;

      let bar = current > total ? [line.repeat(size / 2 * 2), (current / total) * 100] : [line.repeat(Math.round(size / 2 * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];
      if (!String(bar).includes(slider)) return `**${leftindicator}${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
      return `**${leftindicator}${bar[0]}${rightindicator}**\n**${new Date(player.position).toISOString().substr(11, 8)+" / "+(player.queue.current.duration==0?" ◉ LIVE":new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
    }
  }
}


function format(millis) {
  try {
    var h = Math.floor(millis / 3600000),
      m = Math.floor(millis / 60000),
      s = ((millis % 60000) / 1000).toFixed(0);
    if (h < 1) return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + " | " + (Math.floor(millis / 1000)) + " Seconds";
    else return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s + " | " + (Math.floor(millis / 1000)) + " Seconds";
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}

function stations(client, prefix, message) {
  let es = client.settings.get(message.guild.id, "embed");
  let ls = client.settings.get(message.guild.id, "language");


  try {
    let amount = 0;
    const stationsembed = new MessageEmbed().setColor(es.color).setThumbnail(es.thumb ? es.footericon : null).setFooter(es.footertext, es.footericon)
      .setTitle(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable4"]))
      .setDescription(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable4_1"]))
    const stationsembed2 = new MessageEmbed().setColor(es.color).setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
      .setTitle(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable5"]))
      .setDescription(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable5_1"]))
    const stationsembed3 = new MessageEmbed().setColor(es.color).setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
      .setTitle(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable6"]))
      .setDescription(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable6_1"]))
    let United_Kingdom = "";
    for (let i = 0; i < radios.EU.United_Kingdom.length; i++) {
      United_Kingdom += `**${i + 1 + 10 * amount}**[${radios.EU.United_Kingdom[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.United_Kingdom[i].split(" ")[1]})\n`;
    }
    stationsembed.addField("🇬🇧 United Kingdom", `>>> ${United_Kingdom}`, true);
    amount++;
    let austria = "";
    for (let i = 0; i < radios.EU.Austria.length; i++) {
      austria += `**${i + 1 + 10 * amount}**[${radios.EU.Austria[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Austria[i].split(" ")[1]})\n`;
    }
    stationsembed.addField("🇦🇹 Austria", `>>> ${austria}`, true);
    amount++;
    let Belgium = "";
    for (let i = 0; i < radios.EU.Belgium.length; i++) {
      Belgium += `**${i + 1 + 10 * amount}**[${radios.EU.Belgium[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Belgium[i].split(" ")[1]})\n`;
    }
    stationsembed.addField("🇧🇪 Belgium", `>>> ${Belgium}`, true);
    amount++;
    let Bosnia = "";
    for (let i = 0; i < radios.EU.Bosnia.length; i++) {
      Bosnia += `**${i + 1 + 10 * amount}**[${radios.EU.Bosnia[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Bosnia[i].split(" ")[1]})\n`;
    }
    stationsembed.addField("🇧🇦 Bosnia", `>>> ${Bosnia}`, true);
    amount++;
    let Czech = "";
    for (let i = 0; i < radios.EU.Czech.length; i++) {
      Czech += `**${i + 1 + 10 * amount}**[${radios.EU.Czech[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Czech[i].split(" ")[1]})\n`;
    }
    stationsembed.addField("🇨🇿 Czech", `>>> ${Czech}`, true);
    amount++;
    let Denmark = "";
    for (let i = 0; i < radios.EU.Denmark.length; i++) {
      Denmark += `**${i + 1 + 10 * amount}**[${radios.EU.Denmark[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Denmark[i].split(" ")[1]})\n`;
    }
    stationsembed.addField("🇩🇰 Denmark", `>>> ${Denmark}`, true);
    amount++;
    let germany = "";
    for (let i = 0; i < radios.EU.Germany.length; i++) {
      germany += `**${i + 1 + 10 * amount}**[${radios.EU.Germany[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Germany[i].split(" ")[1]})\n`;
    }
    stationsembed2.addField("🇩🇪 Germany", `>>> ${germany}`, true);
    amount++;
    let Hungary = "";
    for (let i = 0; i < radios.EU.Hungary.length; i++) {
      Hungary += `**${i + 1 + 10 * amount}**[${radios.EU.Hungary[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Hungary[i].split(" ")[1]})\n`;
    }
    stationsembed2.addField("🇭🇺 Hungary", `>>> ${Hungary}`, true);
    amount++;
    let Ireland = "";
    for (let i = 0; i < radios.EU.Ireland.length; i++) {
      Ireland += `**${i + 1 + 10 * amount}**[${radios.EU.Ireland[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Ireland[i].split(" ")[1]})\n`;
    }
    stationsembed2.addField("🇮🇪 Ireland", `>>> ${Ireland}`, true);
    amount++;
    let Italy = "";
    for (let i = 0; i < radios.EU.Italy.length; i++) {
      Italy += `**${i + 1 + 10 * amount}**[${radios.EU.Italy[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Italy[i].split(" ")[1]})\n`;
    }
    stationsembed2.addField("🇮🇹 Italy", `>>> ${Italy}`, true);
    amount++;
    let Luxembourg = "";
    for (let i = 0; i < radios.EU.Luxembourg.length; i++) {
      Luxembourg += `**${i + 1 + 10 * amount}**[${radios.EU.Luxembourg[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Luxembourg[i].split(" ")[1]})\n`;
    }
    stationsembed2.addField("🇱🇺 Luxembourg", `>>> ${Luxembourg}`, true);
    amount++;
    let Romania = "";
    for (let i = 0; i < radios.EU.Romania.length; i++) {
      Romania += `**${i + 1 + 10 * amount}**[${radios.EU.Romania[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Romania[i].split(" ")[1]})\n`;
    }
    stationsembed2.addField("🇷🇴 Romania", `>>> ${Romania}`, true);
    amount++;
    let Serbia = "";
    for (let i = 0; i < radios.EU.Serbia.length; i++) {
      Serbia += `**${i + 1 + 10 * amount}**[${radios.EU.Serbia[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Serbia[i].split(" ")[1]})\n`;
    }
    stationsembed3.addField("🇷🇸 Serbia", `>>> ${Serbia}`, true);
    amount++;
    let Spain = "";
    for (let i = 0; i < radios.EU.Spain.length; i++) {
      Spain += `**${i + 1 + 10 * amount}**[${radios.EU.Spain[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Spain[i].split(" ")[1]})\n`;
    }
    stationsembed3.addField("🇪🇸 Spain", `>>> ${Spain}`, true);
    amount++;
    let Sweden = "";
    for (let i = 0; i < radios.EU.Sweden.length; i++) {
      Sweden += `**${i + 1 + 10 * amount}**[${radios.EU.Sweden[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Sweden[i].split(" ")[1]})\n`;
    }
    stationsembed3.addField("🇸🇪 Sweden", `>>> ${Sweden}`, true);
    amount++;
    let Ukraine = "";
    for (let i = 0; i < radios.EU.Ukraine.length; i++) {
      Ukraine += `**${i + 1 + 10 * amount}**[${radios.EU.Ukraine[i].split(" ")[0].replace("-", " ").substr(0, 16)}](${radios.EU.Ukraine[i].split(" ")[1]})\n`;
    }
    stationsembed3.addField("🇺🇦 Ukraine", `>>> ${Ukraine}`, true);
    amount++;
    let requests = "";
    for (let i = 0; i < 10; i++) {
      requests += `**${i + 1 + 10 * amount}**[${radios.OTHERS.request[i].split(" ")[0].replace("-", " ").substr(0, 15)}](${radios.OTHERS.request[i].split(" ")[1]})\n`;
    }
    stationsembed3.addField("🧾 OTHERS", `>>> ${requests}`, true);
    requests = "";
    for (let i = 10; i < 20; i++) {
      try {
        requests += `**${i + 1 + 10 * amount}**[${radios.OTHERS.request[i].split(" ")[0].replace("-", " ").substr(0, 15)}](${radios.OTHERS.request[i].split(" ")[1]})\n`;
      } catch {}
    }
    stationsembed3.addField("🧾 OTHERS", `>>> ${requests}`, true);
    message.channel.send({
      embeds: [stationsembed]
    }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
    message.channel.send({
      embeds: [stationsembed2]
    }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
    message.channel.send({
      embeds: [stationsembed3]
    }).catch(e => console.log(e.stack ? String(e.stack).grey : String(e).grey))
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}

function escapeRegex(str) {
  try {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}

async function autoplay(client, player, type) {
  let es = client.settings.get(player.guild, "embed")
  let ls = client.settings.get(player.guild, "language")
  try {
    if (player.queue.length > 0) return;
    const previoustrack = player.get("previoustrack");
    if (!previoustrack) return;

    const mixURL = `https://www.youtube.com/watch?v=${previoustrack.identifier}&list=RD${previoustrack.identifier}`;
    const response = await client.manager.search(mixURL, previoustrack.requester);
    //if nothing is found, send error message, plus if there  is a delay for the empty QUEUE send error message TOO
    if (!response || response.loadType === 'LOAD_FAILED' || response.loadType !== 'PLAYLIST_LOADED') {
      let embed = new MessageEmbed()
        .setTitle(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable7"]))
        .setDescription(settings.LeaveOnEmpty_Queue.enabled && type != "skip" ? `I'll leave the Channel: \`${client.channels.cache.get(player.voiceChannel).name}\` in: \`${ms(config.settings.LeaveOnEmpty_Queue.time_delay, { long: true })}\`, If the Queue stays Empty! ` : eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable9"]))
        .setColor(es.wrongcolor).setFooter(es.footertext, es.footericon);
      client.channels.cache.get(player.textChannel).send({
        embeds: [embed]
      }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))
      if (settings.LeaveOnEmpty_Queue.enabled && type != "skip") {
        return setTimeout(() => {
          try {
            player = client.manager.players.get(player.guild);
            if (player.queue.size === 0) {
              let embed = new MessageEmbed()
              try {
                embed.setTitle(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable8"]))
              } catch {}
              try {
                embed.setDescription(eval(client.la[ls]["handlers"]["functionsjs"]["functions"]["variable1"]))
              } catch {}
              try {
                embed.setColor(es.wrongcolor)
              } catch {}
              try {
                embed.setFooter(es.footertext, es.footericon);
              } catch {}
              client.channels.cache
                .get(player.textChannel)
                .send({
                  embeds: [embed]
                }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))
              try {
                client.channels.cache
                  .get(player.textChannel)
                  .messages.fetch(player.get("playermessage")).then(async msg => {
                    try {
                      await delay(7500)
                      msg.delete().catch(() => {});
                    } catch {
                      /* */
                    }
                  }).catch(() => {});
              } catch (e) {
                console.log(String(e.stack).grey.yellow);
              }
              player.destroy();
            }
          } catch (e) {
            console.log(String(e.stack).grey.yellow);
          }
        }, settings.LeaveOnEmpty_Queue.time_delay);
      } else {
        player.destroy();
      }
    }
    player.queue.add(response.tracks[Math.floor(Math.random() * Math.floor(response.tracks.length))]);
    return player.play();
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}

function arrayMove(array, from, to) {
  try {
    array = [...array];
    const startIndex = from < 0 ? array.length + from : from;
    if (startIndex >= 0 && startIndex < array.length) {
      const endIndex = to < 0 ? array.length + to : to;
      const [item] = array.splice(from, 1);
      array.splice(endIndex, 0, item);
    }
    return array;
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}

function nFormatter(num, digits = 2) {
  const lookup = [{
      value: 1,
      symbol: ""
    },
    {
      value: 1e3,
      symbol: "k"
    },
    {
      value: 1e6,
      symbol: "M"
    },
    {
      value: 1e9,
      symbol: "G"
    },
    {
      value: 1e12,
      symbol: "T"
    },
    {
      value: 1e15,
      symbol: "P"
    },
    {
      value: 1e18,
      symbol: "E"
    }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

async function swap_pages(client, message, description, TITLE) {
  let es = client.settings.get(message.guild.id, "embed");
  let prefix = client.settings.get(message.guild.id, "prefix");
  let cmduser = message.author;

  /**
   * @INFO
   * Bot Coded by Tomato#6966 | https://discord.gg/milrato
   * @INFO
   * Work for Milrato Development | https://milrato.dev
   * @INFO
   * Please mention him / Milrato Development, when using this Code!
   * @INFO
   */

  let currentPage = 0;
  //GET ALL EMBEDS
  let embeds = [];
  //if input is an array
  if (Array.isArray(description)) {
    try {
      let k = 20;
      for (let i = 0; i < description.length; i += 20) {
        const current = description.slice(i, k);
        k += 20;
        const embed = new MessageEmbed()
          .setDescription(current.join("\n"))
          .setTitle(TITLE)
          .setColor(es.color).setThumbnail(es.thumb ? es.footericon : null)
          .setFooter(es.footertext, es.footericon)
        embeds.push(embed);
      }
      embeds;
    } catch (e) {
      console.log(e.stack ? String(e.stack).grey : String(e).grey)
    }
  } else {
    try {
      let k = 1000;
      for (let i = 0; i < description.length; i += 1000) {
        const current = description.slice(i, k);
        k += 1000;
        const embed = new MessageEmbed()
          .setDescription(current)
          .setTitle(TITLE)
          .setColor(es.color).setThumbnail(es.thumb ? es.footericon : null)
          .setFooter(es.footertext, es.footericon)
        embeds.push(embed);
      }
      embeds;
    } catch (e) {
      console.log(e.stack ? String(e.stack).grey : String(e).grey)
    }
  }
  if (embeds.length === 0) return message.channel.send({
    embeds: [new MessageEmbed()
      .setTitle(`${emoji.msg.ERROR} No Content added to the SWAP PAGES Function`)
      .setColor(es.wrongcolor).setThumbnail(es.thumb ? es.footericon : null)
      .setFooter(es.footertext, es.footericon)
    ]
  }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))
  if (embeds.length === 1) return message.channel.send({
    embeds: [embeds[0]]
  }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))

  let button_back = new MessageButton().setStyle('SUCCESS').setCustomId('1').setEmoji("833802907509719130").setLabel("Back")
  let button_home = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji("🏠").setLabel("Home")
  let button_forward = new MessageButton().setStyle('SUCCESS').setCustomId('3').setEmoji('832598861813776394').setLabel("Forward")
  const allbuttons = [new MessageActionRow().addComponents([button_back, button_home, button_forward])]
  //Send message with buttons
  let swapmsg = await message.channel.send({
    content: `***Click on the __Buttons__ to swap the Pages***`,
    embeds: [embeds[0]],
    components: allbuttons
  });
  //create a collector for the thinggy
  const collector = swapmsg.createMessageComponentCollector({
    filter: (i) => i.isButton() && i.user && i.user.id == cmduser.id && i.message.author.id == client.user.id,
    time: 180e3
  }); //collector for 5 seconds
  //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
  collector.on('collect', async b => {
    if (b.user.id !== message.author.id)
      return b.reply({
        content: `❌ **Only the one who typed ${prefix}help is allowed to react!**`,
        ephemeral: true
      })
    //page forward
    if (b.customId == "1") {
      //b.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage !== 0) {
        currentPage -= 1
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      } else {
        currentPage = embeds.length - 1
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      }
    }
    //go home
    else if (b.customId == "2") {
      //b.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
      currentPage = 0;
      await swapmsg.edit({
        embeds: [embeds[currentPage]],
        components: allbuttons
      });
      await b.deferUpdate();
    }
    //go forward
    else if (b.customId == "3") {
      //b.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage < embeds.length - 1) {
        currentPage++;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      } else {
        currentPage = 0
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      }

    }
  });


}
async function swap_pages2(client, message, embeds) {
  let currentPage = 0;
  let cmduser = message.author;
  if (embeds.length === 1) return message.channel.send({
    embeds: [embeds[0]]
  }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))
  let button_back = new MessageButton().setStyle('SUCCESS').setCustomId('1').setEmoji("833802907509719130").setLabel("Back")
  let button_home = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji("🏠").setLabel("Home")
  let button_forward = new MessageButton().setStyle('SUCCESS').setCustomId('3').setEmoji('832598861813776394').setLabel("Forward")
  const allbuttons = [new MessageActionRow().addComponents([button_back, button_home, button_forward])]
  let prefix = client.settings.get(message.guild.id, "prefix");
  //Send message with buttons
  let swapmsg = await message.channel.send({
    content: `***Click on the __Buttons__ to swap the Pages***`,
    embeds: [embeds[0]],
    components: allbuttons
  });
  //create a collector for the thinggy
  const collector = swapmsg.createMessageComponentCollector({
    filter: (i) => i.isButton() && i.user && i.user.id == cmduser.id && i.message.author.id == client.user.id,
    time: 180e3
  }); //collector for 5 seconds
  //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
  collector.on('collect', async b => {
    if (b.user.id !== message.author.id)
      return b.reply({
        content: `❌ **Only the one who typed ${prefix}help is allowed to react!**`,
        ephemeral: true
      })
    //page forward
    if (b.customId == "1") {
      //b.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage !== 0) {
        currentPage -= 1
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      } else {
        currentPage = embeds.length - 1
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      }
    }
    //go home
    else if (b.customId == "2") {
      //b.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
      currentPage = 0;
      await swapmsg.edit({
        embeds: [embeds[currentPage]],
        components: allbuttons
      });
      await b.deferUpdate();
    }
    //go forward
    else if (b.customId == "3") {
      //b.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage < embeds.length - 1) {
        currentPage++;
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      } else {
        currentPage = 0
        await swapmsg.edit({
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      }

    }
  });

}
async function swap_pages2_interaction(client, interaction, embeds) {
  let currentPage = 0;
  let cmduser = interaction.member.user;
  if (embeds.length === 1) return interaction.reply({
    ephemeral: true,
    embeds: [embeds[0]]
  }).catch(e => console.log("THIS IS TO PREVENT A CRASH"))
  let button_back = new MessageButton().setStyle('SUCCESS').setCustomId('1').setEmoji("833802907509719130").setLabel("Back")
  let button_home = new MessageButton().setStyle('DANGER').setCustomId('2').setEmoji("🏠").setLabel("Home")
  let button_forward = new MessageButton().setStyle('SUCCESS').setCustomId('3').setEmoji('832598861813776394').setLabel("Forward")
  const allbuttons = [new MessageActionRow().addComponents([button_back, button_home, button_forward])]
  let prefix = client.settings.get(interaction.member.guild.id, "prefix");
  //Send message with buttons
  let swapmsg = await interaction.reply({
    content: `***Click on the __Buttons__ to swap the Pages***`,
    embeds: [embeds[0]],
    components: allbuttons,
    ephemeral: true
  });
  //create a collector for the thinggy
  const collector = swapmsg.createMessageComponentCollector({
    filter: (i) => i.isButton() && i.user && i.user.id == cmduser.id && i.message.author.id == client.user.id,
    time: 180e3
  }); //collector for 5 seconds
  //array of all embeds, here simplified just 10 embeds with numbers 0 - 9
  collector.on('collect', async b => {
    if (b.user.id !== cmduser.id)
      return b.reply({
        content: `❌ **Only the one who typed ${prefix}help is allowed to react!**`,
        ephemeral: true
      })
    //page forward
    if (b.customId == "1") {
      //b.reply("***Swapping a PAGE FORWARD***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage !== 0) {
        currentPage -= 1
        await swapmsg.edit({
          ephemeral: true,
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      } else {
        currentPage = embeds.length - 1
        await swapmsg.edit({
          ephemeral: true,
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      }
    }
    //go home
    else if (b.customId == "2") {
      //b.reply("***Going Back home***, *please wait 2 Seconds for the next Input*", true)
      currentPage = 0;
      await swapmsg.edit({
        ephemeral: true,
        embeds: [embeds[currentPage]],
        components: allbuttons
      });
      await b.deferUpdate();
    }
    //go forward
    else if (b.customId == "3") {
      //b.reply("***Swapping a PAGE BACK***, *please wait 2 Seconds for the next Input*", true)
      if (currentPage < embeds.length - 1) {
        currentPage++;
        await swapmsg.edit({
          ephemeral: true,
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      } else {
        currentPage = 0
        await swapmsg.edit({
          ephemeral: true,
          embeds: [embeds[currentPage]],
          components: allbuttons
        });
        await b.deferUpdate();
      }

    }
  });

}

function databasing(client, guildid, userid) {
  if (!client || client == undefined || !client.user || client.user == undefined) return;
  try {
    if (userid) {
      client.queuesaves.ensure(userid, {
        "TEMPLATEQUEUEINFORMATION": ["queue", "sadasd"]
      });
    }
    if (guildid) {
      client.musicsettings.ensure(guildid, {
        "channel": "",
        "message": ""
      })
      client.stats.ensure(guildid, {
        commands: 0,
        songs: 0
      });
      client.settings.ensure(guildid, {
        prefix: config.prefix,
        embed: {
          "color": ee.color,
          "thumb": true,
          "wrongcolor": ee.wrongcolor,
          "footertext": client.guilds.cache.get(guildid) ? client.guilds.cache.get(guildid).name : ee.footertext,
          "footericon": client.guilds.cache.get(guildid) ? client.guilds.cache.get(guildid).iconURL({
            dynamic: true
          }) : ee.footericon,
        },
        language: settings.default_db_data.language,
        pruning: settings.default_db_data.pruning,
        unkowncmdmessage: settings.default_db_data.unkowncmdmessage,
        autoresume: settings.default_db_data.autoresume,

        defaultvolume: settings.default_db_data.defaultvolume,
        defaulteq: settings.default_db_data.defaultequalizer,
        defaultap: settings.default_db_data.defaultautoplay,

        playmsg: settings.default_db_data.playmsg,

        djroles: [],
        botchannel: [],
      });
    }
    return;
  } catch (e) {
    console.log(String(e.stack).grey.bgRed)
  }
}


/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://discord.gg/milrato
 * @INFO
 * Work for Milrato Development | https://milrato.dev
 * @INFO
 * Please mention him / Milrato Development, when using this Code!
 * @INFO
 */
