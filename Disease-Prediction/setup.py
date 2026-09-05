'''
the setup.py file is an essential part of packaging and 
distributing python projects.It is used by setup tools to
define the configuration of your projects ,such as its metadata and dependencies, and more'''

from setuptools import find_packages,setup
from typing import List

requirement_lst:List[str]=[]
def get_requirements()->List[str]:
    '''
    this function will return list of requirements
    '''
    try:
        with open('requirements.txt','r') as file:
            lines=file.readlines()

            for line in lines:
                requirement=line.strip()

                if requirement and requirement!= '-e .':
                    requirement_lst.append(requirement)
    except FileNotFoundError:
        print("requirements.txt file not found")

    return requirement_lst

setup(
    name="DiseasePrediction",
    version="0.0.1",
    author="srivatsav",
    author_email="srivatsavreddy17@gmail.com",
    packages=find_packages(),
    install_requires=get_requirements()
)
    