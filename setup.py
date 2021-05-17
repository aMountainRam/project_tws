#!/usr/bn/env python3
from pathlib import Path
from project_tws import ca
from test import test_ca

a =test_ca.TestCertificateAuthorityMethods()
print(a.countTestCases())
ca.load_ca_from_pem_cert(Path('./certificate-ca.pem'),b'banana')
if __name__ == "__main__":
    pass