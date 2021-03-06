const {
    WAConnection,
    Browsers
} = require('@adiwajshing/baileys')
const fs = require('fs')

const conn = new WAConnection()

exports.Whatsapp = conn

exports.connect = async () => {

    // Custom browser
    conn.browserDescription = Browsers.macOS('Chrome')
    
    conn.on('qr', () => {
        console.log('\033[1;32mScan the QR code above.\x1b[0m')
    })
    fs.existsSync('./Midnight.json') && conn.loadAuthInfo('./Midnight.json')

    await conn.connect({ timeoutMs: 3*1000 })
    fs.writeFileSync('./Midnight.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))
    console.log('='.repeat(50))
    console.log(`| + WA Version: ${conn.user.phone.wa_version}`)
    console.log(`| + Device: ${conn.user.phone.device_manufacturer}`)
    console.log('='.repeat(50))
    return conn
}
