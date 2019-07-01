import os
import sys

try:
    from setuptools import setup

    has_setuptools = True
except ImportError:
    from distutils.core import setup

    has_setuptools = False


if has_setuptools:
    from setuptools.command.test import test as TestCommand

    class PyTest(TestCommand):
        def finalize_options(self):
            TestCommand.finalize_options(self)
            self.test_args = []
            self.test_suite = True

        def run_tests(self):
            import pytest

            errno = pytest.main(self.test_args)
            sys.exit(errno)

    setup_options = dict(
        install_requires=("pytz", "python-dateutil"),
        zip_safe=False,
        include_package_data=True,
        cmdclass={"test": PyTest},
    )
else:
    setup_options = dict(requires=("pytz", "python_dateutil"))

with open("README.md", "r") as fh:
    long_description = fh.read()


setup(
    name="django-recurrence",
    version="1.9.1",
    license="BSD",
    description="Django utility wrapping dateutil.rrule",
    long_description=long_description,
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
        "Programming Language :: Python :: 2",
        "Programming Language :: Python :: 2.7",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
    ),
    requires=("Django", "pytz", "python_dateutil"),
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
    **setup_options
)
