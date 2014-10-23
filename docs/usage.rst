Usage
=====

Once you've installed django-recurrence, the most common use case
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
