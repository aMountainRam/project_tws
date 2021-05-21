from cryptography import x509
from cryptography.exceptions import InternalError
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.base import Certificate
from cryptography.x509.name import Name
from cryptography.x509.oid import NameOID, ExtendedKeyUsageOID
from datetime import datetime, timedelta
from pathlib import Path
from secrets import token_bytes, token_urlsafe
from base64 import b64encode
import uuid
import shutil
import getpass

OK_STATUS = 0
PASSPHRASE_BYTES = 32
SSL_PASSPHRASE_FILE_NAME="ssl_passphrase.txt"
ONE_YEAR = timedelta(365, 0, 0)
args = {}
config = {}


def setup(a, c):
    global args
    global config
    args = a
    config = c


def generate_key(key_size=2048):
    return rsa.generate_private_key(public_exponent=65537, key_size=key_size, backend=default_backend())


def get_passphrase(holder):
    passphrase = b64encode(token_bytes(PASSPHRASE_BYTES)).decode()
    if "passphraseMode" in holder:
        if holder["passphraseMode"] == "nopassphrase":
            passphrase = ''
        elif holder["passphraseMode"] == "user":
            try:
                passphrase = getpass.getpass('Insert a CA passphrase: ')
                if not passphrase == getpass.getpass('Re-type CA password: '):
                    raise UserWarning
            except UserWarning:
                print("Passwords are not the same. Exiting...")
                exit(1)
            except getpass.GetPassWarning:
                print("Password was echoed. Exiting...")
                exit(1)

    return passphrase


class KeyPairHolder:

    def __init__(self, key_size=2048):
        self.key = generate_key(key_size)
        self.certs = []
        self.csrs = []

    def get_certificate(self):
        if len(self.certs) > 0:
            return self.certs[0]
        else:
            raise InternalError("Cannot find a certificate")

    def request(self, subject, ca_public_key, service_host, include_host=False):
        dnss = [x509.DNSName(f"{service_host}"), x509.DNSName(f"www.{service_host}")]
        if include_host:
            dnss.append(x509.DNSName(config["domain"]["name"]))
        # notice that in rfc3280 nonRepudiation == contentCommitment
        csr = x509.CertificateSigningRequestBuilder().subject_name(subject
            ).add_extension(x509.AuthorityKeyIdentifier.from_issuer_public_key(ca_public_key),critical=False
            ).add_extension(x509.BasicConstraints(ca=False, path_length=None),critical=False
            ).add_extension(x509.KeyUsage(True, True, True, True, False, False, False, False, False), critical=False
            ).add_extension(x509.ExtendedKeyUsage([ExtendedKeyUsageOID.CLIENT_AUTH, ExtendedKeyUsageOID.SERVER_AUTH]), critical=False
            ).add_extension(x509.SubjectAlternativeName(dnss),critical=False
            ).sign(private_key=self.key, algorithm=hashes.SHA256(), backend=default_backend())

        self.csrs.append(csr)
        return csr

    def dump_key(self, dir, filename, passphrase='', options='wb') -> None:
        with open(dir/filename, options) as f:
            if passphrase == '':
                encryption_algorithm = serialization.NoEncryption()
            else:
                encryption_algorithm = serialization.BestAvailableEncryption(
                    bytes(passphrase, encoding='utf8'))
            f.write(self.key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=encryption_algorithm
            ))

    def dump_cert(self, dir, filename, options='wb'):
        with open(dir/filename, options) as f:
            for cert in self.certs:
                f.write(cert.public_bytes(
                    encoding=serialization.Encoding.PEM,
                ))

    def dump_pem_cert(self, dir, filename, passphrase='', options='wb'):
        self.dump_key(dir, filename, passphrase, options)
        self.dump_cert(dir, filename, options.replace('w', 'a'))


class CertificateAuthority(KeyPairHolder):

    def __init__(self, key=None):
        if key == None:
            key = generate_key()
        self.key = key
        self.certs = []
        self.csrs = []

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

        today = datetime.utcnow()\
            .replace(hour=0, minute=0, second=0, microsecond=0)
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

    def sign_request(self, csr):
        today = datetime.utcnow()\
            .replace(hour=0, minute=0, second=0, microsecond=0)
        starts = timedelta(0)
        ends = ONE_YEAR
        ca_cert = self.get_certificate()

        cert = x509.CertificateBuilder(extensions=csr.extensions).subject_name(csr.subject
            ).issuer_name(ca_cert.subject
            ).public_key(csr.public_key()
            ).serial_number(x509.random_serial_number()
            ).not_valid_before(today+starts
            ).not_valid_after(today+ends
            ).sign(private_key=self.key, algorithm=hashes.SHA256(), backend=default_backend())

        return cert


