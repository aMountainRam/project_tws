host:
    ports:
        http: 80
        https: 443

domain:
    name: servicetws.com

services:
    database:
        context: mongodb
        sslMode: PEM # [PEM,CRT]
        certs: ssl/certs
        keys: ssl/keys
        # [ passphraseMode: [random (default), nopassphrase, user] ]
        # [ passphrase: [<none> (default), string]]
        # [ outpassphrase: [ <filepath> (default to keys folder), stdout ]]

