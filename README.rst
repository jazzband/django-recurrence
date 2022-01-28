
django-recurrence
=================

.. image:: https://jazzband.co/static/img/badge.svg
   :target: https://jazzband.co/
   :alt: Jazzband

.. image:: https://img.shields.io/github/stars/jazzband/django-recurrence.svg?label=Stars&style=socialcA
   :target: https://github.com/jazzband/django-recurrence
   :alt: GitHub

.. image:: https://img.shields.io/pypi/v/django-recurrence.svg
   :target: https://pypi.org/project/django-recurrence/
   :alt: PyPI release

.. image:: https://img.shields.io/pypi/pyversions/django-recurrence.svg
   :target: https://pypi.org/project/django-recurrence/
   :alt: Supported Python versions

.. image:: https://img.shields.io/pypi/djversions/django-recurrence.svg
   :target: https://pypi.org/project/django-recurrence/
   :alt: Supported Django versions

.. image:: https://img.shields.io/readthedocs/django-recurrence.svg
   :target: https://django-recurrence.readthedocs.io/
   :alt: Documentation

.. image:: https://github.com/jazzband/django-recurrence/workflows/Test/badge.svg
   :target: https://github.com/jazzband/django-recurrence/actions
   :alt: GitHub actions

.. image:: https://codecov.io/gh/jazzband/django-recurrence/branch/master/graph/badge.svg
   :target: https://codecov.io/gh/jazzband/django-recurrence
   :alt: Coverage


django-recurrence is a utility for working with recurring dates in Django.


Functionality
-------------

* Recurrence/Rule objects using a subset of rfc2445
  (wraps ``dateutil.rrule``) for specifying recurring date/times,
* ``RecurrenceField`` for storing recurring datetimes in the database, and
* JavaScript widget.

``RecurrenceField`` provides a Django model field which serializes
recurrence information for storage in the database.

For example - say you were storing information about a university course
in your app. You could use a model like this:

.. code:: python

   import recurrence.fields

   class Course(models.Model):
       title = models.CharField(max_length=200)
       start = models.TimeField()
       end = models.TimeField()
       recurrences = recurrence.fields.RecurrenceField()

You’ll notice that I’m storing my own start and end time.
The recurrence field only deals with *recurrences*
not with specific time information.
I have an event that starts at 2pm.
Its recurrences would be “every Friday”.


Documentation
-------------

For more information on installation and configuration see the documentation at:

https://django-recurrence.readthedocs.io/


Issues
------

If you have questions or have trouble using the app please file a bug report at:

https://github.com/jazzband/django-recurrence/issues


Contributions
-------------

All contributions are welcome!

It is best to separate proposed changes and PRs into small, distinct patches
by type so that they can be merged faster into upstream and released quicker.

One way to organize contributions would be to separate PRs for e.g.

* bugfixes,
* new features,
* code and design improvements,
* documentation improvements, or
* tooling and CI improvements.

Merging contributions requires passing the checks configured
with the CI. This includes running tests and linters successfully
on the currently officially supported Python and Django versions.

The test automation is run automatically with GitHub Actions, but you can
run it locally with the ``tox`` command before pushing commits.

This is a `Jazzband <https://jazzband.co>`_ project. By contributing you agree to abide by the `Contributor Code of Conduct <https://jazzband.co/about/conduct>`_ and follow the `guidelines <https://jazzband.co/about/guidelines>`_.
