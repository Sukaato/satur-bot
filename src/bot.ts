import { Client, VoiceChannel } from 'discord.js';
import { readdir } from 'fs/promises';
const client = new Client();
import * as config from '../config.json';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  const interval = 5000;
  console.log('interval:', parseMsToTime(interval));

  client.setImmediate(startUp, 500);
  client.setInterval(main, config.interval);
});

function getVoiceChannels(requiredUser?: number): VoiceChannel[] {
  const requieredUserCount = Math.floor(Math.random() * 0.5 * 10 + 1);
  return client.channels.cache
    .filter(channel => channel.type === 'voice' && !channel.deleted)
    .filter((channel: VoiceChannel) => channel.members.size >= (requiredUser ?? requieredUserCount))
    .array() as VoiceChannel[];
}

function canConnectToChannel(): boolean {
  const connect = Math.floor(Math.random() * 100);
  return connect <= config.accessPercentage;
}

function playAudio(voiceChannel: VoiceChannel): void {
  console.log(`Connect to the channel '${voiceChannel.name}'`);
  voiceChannel.join().then(async connection => {
    const files = await readdir(`${__dirname}/assets/musics`);
    const sounds = files.filter(file => file !== 'README.md');
    const audio = sounds[Math.floor(Math.random() * sounds.length)];

    connection
      .play(`${__dirname}/assets/musics/${audio}`)
      .on('start', () => console.log(`start playing audio: ${audio}`))
      .on('error', console.error)
      .on('finish', () => voiceChannel.leave())
      .setVolume(config.volume);
  })
  .catch(console.error);
}

function main() {
  console.log(`Checking voice channels`);
  const voiceChannels = getVoiceChannels();
  const index = Math.floor(Math.random() * voiceChannels.length);

  if (voiceChannels.length > 0 && canConnectToChannel()) {
    return playAudio(voiceChannels[index]);
  }
  console.warn(`Can't connect to any channel`);
}

function startUp() {
  console.log(`Checking voice channel to play satured sounds`);
  const voiceChannels = getVoiceChannels(1);

  if (voiceChannels.length > 0) {
    const index = Math.floor(Math.random() * voiceChannels.length);
    playAudio(voiceChannels[index]);
  }
}

function padStart(value: number, minLength: number = 2): string {
  return value.toString().padStart(minLength, '0');
}

function parseMsToTime(ms: number): string {
  const minutes = Math.floor((ms / 1000 / 60) << 0);
  const seconds = Math.floor(ms / 1000 % 60);
  const milliseconds = parseInt((ms / 1000).toString().split('.')[1]) || 0;

  return `${padStart(minutes)} minutes ${padStart(seconds)}.${padStart(milliseconds, 3)} secondes`;
}

client.login(config.token);
