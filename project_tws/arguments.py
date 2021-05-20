import argparse


def get_parser():
    parser = argparse.ArgumentParser(
        prog='setup', description='Project TwS setup routine', epilog='@amountainram')

    # setup
    subparsers = parser.add_subparsers(dest='command', help='sub-command help')

    # setup ca
    parser_ca = subparsers.add_parser(
        'ca', help='setup of the certificate authority')
    subparsers_ca = parser_ca.add_subparsers(dest='subcommand', help='ca sub-command help')

    # setup ca remove
    parser_ca_remove = subparsers_ca.add_parser(
        'remove', help='remove certificate authority folder')

    # setup ca create [--keep] [-y/--yes]
    parser_ca_create = subparsers_ca.add_parser(
        'create', help='create a new certificate authority')
    parser_ca_create.add_argument('--remove', action='store_true',
                                  help='remove the certificate authority after setup is done')
    parser_ca_create.add_argument(
        '-y', '--yes', action='store_true', help='overwrite an existing ca')
    # setup ca sign [-a/--all] [-y/--yes] [...]
    parser_ca_sign = subparsers_ca.add_parser(
        'sign', help='signs certificates to selected services')
    parser_ca_sign.add_argument('--remove', action='store_true',
                                  help='remove the certificate authority after setup is done')
    parser_ca_sign.add_argument(
        '-y', '--yes', action='store_true', help='overwrite existing certificates and keys')
    parser_ca_sign.add_argument('-c', '--config', type=argparse.FileType(
        'r', encoding='UTF-8'), default='./project_tws/config.json.d')
    group_sign = parser_ca_sign.add_mutually_exclusive_group(required=True)
    group_sign.add_argument('-a', '--all', action='store_true')
    group_sign.add_argument('-s', '--services', nargs='+', type=str)

    return parser
