Changelog
=========

1.8.0 (Pending)
---------------

* Fixes for timezone support (:issue:`130`);
* Improvements to avoid inline styles (:issue:`85`).


1.7.0
-----

* Drop official support for Django versions 1.7, 1.8, 1.9, 1.10;
* Fixes for saving ``None`` into a ``RecurrenceField`` causing a
  ``TypeError`` (:issue:`89`, :issue:`122`);
* Drop official support for Python 3.3 and Python 3.4;
* Provisional support for Python 3.7 (only for Django 2.0 and up);
* Ensure use of ``render`` on Django widgets always passes the
  ``renderer`` argument, to ensure support for Django 2.1
  (:issue:`125`);
* Django 2.0 compatibility fix for usage of django-recurrence with
  Django REST framework (:issue:`126`).

1.6.0
-----

* Fixes for Python 3 (:issue:`105`);
* Support for Django 2.0 (:issue:`109`, :issue:`110`);
* Switch back a couple of instances of ``DeserializationError`` to
  ``ValidationError`` (:issue:`111`);
* Switch around how we set dates in the date selector widget to avoid
  issues with short months (:issue:`113`).

1.5.0
-----

* Add Slovakian translations (:issue:`98`);
* Add support for events occurring at a fixed point before the
  end of the month - e.g. the second last Tuesday before the end of
  the month (:issue:`88`);
* Add minor style changes to make django-recurrence compatible with
  Wagtail (:issue:`100`);
* Allow changing the behaviour of generating recurrences on
  ``dtstart`` by default. You can opt in to this by setting
  ``include_dtstart=False`` on your ``RecurrenceField``
  (:issue:`93`);
* Ensure broken values raise ``DeserializationError`` where expected
  (:issue:`103`).

1.4.1
-----

* Make PO-Revision-Date parseable by babel (:issue:`75`);
* Update installation notes to cover Django 1.10 (:issue:`74`);
* Add German translation (:issue:`77`);
* Add Brazilian translation (:issue:`79`);
* Ensure the migrations are included when installing (:issue:`78`);
* Fix order of arguments to `to_dateutil_rruleset` (:issue:`81`).

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
