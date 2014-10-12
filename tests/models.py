from django.db import models
from recurrence.fields import RecurrenceField


class EventWithNoNulls(models.Model):
    recurs = RecurrenceField(null=False)


class EventWithNulls(models.Model):
    recurs = RecurrenceField(null=True)
