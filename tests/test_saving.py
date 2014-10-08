from datetime import datetime
from recurrence import Recurrence, Rule
from tests.models import EventWithNoNulls
import pytest
import recurrence


@pytest.mark.django_db
def test_recurrence_text_pattern_is_saved():
    event = EventWithNoNulls.objects.create(
        recurs="RRULE:FREQ=WEEKLY;BYDAY=TU"
    )

    assert len(event.recurs.rrules) == 1
    assert event.recurs.rrules[0].to_text() == "weekly, each Tuesday"
    recurrence_info = event.recurs

    event = EventWithNoNulls.objects.get(pk=event.pk)
    assert recurrence_info == event.recurs


@pytest.mark.django_db
def test_recurrence_object_is_saved():
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

    instances = event.recurs.between(
        datetime(2010, 1, 1, 0, 0, 0),
        datetime(2020, 12, 31, 0, 0, 0)
    )

    assert instances == [
        datetime(2014, 1, 1, 0, 0),
        datetime(2014, 1, 8, 0, 0),
        datetime(2014, 1, 15, 0, 0),
        datetime(2014, 1, 22, 0, 0),
        datetime(2014, 1, 29, 0, 0),
        datetime(2014, 2, 3, 0, 0)  # We always get dtend
    ]

    event = EventWithNoNulls.objects.get(pk=event.pk)
    assert event.recurs.between(
        datetime(2010, 1, 1, 0, 0, 0),
        datetime(2020, 12, 31, 0, 0, 0)
    ) == instances
