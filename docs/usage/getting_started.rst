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
