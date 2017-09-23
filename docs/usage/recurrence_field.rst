Using ``RecurrenceField``
-------------------------

.. _between:

Getting occurrences between two dates
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Once you've created a model with a ``RecurrenceField``, you'll
probably want to use it to figure out what dates are involved in a
particular recurrence pattern.

.. note::

   Whether you want to use ``between`` or :ref:`occurrences
   <occurrences>` will depend on what sort of rules you're dealing
   with. In reality, a model like `Course` probably has rules like
   "every Thursday for 10 weeks", so ``occurrences`` will work fine,
   since the rules have natural limits. For other uses (e.g. find me
   every date this year for a club that runs every Wednesday), you'll
   want to use ``between``.

``between`` takes two dates (the start and end date), and returns a list
of ``datetime`` objects matching the recurrence pattern between those
dates. It is used like this (using the ``Course`` model from above):

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

.. warning::

   Slightly confusingly, ``between`` will only return you dates after
   the current date, if used as above (provided those dates fall
   between the two first parameters to ``between``). Read on for how
   to get all the occurrences between two dates.

To get all the occurrences between two dates (including dates that
are *before* the current time, but *after* the provided start date),
you'll also need to set ``dtstart``, like this:

.. code-block:: python

   course.recurrences.between(
       datetime(2010, 1, 1, 0, 0, 0),
       datetime(2014, 12, 31, 0, 0, 0),
       dtstart=datetime(2010, 1, 1, 0, 0, 0),
       inc=True
   )

That will get you all occurrences between 1st January 2010, and 31st
December 2014, including any occurrences on 1st January 2010 and 31st
December 2014, if your recurrence pattern matches those dates.

The effective starting date for any recurrence pattern is essentially
the later of the first argument and ``dtstart``. To minimize
confusion, you probably want to set them both to the same value.

.. warning::

   Note that per default ``dtstart`` will be the first occurence in
   your list if specified, according to RFC 2445. This practice
   deviates from how ``dateutil.rrule`` handles ``dtstart`` and can
   therefore lead to confusion. Read on for how you can control this
   behavior for your own recurrence patterns.

To switch off the automatic inclusion of ``dtstart`` into the
occurence list, set ``include_dtstart=False`` as an argument for the
``RecurrenceField`` whose behavior you want to change:

.. code-block:: python
    :emphasize-lines: 3

    class Course(models.Model):
        title = models.CharField(max_length=200)
        recurrences = RecurrenceField(include_dtstart=False)

With this change any ``dtstart`` value will only be an occurence if
it matches the pattern specified in ``recurrences``. This also works
for instantiating ``Recurrence`` objects directly:

.. code-block:: python
    :emphasize-lines: 3

    pattern = recurrence.Recurrence(
       rrules=[recurrence.Rule(recurrence.WEEKLY, byday=recurrence.MONDAY)],
       include_dtstart=False).between(
          datetime(2010, 1, 1, 0, 0, 0),
          datetime(2014, 12, 31, 0, 0, 0),
          dtstart=datetime(2010, 1, 1, 0, 0, 0),
          inc=True
       )
    )

.. _occurrences:

Getting all occurrences
^^^^^^^^^^^^^^^^^^^^^^^

``occurrences`` is particularly useful where your recurrence pattern
is limited by the rules generating occurrences (e.g. "every Tuesday
for 10 weeks", or "every Tuesday until 23rd April 2014").

You can get a generator which you can iterate over to get all
occurrences using ``occurrences``:

.. code-block:: python

   dates = course.recurrences.occurrences()

You can optionally provide ``dtstart`` to specify the first
occurrence, and ``dtend`` to specify the final occurrence.

You can index into the returned object, to (for example) get the
first session of our course model:

.. code-block:: python

   dates = course.recurrences.occurrences()
   first_instance = dates[0]

.. warning::

   Looping over the entire generator returned by example above might
   be extremely slow and resource hungry if ``dtstart`` or ``dtend``
   are not provided. Without ``dtstart``, we implicitly are looking
   for occurrences after the current date. Without ``dtend``, we'll
   look for all occurrences up to (and including) the year 9999,
   which is probably not what you want. The the code above counts all
   occurrences of our course from tomorrow until 31st December, 9999.

.. _count:

Counting occurrences
^^^^^^^^^^^^^^^^^^^^

The function ``count`` works fairly similarly:

.. code-block:: python

   course.recurrences.count()

It is roughly equivalent to:

.. code-block:: python

   len(list(course.recurrences.occurrences()))

Note the warning in :ref:`occurrences <occurrences>` before using
``count`` (or converting the generator returned by ``occurrences()``
to a list), if you are not providing both ``dtstart`` and ``dtend``.

.. _afterbefore:

Getting the next or previous occurrences
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If you want to get the next or previous occurrence in a given
pattern, you can use ``after`` or ``before``, respectively. As with
``between``, you can choose whether you want to be inclusive of the
``datetime`` passed in by setting ``inc``. If no next or previous
occurrence exists, ``None`` is returned.

.. code-block:: python

   course = Course.objects.get(pk=1)

   # Get the first course on or after 1st January 2010 (this won't do
   # quite what you expect)
   course.recurrences.after(
       datetime(2010, 1, 1, 0, 0, 0),
       inc=True
   )

As with ``between``, if you don't specify a ``dtstart``, it will
implicitly be the current time, so the above code will, to be more
precise, give you the first course on or after 1st January 2010, or
on or after the current date, whichever is later. Since you probably
don't want that behaviour, you'll probably want to specify
``dtstart``, as follows:

.. code-block:: python

   course = Course.objects.get(pk=1)

   # Get the first course on or after 1st January 2010
   course.recurrences.after(
       datetime(2010, 1, 1, 0, 0, 0),
       inc=True,
       dtstart=datetime(2010, 1, 1, 0, 0, 0),
   )

For similar reasons, using ``before`` really requires that
``dtstart`` is provided, to give a start date to the recurrence
pattern. This makes some sense if you consider a recurrence pattern
like "every Monday, occurring 5 times". Without ``dtstart``, it's
unclear what ``before`` should return - since it's impossible to know
whether the pattern has started, and if so when. For example, if it
started 5 years ago, ``before`` should return a date approximately 5
years ago, whereas if it started two weeks ago, ``before`` should
return the last ``Monday`` (or the provided date, if ``inc`` is True,
and the provided date is a Monday).

.. _to-text:

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
