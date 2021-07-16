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
            .setTitle("KygekBot Help")
            .setDescription("Commands")
            .setAuthor("KygekBot", "https://media.discordapp.net/attachments/735990976471891978/860882384479846400/KygekTeam_Logo_2021_Icon2000x2000_Gray.png?width=406&height=406", "https://kygekteam.org")
            .addFields(
                {name: 'Plugins', value: `${prefix}plugins, ${prefix}plugin <plugin>, ${prefix}changelogs <plugin>`, inline: true},
                {name: 'Notice', value: 'More coming soon!', inline: true}
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
                return message.reply("you didn't provide a plugin!");
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
            message.channel.send("Error: Plugin doesn't exist or there was an error");
            console.error(err);
        }
    } else if (command == "changelogs") {
        try {
            if (!args.length) {
                return message.reply("you didn't provide a plugin!");
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
                message.reply("that plugin doesn't have changelogs or doesn't exist!!")
            }
        } catch (err) {
            message.channel.send("Error: Plugin doesn't exist or there was an error");
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
    } else {
        return;
    }
});

client.login(token);