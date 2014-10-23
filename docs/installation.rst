Installation
============

Firstly, you'll need to install ``django-recurrence`` from PyPI. The
easiest way to do this is with pip::

    pip install django-recurrence

Then, make sure ``recurrence`` is in your ``INSTALLED_APPS`` setting:

.. code-block:: python

    INSTALLED_APPS = (
      ...
      'recurrence',
    )

django-recurrence includes some static files (all to do with
rendering the JavaScript widget that makes handling recurring dates
easier). To ensure these are served correctly, you'll probably want
to ensure you also have ``django.contrib.staticfiles`` in your
``INSTALLED_APPS`` setting, and run::

    python manage.py collectstatic

Currently, django-recurrence supports Python 2.6, Python 2.7, Python
3.3 and Python 3.4. Python 3 support is experimental (we run our
tests against Python 3, but have not yet tried it in production).

django-recurrence works with Django from versions 1.4 to 1.7 (though
note that Django 1.4 does not support Python 3, Django 1.7 does not
support Python 2.6, and Python 3.4 is only supported with Django
1.7).
