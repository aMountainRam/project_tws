import fs from "fs";

export default {
    ca: fs.readFileSync("ssl/ca-certificate.crt"),
    key: fs.readFileSync("ssl/backend.servicetws.com.key"),
    cert: fs.readFileSync("ssl/backend.servicetws.com.crt"),
    passphrase: fs.readFileSync("ssl/ssl_passphrase.txt").toString(),
}