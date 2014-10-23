Usage
=====

Once you've :ref:`installed django-recurrence <install>`, the most common use case
is adding a field to a model, which can be done like this:

.. code-block:: python

    from recurrence.fields import RecurrenceField

    class Course(models.Model):
        title = models.CharField(max_length=200)
        recurrences = RecurrenceField()


If you use the ``Course`` model in Django's administrative interface,
or in any forms, it should be rendered with a pretty form field,
which makes selecting relatively complex recurrence patterns easy.

.. figure:: _static/admin.png
   :alt: The form field for recurrence fields

Using ``RecurrenceField``
-------------------------

Once you've created a model with a ``RecurrenceField``, you'll
probably want to use it to figure out what dates are involved in a
particular recurrence pattern.

The easiest way to do this is with ``between``, which can be used
like this (using the ``Course`` model from above):

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
