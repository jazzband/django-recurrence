"""Test timezone aware recurrence date times."""

from datetime import datetime
import pytz

from django.test import TestCase
from django.test import override_settings

import recurrence
from recurrence import Recurrence, Rule
from recurrence.forms import RecurrenceField
from tests.models import EventWithNoNulls


@override_settings(RECURRENCE_USE_TZ=True, USE_TZ=True)
class FieldTest(TestCase):

    def test_strip_dtstart_and_dtend_if_required(self):
        """Test that naive datetimes will get converted to UTC and returned as UTC."""
        rule = Rule(
            recurrence.WEEKLY
        )

        limits = Recurrence(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
            dtend=datetime(2014, 2, 3, 0, 0, 0),
            rrules=[rule]
        )

        value = recurrence.serialize(limits)

        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.rrules == [rule]
        assert cleaned_value.dtstart == datetime(2014, 1, 1, 0, 0, 0, tzinfo=pytz.utc)
        assert cleaned_value.dtend == datetime(2014, 2, 3, 0, 0, 0, tzinfo=pytz.utc)

        field = RecurrenceField(accept_dtstart=False, accept_dtend=False)
        cleaned_value = field.clean(value)
        assert cleaned_value != limits
        assert cleaned_value.dtstart is None
        assert cleaned_value.dtend is None

    def test_dt_start_and_dtend_converts_to_utc(self):
        """Convert the values for dtstart and dtend to UTC."""
        tz = pytz.timezone('America/Adak')

        limits = Recurrence(
            dtstart=datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz),
            dtend=datetime(2014, 2, 3, 0, 0, 0, tzinfo=tz),
        )

        value = recurrence.serialize(limits)

        field = RecurrenceField(required=False)
        cleaned_value = field.clean(value)
        assert cleaned_value.dtstart == datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz).astimezone(pytz.utc)
        assert cleaned_value.dtend == datetime(2014, 2, 3, 0, 0, 0, tzinfo=tz).astimezone(pytz.utc)
        assert cleaned_value.dtstart.tzname() == 'UTC'
        assert cleaned_value.dtend.tzname() == 'UTC'

    def test_naive_rdates_converted_to_utc(self):
        limits = Recurrence(
            rdates=[
                datetime(2014, 1, 1, 0, 0, 0),
                datetime(2014, 1, 2, 0, 0, 0),
            ],
        )

        value = recurrence.serialize(limits)

        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.rdates == [
            datetime(2014, 1, 1, 0, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 1, 2, 0, 0, 0, tzinfo=pytz.utc),
        ]
        for rdate in cleaned_value.rdates:
            assert rdate.tzname() == 'UTC'

    def test_aware_rdates_converted_to_utc(self):
        tz = pytz.timezone('America/Adak')
        limits = Recurrence(
            rdates=[
                datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz),
                datetime(2014, 1, 2, 0, 0, 0, tzinfo=tz),
            ],
        )

        value = recurrence.serialize(limits)

        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.rdates == [
            datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz).astimezone(pytz.utc),
            datetime(2014, 1, 2, 0, 0, 0, tzinfo=tz).astimezone(pytz.utc),
        ]
        for rdate in cleaned_value.rdates:
            assert rdate.tzname() == 'UTC'

    def test_naive_exdates_converted_to_utc(self):
        limits = Recurrence(
            exdates=[
                datetime(2014, 1, 1, 0, 0, 0),
                datetime(2014, 1, 2, 0, 0, 0),
            ],
        )

        value = recurrence.serialize(limits)

        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.exdates == [
            datetime(2014, 1, 1, 0, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 1, 2, 0, 0, 0, tzinfo=pytz.utc),
        ]
        for rdate in cleaned_value.exdates:
            assert rdate.tzname() == 'UTC'

    def test_aware_exdates_converted_to_utc(self):
        tz = pytz.timezone('America/Adak')
        limits = Recurrence(
            exdates=[
                datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz),
                datetime(2014, 1, 2, 0, 0, 0, tzinfo=tz),
            ],
        )

        value = recurrence.serialize(limits)

        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.exdates == [
            datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz).astimezone(pytz.utc),
            datetime(2014, 1, 2, 0, 0, 0, tzinfo=tz).astimezone(pytz.utc),
        ]
        for rdate in cleaned_value.exdates:
            assert rdate.tzname() == 'UTC'

    def test_naive_until_gets_converted_to_utc(self):
        recurs = Recurrence(
            rrules=[Rule(
                recurrence.DAILY,
                until=datetime(2014, 1, 1, 0, 0, 0))
            ],
        )
        value = recurrence.serialize(recurs)
        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.rrules[0].until == datetime(2014, 1, 1, 0, 0, 0, tzinfo=pytz.utc)

    def test_aware_until_gets_converted_to_utc(self):
        tz = pytz.timezone('America/Adak')
        until = datetime(2014, 1, 1, 0, 0, 0, tzinfo=tz)
        recurs = Recurrence(
            rrules=[Rule(
                recurrence.DAILY,
                until=until)
            ],
        )
        value = recurrence.serialize(recurs)
        field = RecurrenceField()
        cleaned_value = field.clean(value)
        assert cleaned_value.rrules[0].until == until.astimezone(pytz.utc)


@override_settings(RECURRENCE_USE_TZ=True, USE_TZ=True)
class SaveTest(TestCase):

    def test_recurrence_object_is_saved(self):
        """Test that naive datetimes will get converted to UTC and returned as UTC"""
        rule = Rule(
            recurrence.WEEKLY
        )

        limits = Recurrence(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
            dtend=datetime(2014, 2, 3, 0, 0, 0),
            rrules=[rule]
        )

        event = EventWithNoNulls.objects.create(
            recurs=limits
        )

        event.refresh_from_db()

        instances = event.recurs.between(
            datetime(2010, 1, 1, 0, 0, 0, tzinfo=pytz.utc),
            datetime(2020, 12, 31, 0, 0, 0, tzinfo=pytz.utc)
        )

        assert instances == [
            datetime(2014, 1, 1, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 1, 8, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 1, 15, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 1, 22, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 1, 29, 0, 0, tzinfo=pytz.utc),
            datetime(2014, 2, 3, 0, 0, tzinfo=pytz.utc)  # We always get dtend
        ]

        event = EventWithNoNulls.objects.get(pk=event.pk)

        expected_limits = Recurrence(
            dtstart=datetime(2014, 1, 1, 0, 0, 0, tzinfo=pytz.utc),
            dtend=datetime(2014, 2, 3, 0, 0, 0, tzinfo=pytz.utc),
            rrules=[rule]
        )

        assert event.recurs == expected_limits

        assert event.recurs.between(
            datetime(2010, 1, 1, 0, 0, 0, tzinfo=pytz.utc),
            datetime(2020, 12, 31, 0, 0, 0, tzinfo=pytz.utc)
        ) == instances
