from datetime import datetime
from django.core.exceptions import ValidationError
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

    assert event.recurs == limits

    assert event.recurs.between(
        datetime(2010, 1, 1, 0, 0, 0),
        datetime(2020, 12, 31, 0, 0, 0)
    ) == instances


@pytest.mark.django_db
@pytest.mark.parametrize('value', [
    ' ', 'invalid', 'RRULE:', 'RRULE:FREQ=', 'RRULE:FREQ=invalid'
])
def test_recurrence_text_pattern_invalid(value):
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=value
        )


@pytest.mark.django_db
def test_invalid_frequency_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule('fish')]
            )
        )

    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(42)]
            )
        )


@pytest.mark.django_db
def test_invalid_interval_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, interval=0)]
            )
        )

    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, interval='cat')]
            )
        )


@pytest.mark.django_db
def test_invalid_wkst_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, wkst=17)]
            )
        )


@pytest.mark.django_db
def test_invalid_until_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, until=17)]
            )
        )


@pytest.mark.django_db
def test_invalid_count_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, count='fish')]
            )
        )


@pytest.mark.django_db
def test_invalid_byday_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, byday='house')]
            )
        )


@pytest.mark.django_db
def test_invalid_bymonth_too_high_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, bymonth=[1, 32])]
            )
        )


@pytest.mark.django_db
def test_invalid_bymonth_toolow_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rrules=[Rule(recurrence.DAILY, bymonth=[0, ])]
            )
        )


@pytest.mark.django_db
def test_invalid_exclusion_interval_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                exrules=[Rule(recurrence.DAILY, interval=0)]
            )
        )


@pytest.mark.django_db
def test_invalid_date_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                rdates=["fish"]
            )
        )


@pytest.mark.django_db
def test_invalid_exclusion_date_recurrence_object_raises():
    with pytest.raises(ValidationError):
        EventWithNoNulls.objects.create(
            recurs=Recurrence(
                exdates=["fish"]
            )
        )
