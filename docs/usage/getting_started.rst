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


Form Usage
----------------------

.. code-block:: python

   from django import forms
   from .models import Course

   class CourseForm(forms.ModelForm):
      class Meta:
         model = Course
         fields = ('title', 'recurrences',)

.. note::

   Be sure to add ``{{ form.media }}`` to your template or
   statically link recurrence.css and recurrence.js.

.. code-block:: html


   <form method="POST" class="post-form">
       {% csrf_token %}
       {{ form.media }}
       {{ form }}
       <button type="submit">Submit</button>
   </form>
