Changelog
=========

1.4.0
-----

* Improve our testing setup to also cover Python 3.5;
* Fixes for Django 1.10 (:issue:`69`).

1.3.1
-----

* Add Basque translations (:issue:`67`).

1.3.0
-----

* Drop official support for Django 1.4, Django 1.5, Django 1.6 and
  Python 2.6 (no changes have been made to deliberately break older
  versions, but older versions will not be tested going forward);
* Add official support for Django 1.8 and Django 1.9 (:issue:`62`);
* Fix for a bug in ``Rule`` creation where the weekday parameter is
  an instance of ``Weekday`` rather than an integer (:issue:`57`).

1.2.0
-----

* Added an option for events to occur on the fourth of a given
  weekday of the month (:issue:`29`);
* Fixed an off-by-one bug in the ``to_text`` method for events
  happening on a regular month each year (:issue:`30`);
* Fixed a bug in the JavaScript widget where the date for monthly
  events on a fixed date of the month had the description rendered
  incorrectly if the day selected was more than the number of days in
  the current calendar month (:issue:`31`);
* Added a French translation (:issue:`32`) - this may be backwards
  incompatible if have overriden the widget JavaScript such that
  there is no ``language_code`` member of your recurrence object;
* Added a Spanish translation (:issue:`49`);
* Added database migrations - running ``python manage.py migrate
  recurrence --fake`` should be sufficient for this version - nothing
  has changed about the database schema between 1.1.0 and 1.2.0;
* Fix broken tests for Django 1.4.

1.1.0
-----

* Added experimental Python 3 support.
* Added extensive test coverage (from 0% to 81%).
* Added documentation (including this changelog).
* Removed ``RecurrenceModelField`` and ``RecurrenceModelDescriptor``,
  which don't appear to have worked as expected for some time.
* Fixed a bug introduced in 1.0.3 which prevented the
  django-recurrence JavaScript from working (:issue:`27`).
* Don't raise ``ValueError`` if you save ``None`` into a
  ``RecurrenceField`` with ``null=False`` (:issue:`22`), for
  consistency with other field types.
* Make sure an empty recurrence object is falsey (:issue:`25`).
* Fix a copy-paste error in ``to_recurrence_object`` which prevented
  exclusion rules from being populated correctly.
* Fix a typo in ``create_from_recurrence_object`` which prevented it
  working with inclusion or exclusion rules.
* Various other very minor bugfixes.
