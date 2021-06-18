const con = require('./core/connect')
const wa = require('./core/helper')
const {
    MessageType
} = require('@adiwajshing/baileys')
const {
    getRandom,
    color
} = require('./utils')
const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const moment = require('moment-timezone')
const { exec } = require('child_process')

const ev = con.Whatsapp
const prefix = '!'

con.connect()

function printLog(isCmd, sender, groupName, isGroup) {
    const time = moment.tz('Asia/Jakarta').format('DD/MM/YY HH:mm:ss')
    if (isCmd && isGroup) { return console.log(color(`[${time}]`, 'yellow'), color('[EXEC]', 'aqua'), color(`${sender.split('@')[0]}`, 'lime'), 'in', color(`${groupName}`, 'lime')) }
    if (isCmd && !isGroup) { return console.log(color(`[${time}]`, 'yellow'), color('[EXEC]', 'aqua'), color(`${sender.split('@')[0]}`, 'lime')) }
}

ev.on('chat-update', async (msg) => {
    try {
        if (!msg.hasNewMessage) return;
        msg = wa.serialize(msg)
        if (!msg.message) return;
        if (msg.key && msg.key.remoteJid === 'status@broadcast') return;
        if (!msg.key.fromMe) return;
        const { from, sender, isGroup, quoted, type } = msg
        let { body } = msg
        body = (type === 'conversation' && body.startsWith(prefix)) ? body : (((type === 'imageMessage' || type === 'videoMessage') && body) && body.startsWith(prefix)) ? body : ((type === 'extendedTextMessage') && body.startsWith(prefix)) ? body : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)

        const groupMetadata = isGroup ? await ev.groupMetadata(from) : ''
        const groupSubject = isGroup ? groupMetadata.subject : ''

        const content = JSON.stringify(quoted)
        const isMedia = (type === 'imageMessage' || type === 'videoMessage')
        const isQStick = type === 'extendedTextMessage' && content.includes('stickerMessage')
        const isQImg = type === 'extendedTextMessage' && content.includes('imageMessage')
        const isQVid = type === 'extendedTextMessage' && content.includes('videoMessage')

        printLog(isCmd, sender, groupSubject, isGroup)

        switch (command) {
            case 'help':
                wa.custom(from, `Hello, ( @${sender.split('@')[0]} )\nSaya disini bisa membantu mu untuk membuat stiker whatsapp :D\nSilahkan ketik !stiker`, MessageType.extendedText, { contextInfo: {"mentionedJid": [sender] }, quoted: msg })
                break
            case 'sticker':
                case 'stiker':
                    case 'stik':
                        if (isMedia && !msg.message.videoMessage || isQImg) {
                            const encmed = isQImg ? quoted : msg
                            const rand = getRandom('.jpeg')
                            const rand1 = getRandom('.webp')
                            const media = await ev.downloadAndSaveMediaMessage(encmed, `./temp/${rand}`)
                            ffmpeg(media)
                            .on('start', function(cmd) {
                                console.log('FFMPEG: ' + cmd)
                            })
                            .on('error', function(err) {
                                fs.unlinkSync(media)
                                console.log('FFMPEG: ' + err)
                            })
                            .on('end', function() {
                                console.log('Finish')
                                wa.sticker(from, `./temp/${rand1}`, { quoted: msg })
                                fs.unlinkSync(media)
                                fs.unlinkSync(`./temp/${rand1}`)
                            })
                            .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                            .toFormat('webp')
                            .save(`./temp/${rand1}`)
                        } else if (isMedia && msg.message.videoMessage.seconds <= 15 || isQVid && quoted.message.videoMessage.seconds <= 15) {
                            const encmed = isQVid ? quoted : msg
                            const ran1 = getRandom('.mp4')
                            const ran = getRandom('.webp')
                            const media = await ev.downloadAndSaveMediaMessage(encmed, `./temp/${ran1}`)
                            ffmpeg(media)
                            .inputFormat(`${media.split('.')[2]}`)
                            .on('start', function(cmd) {
                                console.log('FFMPEG: ' + cmd)
                            })
                            .on('error', function(err) {
                                fs.unlinkSync(media)
                                console.log('FFMPEG: ' + err)
                            })
                            .on('end', function() {
                                console.log('Finish')
                                wa.sticker(from, `./temp/${ran}`, { quoted: msg })
                                fs.unlinkSync(media)
                                fs.unlinkSync(`./temp/${ran}`)
                            })
                            .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
                            .toFormat('webp')
                            .save(`./temp/${ran}`)
                        } else {
                            wa.reply(from, 'kirim gambar atau video kepada saya dengan caption *!stiker*.\nMaksimal durasi video 15detik', msg)
                        }
                        break
            case 'toimg':
                if (isQStick && msg.quoted.message.stickerMessage.isAnimated === false) {
                    const ran = getRandom('.webp')
                    const ran1 = getRandom('.png')
                    const encmed = quoted
                    const media = await ev.downloadAndSaveMediaMessage(encmed, `./temp${ran}`)
                    exec(`ffmpeg -i ${media} ./temp/${ran1}`, function(err) {
                        fs.unlinkSync(media)
                        if (err) return wa.reply(from, 'Ada yang eror', msg)
                        wa.image(from, `./temp/${ran1}`, { quoted: msg, caption: 'Done.' })
                        fs.unlinkSync(`./temp/${ran1}`)
                    })
                } else {
                    wa.reply(from, 'Silahkan reply stickernya.\nHanya dapat decrypt non-animated sticker.', msg)
                }
                break

                default:
                    break
        }
    } catch(e) {
        console.log(`Error: ${e}`)
    }
})