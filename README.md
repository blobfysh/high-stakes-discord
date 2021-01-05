# Work in progress

just a fun way for me to learn typescript and prisma

## About this bot

It *will soon* be a gambling bot where you can bet and lose/maybe win some credits! It uses some new Discord features such as slash commands, inline replies and ephemeral messages.

### My take on slash commands

I cant seem to find a way to disable slash commands in certain channels. Like with a regular bot you can adjust the channel permissions so it can't see messages in a channel (effectively disabling the bot in that channel). So if I were to implement slash commands on a real bot I would probably make it so you have to enable them. Other than that they are pretty cool :)

## Hosting Instructions

Install dependencies:

```sh
yarn install
```

Compile Typescript:

```sh
yarn run build
```

Run the bot:

```sh
yarn run start
```
