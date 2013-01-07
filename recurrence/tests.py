from django.db import models
from recurrence.fields import RecurrenceField
import unittest


class EventWithNoNulls(models.Model):
    recurs = RecurrenceField(null=False)


class EventWithNulls(models.Model):
    recurs = RecurrenceField(null=True)


class RecurrenceTestCase(unittest.TestCase):
    def test_recurs_can_be_explicitly_none_if_none_is_allowed(self):
        # Check we can save None correctly
        event = EventWithNulls.objects.create(recurs=None)
        self.assertEqual(event.recurs, None)

        # Check we can deserialize None correctly
        reloaded = EventWithNulls.objects.get(pk=event.pk)
        self.assertEqual(reloaded.recurs, None)

    def test_recurs_cannot_be_explicitly_none_if_none_is_disallowed(self):
        with self.assertRaises(ValueError):
            EventWithNoNulls.objects.create(recurs=None)
