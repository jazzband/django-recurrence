Contributing
============

Contributions to django-recurrence are very welcome - whether in the
form of bug reports, feature requests, or patches. Bug reports and
feature requests are tracked on our `GitHub issues page
<https://github.com/django-recurrence/django-recurrence/issues>`_.

If you want to make changes to django-recurrence, you'll need to fork
our GitHub repository, make any changes you want, and send us a pull
request. Feel free to `file an issue
<https://github.com/django-recurrence/django-recurrence/issues>`_ if
you want help getting set up.

Running the tests
-----------------

The easiest way to run the tests is to run::

    make testall

from the root of your local copy of the django-recurrence
repository. This will require that you have tox installed. If you
don't have tox installed, you can install it with ``pip install
tox``. Running all the tests also requires that you have Python 2.6,
Python 2.7, Python 3.3 and Python 3.4 installed locally.

This will run tests against all supported Python and Django versions,
check the documentation can be built, and will also run ``flake8``,
an automated code-linting tool.

If that sounds like too much work, feel free to just run tests on
whatever your local version of Python is. You can do this by
running::

    pip install -r requirements_test.txt  ! You only need to run this once
    make test

If you want to see what our code coverage is like, install everything
in ``requirements_test.txt`` (as shown above), then run::

    make coverage

Working with the documentation
------------------------------

Our documentation is written with Sphinx, and can be built using::

    tox -e docs

Once this command is run, it'll print out the folder the generated
HTML documentation is available in.