def create_ca() -> CertificateAuthority:
    # is there a ca?
    ca = config["ca"]
    ca_context = Path(ca["context"])
    if ca_context.exists() and (ca_context / f"{ca['name']}.key").is_file() and not args.yes:
        print(f"Certificate authority's folder already exists. If you want to overwrite use '-y/--yes'")
        exit(1)

    if ca_context.exists():
        remove()

    ca_context.mkdir(parents=True, exist_ok=True)

    authority = CertificateAuthority()
    passphrase = get_passphrase(ca)

    with open(ca_context/SSL_PASSPHRASE_FILE_NAME, "wb") as f:
        f.write(bytes(passphrase, encoding='utf8'))

    authority.create_ca_cert(
        ca["cn"], ca["c"], ca["st"], ca["l"], ca["o"], ca["ou"])
    authority.dump_pem_cert(dir=ca_context, filename=f"{ca['name']}.pem",passphrase=passphrase)
    authority.dump_cert(dir=ca_context, filename=f"{ca['name']}.crt")

    return authority


def load_ca_from_pem_cert(path, passphrase=''):
    with open(path, 'rb') as f:
        data = f.read()
        f.close()
        pem_cert = x509.load_pem_x509_certificate(data, default_backend())
        if(passphrase == ''):
            passphrase = None
        pem_key = serialization.load_pem_private_key(
            data, passphrase, default_backend())
    ca = CertificateAuthority(key=pem_key)
    ca.certs.append(pem_cert)

    return ca


def remove():
    if Path(config["ca"]["context"]).exists():
        shutil.rmtree(Path(config["ca"]["context"]))
    else:
        print("No ca folder available. Nothing to do")

    return OK_STATUS


def parse_passphrase_from_file(file):
    with open(file, 'rb') as f:
        passphrase = f.read()
    return passphrase

def parse_services():
    service_names = config['services'].keys()
    if not args.all:
        args.services = list(map(str.lower, args.services))
        # so we don't recompute length of s on every iteration
        len_s = len(args.services)
        if any(args.services == list(service_names)[i:len_s+i] for i in range(len(service_names) - len_s+1)):
            services = {key: config['services'][key] for key in args.services}
            service_names = services.keys()
        else:
            print("Wrong list of services. Available services are: ["+', '.join(
                map(lambda x: '\u0027'+x+'\u0027', service_names))+"]. Exiting...")
            exit(1)
    else:
        services = config['services']

    return services,service_names


def sign_ca():

    services, service_names = parse_services()

    ca = config["ca"]
    ca_context = Path(ca["context"])
    ca_key_file = ca_context / f"{ca['name']}.pem"
    ca_passphrase_file = ca_context / "ssl_passphrase.txt"

    if args.new:
        remove()

    if not ca_context.exists():
        authority = create_ca()
    elif ca_context.exists() and ca_key_file.exists() and ca_passphrase_file.exists():
        authority = load_ca_from_pem_cert(
            ca_key_file, passphrase=parse_passphrase_from_file(ca_passphrase_file))
    else:
        print("CA cannot be created or loaded")
        exit(1)

    for name in service_names:
        service_host = f"{name}.{config['domain']['name']}"
        service = KeyPairHolder()
        ca_cert = authority.get_certificate()
        opts = services[name]
        if isinstance(ca_cert, Certificate):
            cn = name
            if "cn" in opts:
                cn = opts["cn"]
            ou = ca["ou"]
            if "ou" in opts:
                ou = opts["ou"]
            subject = Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, ca['c']),
                x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, ca['st']),
                x509.NameAttribute(NameOID.LOCALITY_NAME, ca['l']),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, ca['o']),
                x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, ou),
                x509.NameAttribute(NameOID.COMMON_NAME, cn)])
        else:
            raise TypeError("Cannot read CA subject")

        csr = service.request(subject, authority.key.public_key(), service_host, "requireBaseDNS" in opts)
        cert = authority.sign_request(csr)
        service.certs.append(cert)

        service_context = Path('.') / opts['context']
        key_dir = service_context / opts['keys']
        cert_dir = service_context / opts['certs']
        pass_dir = key_dir
        if "outpassphrase" in opts:
            pass_dir = service_context / opts["outpassphrase"]

        passphrase = get_passphrase(opts)
        with open(pass_dir/SSL_PASSPHRASE_FILE_NAME, "wb") as f:
            f.write(bytes(passphrase, encoding='utf8'))

        ssl_mode = "PEM"
        if "sslMode" in opts:
            ssl_mode = opts["sslMode"]
        if ssl_mode == "PEM":
            service.dump_pem_cert(dir=key_dir,filename=f"{service_host}.pem",passphrase=passphrase)
        else:
            service.dump_key(dir=key_dir,filename=f"{service_host}.key",passphrase=passphrase)
            service.dump_cert(dir=key_dir,filename=f"{service_host}.crt")

        authority.dump_cert(dir=cert_dir,filename=f"{ca['name']}-certificate.crt")
