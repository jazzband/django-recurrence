.. _install:

Installation
============

.. contents::
   :local:


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

Supported Django and Python versions
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Currently, django-recurrence supports Python 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, and 3.12.

django-recurrence is currently tested with django 2.2, 3.2, 4.0, 4.1, 4.2, and 5.0

Set up internationalization
---------------------------

.. note::

    This step is currently mandatory, but may be bypassed with an
    extra bit of javascript. See :issue:`47` for details.

Using a translation of django-recurrence other than
``en`` requires that django-recurrence's JavaScript can
access the translation strings. This is handled with Django's built
in ``javascript_catalog`` view, which you must install by adding the
following to your project ``urls.py`` file:

.. code-block:: python

    import django
    from django.urls import path
    from django.views.i18n import JavaScriptCatalog

    # Your normal URLs here...

    # If you already have a js_info_dict dictionary, just add
    # 'recurrence' to the existing 'packages' tuple.
    js_info_dict = {
        'packages': ('recurrence', ),
    }

    # jsi18n can be anything you like here
    urlpatterns += [
        url('jsi18n/', JavaScriptCatalog.as_view(), js_info_dict),
    ]


Configure static files
----------------------

django-recurrence includes some static files (all to do with
rendering the JavaScript widget that makes handling recurring dates
easier). To ensure these are served correctly, you'll probably want
to ensure you also have ``django.contrib.staticfiles`` in your
``INSTALLED_APPS`` setting, and run::

    python manage.py collectstatic

.. note::
   After collecting static files, you can use ``{{ form.media }}`` to
   include recurrence's static files within your templates.
