from datetime import datetime, timedelta
import unittest
import base64
from assertpy import assert_that
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPrivateKey
from project_tws import ca

class Testing(unittest.TestCase):

    def test_create_a_certificate_authority(self):
        my_ca = ca.create_ca()
        assert_that(my_ca.certs).is_empty()

    def test_sign_certificate(self):
        cn = "commonName"
        c = "AA"
        my_ca = ca.create_ca()
        cert = my_ca.create_ca_cert(cn,c)
        assert_that(my_ca.certs).is_length(1)
        today = datetime.today().replace(microsecond=0)
        assert_that(cert.not_valid_after).is_equal_to(today + timedelta(365,0,0))
        assert_that(cert.not_valid_before).is_equal_to(today)

        short_cert = my_ca.create_ca_cert(cn,c,starts=timedelta(days=1),ends=timedelta(days=1))
        assert_that(short_cert.not_valid_after).is_equal_to(today + timedelta(days=1))
        assert_that(short_cert.not_valid_before).is_equal_to(today.replace(day=today.day+1))

if __name__ == '__main__':
    unittest.main()