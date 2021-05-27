import fs from "fs";
import certinfo from "cert-info";

function getProperty(prop) {
    return certinfo.info(this.cert.toString())[prop];
}

const sslContext = {
    ca: fs.readFileSync("ssl/ca-certificate.crt"),
    key: fs.readFileSync("ssl/backend.servicetws.com.key"),
    cert: fs.readFileSync("ssl/backend.servicetws.com.crt"),
    passphrase: fs.readFileSync("ssl/ssl_passphrase.txt").toString(),
    _get: getProperty
}

export default sslContext;