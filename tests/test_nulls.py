from tests.models import EventWithNulls, EventWithNoNulls
import pytest
import unittest


class RecurrenceTestCase(unittest.TestCase):
    @pytest.mark.django_db
    def test_recurs_can_be_explicitly_none_if_none_is_allowed(self):
        # Check we can save None correctly
        event = EventWithNulls.objects.create(recurs=None)
        self.assertEqual(event.recurs, None)

        # Check we can deserialize None correctly
        reloaded = EventWithNulls.objects.get(pk=event.pk)
        self.assertEqual(reloaded.recurs, None)

    @pytest.mark.django_db
    def test_recurs_cannot_be_explicitly_none_if_none_is_disallowed(self):
        with self.assertRaises(ValueError):
            EventWithNoNulls.objects.create(recurs=None)
