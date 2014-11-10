Changelog
=========

1.1.1
-----

* Added an option for events to occur on the fourth of a given
  weekday of the month (#29);
* Fixed an off-by-one bug in the ``to_text`` method for events
  happening on a regular month each year (#30).

1.1.0
-----

* Added experimental Python 3 support.
* Added extensive test coverage (from 0% to 81%).
* Added documentation (including this changelog).
* Removed ``RecurrenceModelField`` and ``RecurrenceModelDescriptor``,
  which don't appear to have worked as expected for some time.
* Fixed a bug introduced in 1.0.3 which prevented the
  django-recurrence JavaScript from working (#27).
* Don't raise ``ValueError`` if you save ``None`` into a
  ``RecurrenceField`` with ``null=False`` (#22), for consistency with
  other field types.
* Make sure an empty recurrence object is falsey (#25).
* Fix a copy-paste error in ``to_recurrence_object`` which prevented
  exclusion rules from being populated correctly.
* Fix a typo in ``create_from_recurrence_object`` which prevented it
  working with inclusion or exclusion rules.
* Various other very minor bugfixes.
