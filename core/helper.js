const con = require('./connect')
const {
    Mimetype,
    MessageType
} = require('@adiwajshing/baileys')
const fs = require('fs')

const wa = con.Whatsapp

exports.serialize = function(chat) {
    m = JSON.parse(JSON.stringify(chat)).messages[0]
    content = m.message
    m.isGroup = m.key.remoteJid.endsWith('@g.us')
    m.from = m.key.remoteJid
    try{
        const tipe = Object.keys(content)[0]
        m.type = tipe
    } catch {
        m.type = null
    }

    try {
        const quote = m.message.extendedTextMessage.contextInfo
        json = {
            id: quote.stanzaId ? quote.stanzaId : '',
            sender: quote.participant ? quote.participant : '',
            message: quote.quotedMessage ? quote.quotedMessage : ''
        }
        m.quoted = json
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

    if (m.type == 'ephemeralMessage') {
        m.isEphemeral = true
    } else {
        m.isEphemeral = false
    }

    const txt = (m.type === 'conversation' && m.message.conversation) ? m.message.conversation 
    : (m.type == 'imageMessage') && m.message.imageMessage.caption ? m.message.imageMessage.caption 
    : (m.type == 'videoMessage') && m.message.videoMessage.caption ? m.message.videoMessage.caption 
    : (m.type == 'extendedTextMessage') && m.message.extendedTextMessage.text ? m.message.extendedTextMessage.text : ''
    m.body = txt

    if (m.isEphemeral) {
        content2 = m.message.ephemeralMessage.message
        const tip2 = Object.keys(content2)[0]
        const text = (tip2 === 'extendedTextMessage' && content2.extendedTextMessage.text) ? content2.extendedTextMessage.text 
        : (tip2 == 'imageMessage') && content2.imageMessage.caption ? content2.imageMessage.caption 
        : (tip2 == 'videoMessage') && content2.videoMessage.caption ? content2.videoMessage.caption : ''
        m.body = text

        try {
            const mens = content2[tip2].contextInfo.mentionedJid
            m.mentionedJid = mens
        } catch {
            m.mentionedJid = null
        }

        try {
            const quote = content2[tip2].contextInfo
            json = {
                id: quote.stanzaId ? quote.stanzaId : '',
                sender: quote.participant ? quote.participant : '',
                message: quote.quotedMessage ? quote.quotedMessage : ''
            }
            m.quoted = json
        } catch {
            m.quoted = null
        }
    }
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
