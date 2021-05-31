host:
    ports:
        http: 80
        https: 443

domain:
    name: servicetws.com

services:
    client:
        context: client
        sslMode: CRT # [PEM,CRT]
        certs: ssl
        keys: ssl
        ou: servicetws
    reverse:
        context: reverse
        sslMode: CRT # [PEM,CRT]
        certs: ssl
        keys: ssl
        ou: servicetws
        requireBaseDNS: true
    frontend:
        context: frontend
        sslMode: CRT # [PEM,CRT]
        certs: ssl
        keys: ssl
        ou: servicetws
    database:
        context: mongodb
        sslMode: PEM # [PEM,CRT]
        certs: ssl/certs
        keys: ssl/keys
        passphraseMode: nopassphrase
        ou: servicetws
        # [ passphraseMode: [random (default), nopassphrase, user] ]
        # [ outpassphrase: [ <filepath> (default to keys folder), stdout ]]
    session:
        context: session
        sslMode: CRT
        certs: ssl
        keys: ssl
        passphraseMode: nopassphrase
        ou: servicetws
    backend:
        context: backend
        sslMode: CRT # [PEM,CRT]
        certs: ssl
        keys: ssl
        ou: servicetws

ca:
    context: ca
    name: ca
    c: IT
    st: Brescia
    l: Sirmione
    o: amountainram
    ou: certificateauthority
    cn: ca
