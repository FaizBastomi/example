const con = require('./connect')
const {
    Mimetype,
    MessageType
} = require('@adiwajshing/baileys')
const fs = require('fs')

const wa = con.Whatsapp

exports.serialize = function(chat) {
    m = JSON.parse(JSON.stringify(chat)).messages[0]

    if(m.message['ephemeralMessage']) {
        m.message = m.message.ephemeralMessage.message
        m.isEphemeral = true
    } else {
        m.isEphemeral = false
    }

    content = m.message
    m.isGroup = m.key.remoteJid.endsWith('@g.us')
    m.from = m.key.remoteJid

    try{
        const tipe = Object.keys(content)[0]
        m.type = tipe
    } catch {
        m.type = null
    }

    try{
        const quote = m.message.extendedTextMessage.contextInfo
        if (quote.quotedMessage['ephemeralMessage']) {
            m.quoted = { stanzaId: quote.stanzaId, participant: quote.participant, message: quote.quotedMessage.ephemeralMessage.message }
        } else {
            m.quoted = { stanzaId: quote.stanzaId, participant: quote.participant, message: quote.quotedMessage }
        }
    }catch{
        m.quoted = null
    }

    try {
        const mention = m.message[m.type].contextInfo.mentionedJid
        m.mentionedJid = mention
    } catch {
        m.mentionedJid = null
    }

    if(m.isGroup) {
        m.sender = m.participant
    } else {
        m.sender = m.key.remoteJid
    }

    if (m.key.fromMe) {
        m.sender = wa.user.jid
    }

    const txt = (m.type === 'conversation' && m.message.conversation) ? m.message.conversation 
    : (m.type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption 
    : (m.type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption 
    : (m.type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : ''
    m.body = txt

    return m
}

exports.reply = function(jid, text, quoted) {
    wa.sendMessage(jid, text, MessageType.text, { quoted: quoted })
}

exports.sendText = function(jid, text) {
    wa.sendMessage(jid, text, MessageType.text)
}

exports.custom = function(jid, text, Messagetype, options={}) {
    wa.sendMessage(jid, text, Messagetype, options)
}

/**
 * 
 * @param {jid} jid of the chat
 * @param {data} data Buffer or path to file
 * @param {options} options baileys Message Options
 */
exports.image = function(jid, data, options={}) {
    if (typeof data === 'string') {
        wa.sendMessage(jid, fs.readFileSync(data), MessageType.image, options)
    } else {
        wa.sendMessage(jid, data, MessageType.image, options)
    }
}

/**
 * 
 * @param {jid} jid of the chat
 * @param {data} data Buffer or path to file
 * @param {options} options baileys Message Options
 */
exports.sticker = function(jid, data, options={}) {
    if (typeof data === 'string') {
        wa.sendMessage(jid, fs.readFileSync(data), MessageType.sticker, options)
    } else {
        wa.sendMessage(jid, data, MessageType.sticker, options)
    }
}