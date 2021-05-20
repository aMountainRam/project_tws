#!/usr/bin/env python3
from pathlib import Path
from project_tws import ca
from project_tws import arguments
import yaml

def run():
    parsed_arguments = arguments.get_parser().parse_args()
    try:
        config = yaml.load(parsed_arguments.config, Loader=yaml.FullLoader)
    except FileNotFoundError:
        print("Cannot find a configuration file")
        exit(1)

    command = parsed_arguments.command
    subcommand = parsed_arguments.subcommand

    if(command == 'ca'):
        ca.setup(parsed_arguments,config)
        if(subcommand == 'remove'):
            ca.remove()
        if(subcommand == 'create'):
            ca.create_ca()
        elif(subcommand == 'sign'):
            ca.sign_ca()

    if parsed_arguments.remove:
        ca.remove()

    exit(0)

if __name__ == "__main__":
    run()