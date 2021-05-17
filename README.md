## Setup
A python script **setup.py** is provided with requirements
**requirements.txt** to setup
a virtual environment. The script can be invoked as
```console
$ python3 setup.py
```
Tests are as well provided into the *config* package and can be run via
```console
$ python3 -m unittest discover -s config -p *_tests.py
```