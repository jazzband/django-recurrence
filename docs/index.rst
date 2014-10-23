django-recurrence
*****************

django-recurrence is a utility for working with recurring dates in
Django.

It provides:

- Recurrence/Rule objects using a subset of rfc2445 (wraps
  ``dateutil.rrule``) for specifying recurring date/times;
- ``RecurrenceField`` and ``RecurrenceModelField`` for storing
  recurring datetimes in the database (text/one-to-one respectively);
- a JavaScript widget.

Contents
--------

.. toctree::
   :maxdepth: 2

   installation
   usage
   contributing
   changelog
