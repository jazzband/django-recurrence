Generating Recurrences Programmatically
---------------------------------------

.. contents::
   :local:

``Rule`` and ``Recurrence``
^^^^^^^^^^^^^^^^^^^^^^^^^^^

To create recurrence objects, the two main classes you'll need are
``Rule`` and ``Recurrence``.

``Rule`` specifies a single rule (e.g. "every third Friday of the
month"), and a ``Recurrence`` is a collection of rules (some of which
may be inclusion rules, others of which may be exclusion rules),
together with date limits, and other configuration parameters.

For example:

.. code-block:: python

    from datetime import datetime
    import recurrence


    myrule = recurrence.Rule(
        recurrence.DAILY
    )

    pattern = recurrence.Recurrence(
        dtstart=datetime(2014, 1, 2, 0, 0, 0),
        dtend=datetime(2014, 1, 3, 0, 0, 0),
        rrules=[myrule, ]
    )

You can then generate a set of recurrences for that recurrence
pattern, like this::

    >>> list(mypattern.occurrences())
    [datetime.datetime(2014, 1, 2, 0, 0), datetime.datetime(2014, 1, 3, 0, 0)]

Exclusion Rules
^^^^^^^^^^^^^^^

You can specify exclusion rules too, which are exactly the same as
inclusion rules, but they represent rules which match dates which
should *not* be included in the list of occurrences. Inclusion rules
are provided to the ``Recurrence`` object using the kwarg ``rrules``,
and exclusion rules are provided to the ``Recurrence`` object using
the kwargs ``exrules``.

Adding or Excluding Individual Dates
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Similarly, you can specify individual dates to include or exclude
using ``rdates`` and ``exdates``, both of which should be a list of
``datetime.datetime`` objects.

.. code-block:: python

    from datetime import datetime
    import recurrence

    pattern = recurrence.Recurrence(
        rdates=[
            datetime(2014, 1, 1, 0, 0, 0),
            datetime(2014, 1, 2, 0, 0, 0),
        ]
    )
