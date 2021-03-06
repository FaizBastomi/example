const con = require('./connect')
const {
    Mimetype,
    MessageType
} = require('@adiwajshing/baileys')
const fs = require('fs')

const wa = con.Whatsapp

/**
 * Serialize
 * @param chat message
 * @returns message
 */
 exports.serialize = function(chat) {
    m = JSON.parse(JSON.stringify(chat)).messages[0]
    const content = m.message

    try {
        const tipe = Object.keys(content)[0]
        m.type = tipe
    } catch {
        m.type = null
    }

    if (m.type === 'ephemeralMessage') {
        m.message = m.message.ephemeralMessage.message

        try {
            const tipe = Object.keys(m.message)[0]
            m.type = tipe
        } catch {
            m.type = null
        }

        m.isEphemeral = true
    } else {
        m.isEphemeral = false
    }

    m.isGroup = m.key.remoteJid.endsWith('@g.us')
    m.from = m.key.remoteJid

    try {
        const quote = m.message.extendedTextMessage.contextInfo
        if (quote.quotedMessage["ephemeralMessage"]) {
            m.quoted = { stanzaId: quote.stanzaId, participant: quote.participant, message: quote.quotedMessage.ephemeralMessage.message }
        } else {
            m.quoted = { stanzaId: quote.stanzaId, participant: quote.participant, message: quote.quotedMessage }
        }
    } catch {
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
    : (m.type == 'imageMessage') && m.message[m.type].caption ? m.message[m.type].caption 
    : (m.type == 'videoMessage') && m.message[m.type].caption ? m.message[m.type].caption 
    : (m.type == 'extendedTextMessage') && m.message[m.type].text ? m.message[m.type].text : ''
    m.body = txt

    return m
}

/**
 * Send a reply to someone
 * @param jid of the chat
 * @param text your text
 * @param quoted the message you want to reply
 */
exports.reply = function(jid, text, quoted) {
    wa.sendMessage(jid, text, MessageType.text, { quoted: quoted })
}

/**
 * Send text
 * @param jid of the chat
 * @param text your text
 */
exports.sendText = function(jid, text) {
    wa.sendMessage(jid, text, MessageType.text)
}

/**
 * Send your custom message
 * @param jid of the chat
 * @param text your text or something else
 * @param Messagetype your MessageType
 * @param options MessageOptions Baileys
 */
exports.custom = function(jid, text, Messagetype, options={}) {
    wa.sendMessage(jid, text, Messagetype, options)
}

/**
 * Sending image
 * @param jid of the chat
 * @param data Buffer or path to file
 * @param options baileys Message Options
 */
exports.image = function(jid, data, options={}) {
    if (typeof data === 'string') {
        wa.sendMessage(jid, fs.readFileSync(data), MessageType.image, options)
    } else {
        wa.sendMessage(jid, data, MessageType.image, options)
    }
}

/**
 * Sending sticker
 * @param jid of the chat
 * @param data Buffer or path to file
 * @param options baileys Message Options
 */
exports.sticker = function(jid, data, options={}) {
    if (typeof data === 'string') {
        wa.sendMessage(jid, fs.readFileSync(data), MessageType.sticker, options)
    } else {
        wa.sendMessage(jid, data, MessageType.sticker, options)
    }
}