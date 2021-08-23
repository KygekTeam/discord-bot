'use strict';

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

const fetch = require('node-fetch');

const { prefix, token } = require('./config.json');

var connection = null;
var botVoiceChannel = null;
var dispatcher = null;

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command == "help") {
        const helpEmbed = new Discord.MessageEmbed()
            .setColor("#ffff00")
            .setTitle("KygekTeam Bot Help")
            .setDescription("Commands")
            .setAuthor("KygekTeam Bot", "https://media.discordapp.net/attachments/735990976471891978/860882384479846400/KygekTeam_Logo_2021_Icon2000x2000_Gray.png?width=406&height=406", "https://kygekteam.org")
            .addFields(
                {name: 'Plugins', value: `${prefix}plugins, ${prefix}plugin <plugin>, ${prefix}changelogs <plugin>`, inline: true},
                {name: 'Utilities', value: `${prefix}faq <number>, ${prefix}clear <messages>`, inline: true},
                {name: 'Notice', value: 'More coming soon!', inline: false}
            )
            .setFooter("By DavidDGTNT", "https://daviddgtnt.github.io/opensource/DGTNT%20Color.png")
            .setImage("https://media.discordapp.net/attachments/735990976471891978/860882384479846400/KygekTeam_Logo_2021_Icon2000x2000_Gray.png?width=75&height=75");
        message.channel.send(helpEmbed);
    } else if (command == "plugins") {
        const array = await fetch('https://api.kygekteam.org/names').then(response => response.json());
        var msg = "Plugins:"
        await array.forEach((name) => {
            msg = msg + "\n" + name;
        });
        message.channel.send(msg);
    } else if (command == "plugin") {
        try {
            if (!args.length) {
                return message.reply("You didn't provide a plugin!");
            }
            const plugin = await fetch('https://api.kygekteam.org/plugin/' + args[0]).then(response => response.json());
            const name = plugin.name;
            const desc = plugin.description;
            const author = plugin.author;
            var msg = "Plugin: " + name + "\n" + desc + "\nBy " + author + "\nhttps://kygekteam.org/" + plugin.name;
            if (plugin.downloads.poggit != undefined) {
                msg = msg + "\nPoggit: " + plugin.downloads.poggit;
            }
            if (plugin.downloads.nukkit != undefined) {
                msg = msg + "\nNukkit: " + plugin.downloads.nukkit;
            }
            if (plugin.downloads.spigot != undefined) {
                msg = msg + "\nSpigot: " + plugin.downloads.spigot;
            }
            if (plugin.changelogs != null) {
                const firstLog = plugin.changelogs[0];
                const version = firstLog.version;
                const relDate = firstLog.releaseDate;
                const changes = firstLog.changes;
                msg = msg + "\nChangelog for version " + version + ":";
                msg = msg + "\nReleased on " + relDate;
                msg = msg + "\nChanges:";
                changes.forEach((change) => {
                    msg = msg + "\n" + change;
                });
            }
            message.channel.send(msg);
        } catch (err) {
            message.channel.send("ERROR: Plugin doesn't exist or there was an error");
            console.error(err);
        }
    } else if (command == "changelogs") {
        try {
            if (!args.length) {
                return message.reply("You didn't provide a plugin!");
            }
            const plugin = await fetch('https://api.kygekteam.org/plugin/' + args[0]).then(response => response.json());
            var name = plugin.name;
            var msg = "Changelogs for plugin " + name;
            if (plugin.changelogs != null) {
                const changelogs = plugin.changelogs;
                changelogs.forEach((changelog) => {
                    const version = changelog.version;
                    const relDate = changelog.releaseDate;
                    const changes = changelog.changes;
                    msg = msg + "\nChangelog for version " + version + ":"
                    msg = msg + "\nReleased on " + relDate;
                    msg = msg + "\nChanges:";
                    changes.forEach((change) => {
                        msg = msg + "\n" + change;
                    });
                });
                message.channel.send(msg);
            } else {
                message.reply("That plugin doesn't have changelogs or doesn't exist!")
            }
        } catch (err) {
            message.channel.send("ERROR: Plugin doesn't exist or there was an error");
            console.error(err);
        }
    } else if (command == "shutdown") {
        if (message.author.id == 317394276189208576) {
            if (connection) {
                if (dispatcher) dispatcher.destroy();
                botVoiceChannel.leave()
                connection = null;
            }
            process.exit(0);
        }
    } else if (command == "faq") {
        if (!args.length) {
            return message.reply("Please provide an argument!");
        }
        if (!Number.isInteger(parseInt(args[0]))) {
            return message.reply("First argument should be an integer!");
        }
        if (args[0].includes(".") || args[0].includes(",")) {
            return message.reply("First argument should be an integer!");
        }
        const channel = client.channels.cache.get("875031806804643882");

        channel.messages.fetch({ limit: 100 }).then(messages => {
            console.log("FAQ: #" + args[0]);
            if (messages.size < args[0] || args[0] < 1){
                return message.reply("FAQ doesn't exists!");
            }
            const contents = Array.from(messages, ([name, value]) => ({ name, value })).reverse()[args[0] - 1].value.content;
            const Embed = new Discord.MessageEmbed()
            .setColor("#ffff00")
            .setTitle(`FAQ #${args[0]}`)
            .setDescription(contents);
            message.channel.send(Embed);
        });
    } else if (command == "clear") {
        if (!args.length) {
            return message.reply("Please provide an argument!");
        }
        if (!Number.isInteger(parseInt(args[0]))) {
            return message.reply("First argument should be an integer!");
        }
        if (args[0].includes(".") || args[0].includes(",")) {
            return message.reply("First argument should be an integer!");
        }
        message.reply("This command is currently being worked on");
    } else {
        return;
    }
});

client.login(token);
