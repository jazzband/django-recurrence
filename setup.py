import os
import sys

from setuptools import setup
from setuptools.command.test import test as TestCommand


class PyTest(TestCommand):
    def finalize_options(self):
        self.test_args = []
        self.test_suite = True

        super().finalize_options()

    def run_tests(self):
        import pytest

        errno = pytest.main(self.test_args)
        sys.exit(errno)


with open("README.md", "r") as fh:
    long_description = fh.read()


setup(
    name="django-recurrence",
    version="1.10.2",
    license="BSD",
    description="Django utility wrapping dateutil.rrule",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Tamas Kemenczy",
    author_email="tamas.kemenczy@gmail.com",
    url="https://github.com/django-recurrence/django-recurrence",
    classifiers=(
        "Development Status :: 5 - Production/Stable",
        "Environment :: Web Environment",
        "Framework :: Django",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: BSD License",
        "Operating System :: OS Independent",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
    ),
    install_requires=("Django", "pytz", "python-dateutil"),
    packages=("recurrence", "recurrence.migrations"),
    package_dir={"recurrence": "recurrence"},
    package_data={
        "recurrence": [
            os.path.join("static", "*.css"),
            os.path.join("static", "*.png"),
            os.path.join("static", "*.js"),
            os.path.join("locale", "*.po"),
            os.path.join("locale", "*.mo"),
        ]
    },
    zip_safe=False,
    include_package_data=True,
    cmdclass={"test": PyTest},
)
