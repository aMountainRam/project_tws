#!/usr/bin/env python3
from pathlib import Path
from project_tws import ca
from project_tws import arguments
import yaml

def main():
    try:
        config_file = open("./project_tws/config.yml.d", 'r')
        config = yaml.load(config_file, Loader=yaml.FullLoader)
        print("Key: Value")
        for key, value in config.items():
            print(f"{key}: {value}")
    except FileNotFoundError:
        print("Cannot find a configuration file")
        exit(1)

    parsed_arguments = arguments.get_parser().parse_args()
    command = parsed_arguments.command
    subcommand = parsed_arguments.subcommand
    if(command == 'ca'):
        if(subcommand == 'remove'):
            ca.remove()
        if(subcommand == 'create'):
            ca.setup(parsed_arguments)
            ca.create_ca(config)
        elif(subcommand == 'sign'):
            pass
        else:
            exit(0)
    else:
        exit(0)

if __name__ == "__main__":
    main()