.. _install:

Installation
============

Download the library
--------------------

Firstly, you'll need to install ``django-recurrence`` from PyPI. The
easiest way to do this is with pip::

    pip install django-recurrence

Then, make sure ``recurrence`` is in your ``INSTALLED_APPS`` setting:

.. code-block:: python

    INSTALLED_APPS = (
      ...
      'recurrence',
    )

Set up internationalization
---------------------------

.. note::

    If you just want to use the ``en`` translation, you can skip this
    step.

If you want to use a translation of django-recurrence other than
``en``, you'll need to ensure django-recurrence's JavaScript can
access the translation strings. This is handled with Django's built
in ``javascript_catalog`` view, which you install by adding the
following to your ``urls.py`` file:

.. code-block:: python

    # If you already have a js_info_dict dictionary, just add
    # 'recurrence' to the existing 'packages' tuple.
    js_info_dict = {
        'packages': ('recurrence', ),
    }

    # jsi18n can be anything you like here
    urlpatterns = patterns(
        '',
        (r'^jsi18n/$', 'django.views.i18n.javascript_catalog', js_info_dict),
    )


Configurating static files
--------------------------

django-recurrence includes some static files (all to do with
rendering the JavaScript widget that makes handling recurring dates
easier). To ensure these are served correctly, you'll probably want
to ensure you also have ``django.contrib.staticfiles`` in your
``INSTALLED_APPS`` setting, and run::

    python manage.py collectstatic

Supported Django and Python versions
------------------------------------

Currently, django-recurrence supports Python 2.6, Python 2.7, Python
3.3 and Python 3.4. Python 3 support is experimental (we run our
tests against Python 3, but have not yet tried it in production).

django-recurrence works with Django from versions 1.4 to 1.7 (though
note that Django 1.4 does not support Python 3, Django 1.7 does not
support Python 2.6, and Python 3.4 is only supported with Django
1.7).
