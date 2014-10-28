Usage
=====

Getting started
---------------

Once you've :ref:`installed django-recurrence <install>`, you'll
generally want to start by using it in one of your models, which can
be done like this:

.. code-block:: python
    :emphasize-lines: 5

    from recurrence.fields import RecurrenceField

    class Course(models.Model):
        title = models.CharField(max_length=200)
        recurrences = RecurrenceField()

If you use the ``Course`` model in Django's administrative interface,
or in any forms, it should be rendered with a pretty form field,
which makes selecting relatively complex recurrence patterns easy.

.. figure:: admin.png
   :alt: The form field for recurrence fields

Using this form it's possible to specify relatively complex
recurrence rules - such as an event that happens every third Thursday
of the month, unless that Thursday happens to be the 21st of the
month, and so on.

Using ``RecurrenceField``
-------------------------

Getting dates that match a pattern
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Once you've created a model with a ``RecurrenceField``, you'll
probably want to use it to figure out what dates are involved in a
particular recurrence pattern.

The easiest way to do this is with ``between``, which takes two dates
(the start and end date), and can be used like this (using the
``Course`` model from above):

.. code-block:: python

   from datetime import datetime
   from myapp.models import Course


   course = Course.objects.get(pk=1)
   course.recurrences.between(
       datetime(2010, 1, 1, 0, 0, 0),
       datetime(2014, 12, 31, 0, 0, 0)
   )

This won't include occurrences if they occur on the start and end
dates specified. If you want to include those, pass in ``inc`` like
this:

.. code-block:: python

   course.recurrences.between(
       datetime(2010, 1, 1, 0, 0, 0),
       datetime(2014, 12, 31, 0, 0, 0),
       inc=True
   )

Getting textual descriptions of patterns
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Recurrence patterns can have multiple rules for inclusion (e.g. every
week, on a Tuesday) and exclusion (e.g. except when it's the first
Tuesday of the month), together with specific dates to include or
exclude (regardless of whether they're part of the inclusion or
exclusion rules).

You'll often want to display a simple textual description of the
rules involved.

To take our ``Course`` example again, you can get access to the
relevant inclusion rules by accessing the ``rrules`` member of the
``RecurrenceField`` attribute of your model (called ``recurrences``
in our example, though you can call it whatever you like), and to the
exclusion rules by accessing the ``exrules`` member. From there you
can get textual descriptions, like this:


.. code-block:: python

   course = Course.objects.get(pk=1)
   text_rules_inclusion = []

   for rule in course.recurrences.rrules:
       text_rules_inclusion.append(rule.to_text())

Similar code would work equally well for ``exrules``.
