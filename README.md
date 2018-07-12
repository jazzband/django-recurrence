# django-recurrence

[![Build Status](https://travis-ci.org/django-recurrence/django-recurrence.svg?branch=master)](https://travis-ci.org/django-recurrence/django-recurrence)

django-recurrence is a utility for working with recurring dates in
Django. Documentation is available at
https://django-recurrence.readthedocs.org/.

It provides:

- Recurrence/Rule objects using a subset of rfc2445 (wraps
  `dateutil.rrule`) for specifying recurring date/times;
- `RecurrenceField` for storing recurring datetimes in the database;
- JavaScript widget.

`RecurrenceField` provides a Django model field which serializes
recurrence information for storage in the database.

For example - say you were storing information about a university
course in your app. You could use a model like this:

```python
import recurrence.fields

class Course(models.Model):
    title = models.CharField(max_length=200)
    start = models.TimeField()
    end = models.TimeField()
    recurrences = recurrence.fields.RecurrenceField()
```

You'll notice that I'm storing my own start and end time. The
recurrence field only deals with _recurrences_ not with specific time
information. I have an event that starts at 2pm. Its recurrences
would be "every Friday". For this to work, you'll need to put the
`recurrence` application into your `INSTALLED_APPS`

## Running the tests

Our test coverage is currently fairly poor (we're working on it!),
but you can run the tests by making sure you've got the test
requirements installed:

    pip install -r requirements_test.txt

Once you've done that, you can run the tests using:

    make test

You can generate a coverage report by running:

    make coverage

You can run tests on multiple versions of Python and Django by
installing tox (`pip install tox`) and running:

    tox
