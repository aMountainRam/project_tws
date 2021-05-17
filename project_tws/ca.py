from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID
from datetime import datetime, timedelta
from pathlib import Path
import uuid

ONE_YEAR = timedelta(365, 0, 0)

class CertificateAuthority:
    def __init__(self, key) -> None:
        self.key = key
        self.certs = []

    def create_ca_cert(self, cn, c, st='', l='', o='', ou='', starts=timedelta(0), ends=ONE_YEAR) -> x509.Certificate:

        public_key = self.key.public_key()

        name = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, c),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, st),
            x509.NameAttribute(NameOID.LOCALITY_NAME, l),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, o),
            x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, ou),
            x509.NameAttribute(NameOID.COMMON_NAME, cn)
        ])

        today = datetime.today()
        builder = x509.CertificateBuilder()\
            .subject_name(name)\
            .issuer_name(name)\
            .not_valid_before(today + starts)\
            .not_valid_after(today + ends)\
            .serial_number(int(uuid.uuid4()))\
            .public_key(public_key)\
            .add_extension(x509.BasicConstraints(ca=True, path_length=None), critical=True)\
            .add_extension(x509.KeyUsage(True, False, False, False, False, True, True, False, False), critical=False)

        ca_cert = builder.sign(
            private_key=self.key, algorithm=hashes.SHA256(),
            backend=default_backend()
        )
        self.certs.append(ca_cert)
        return ca_cert

    def dump_key(self, passphrase='', dir=Path('.'), filename='ca.key', options='wb') -> None:
        with open(dir/filename, options) as f:
            if passphrase == '':
                encryption_algorithm = serialization.NoEncryption()
            else:
                encryption_algorithm = serialization.BestAvailableEncryption(
                    bytes(passphrase))
            f.write(self.key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=encryption_algorithm
            ))

    def dump_cert(self, dir=Path('.'), filename='ca.crt', options='wb'):
        with open(dir/filename, options) as f:
            f.write(self.cert.public_bytes(
                encoding=serialization.Encoding.PEM,
            ))

    def dump_pem_cert(self, passphrase='', dir=Path('.'), filename='certificate-ca.pem', options='wb'):
        self.dump_cert(dir, filename, options)
        self.dump_key(passphrase, dir, filename, options.replace('w', 'a'))


def create_ca(key_size=2048) -> CertificateAuthority:
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=key_size,
        backend=default_backend()
    )
    return CertificateAuthority(private_key)


def load_ca_from_pem_cert(path, passphrase=''):
    with open(path, 'rb') as f:
        data = f.read()
        f.close()
        pem_cert = x509.load_pem_x509_certificate(data, default_backend())
        cert = pem_cert.public_key()
        if(passphrase == ''):
            passphrase = None
        pem_key = serialization.load_pem_private_key(
            data, passphrase, default_backend())
        print(cert)
        print(pem_key)