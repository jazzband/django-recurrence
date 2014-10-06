# django-recurrence

django-recurrence is a utility for working with recurring dates in
Django.

It provides:

- Recurrence/Rule objects using a subset of rfc2445 (wraps
  `dateutil.rrule`) for specifying recurring date/times;
- `RecurrenceField` and `RecurrenceModelField` for storing recurring
  datetimes in the database (text/one-to-one respectively);
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
would be "every Friday".

`RecurrenceModelField` provides a Django model field which is a
one-to-one relation to recurrence information stored using the
recurrence apps model. For this to work, you'll of course need to put
the `recurrence` application into your `INSTALLED_APPS`
