const con = require('./core/connect')
const wa = require('./core/helper')

const ev = con.Whatsapp
const prefix = '!'

con.connect()

ev.on('chat-update', async (msg) => {
    try {
        if (!msg.hasNewMessage) return;
        msg = wa.serialize(msg)
        console.log(msg)
        // if (!msg.message) return;
        // if (msg.key && msg.key.remoteJid === 'status@broadcast') return;
        // if (!msg.key.fromMe) return;
        // const { from, sender, isGroup, isEphemeral, quoted, mentionedJid, type } = msg
        // let { body } = msg
        // body = (type === 'conversation' && body.startsWith(prefix)) ? body : (((type === 'imageMessage' || type === 'videoMessage') && body) && body.startsWith(prefix)) ? body : ((type === 'ephemeralMessage') && body) ? body : ''
        // const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        // const arg = body.substring(body.indexOf(' ') + 1)
        // const args = body.trim().split(/ +/).slice(1)
        // const isCmd = body.startsWith(prefix)

        // console.log(command)

        // switch (command) {
        //     case 'help':
        //         wa.reply(from, `Heloo, ${sender.split('@')[0]}`, msg)
        //         break
        // }
    } catch(e) {
        console.log(`Error: ${e}`)
    }
})