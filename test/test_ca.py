import argparse
from datetime import datetime, timedelta
import pathlib
import unittest
from assertpy import assert_that
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from project_tws import ca
import tempfile
from pathlib import Path


class Testing(unittest.TestCase):

    def setUp(self) -> None:
        self.test_dir = tempfile.TemporaryDirectory()
        args = argparse.Namespace()
        setattr(args, "yes", True)
        ca.setup(a=args, c={"ca": {"context": self.test_dir.name,
                 "name": "ca", "cn": "commonName", "c": "AA", "st":"AA","l":"Loc","o":"Org","ou":""}})
        return super().setUp()

    def tearDown(self) -> None:
        self.test_dir.cleanup()
        return super().tearDown()

    def get_key_bytes(self,key):
        return key.private_bytes(encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,encryption_algorithm = serialization.NoEncryption())

    def test_create_a_certificate_authority(self):
        my_ca = ca.create_ca()
        assert_that(my_ca.certs).is_length(1)
        assert_that(list(Path(self.test_dir.name).glob('*'))).is_length(3)

    def test_sign_certificate_and_expiration_dates(self):
        """TEST: sign certificate and check the expiration dates
        It should create a certificate within the given CA context. Such certificate must have proper
        start and exipration time.
        Likewise another certificate is create with a different lifespan.
        Lifespan must check out.
        """
        cn = "commonName"
        c = "AA"
        my_ca = ca.create_ca()
        assert_that(my_ca.certs).is_length(1)
        today = datetime.today().replace(microsecond=0)
        cert = my_ca.certs[0]
        assert_that(cert.not_valid_after).is_equal_to(
            today + timedelta(365, 0, 0))
        assert_that(cert.not_valid_before).is_equal_to(today)

        short_cert = my_ca.create_ca_cert(
            cn, c, starts=timedelta(days=1), ends=timedelta(days=1))
        assert_that(short_cert.not_valid_after).is_equal_to(
            today + timedelta(days=1))
        assert_that(short_cert.not_valid_before).is_equal_to(
            today.replace(day=today.day+1))

    def test_create_ca_then_load(self):
        my_ca = ca.create_ca()
        loaded_ca = ca.load_ca_from_pem_cert(Path(self.test_dir.name) / "ca.pem",passphrase=ca.parse_passphrase_from_file(Path(self.test_dir.name)/"ssl_passphrase.txt"))
        assert_that(self.get_key_bytes(my_ca.key)).is_equal_to(self.get_key_bytes(loaded_ca.key))

if __name__ == '__main__':
    unittest.main()
