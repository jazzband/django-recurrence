from datetime import datetime

from dateutil import tz
from django.utils.timezone import make_aware
from recurrence import choices
from recurrence.models import Param, Recurrence, Rule
import pytest

import recurrence


@pytest.mark.django_db
def test_create_from_rule_object():
    limits = Recurrence.objects.create()
    rule = Rule.objects.create(
        recurrence=limits,
        mode=choices.INCLUSION,
        freq=recurrence.WEEKLY,
        until=make_aware(datetime(2014, 12, 31, 0, 0, 0), tz.UTC)
    )
    object = Rule.objects.create_from_rule_object(
        choices.EXCLUSION,
        rule,
        limits
    )

    assert rule.to_rule_object() == object.to_rule_object()
    assert rule.mode is True
    assert object.mode is False


@pytest.mark.django_db
def test_create_from_rule_object_byday():
    limits = Recurrence.objects.create()
    rule = Rule.objects.create(
        recurrence=limits,
        mode=choices.INCLUSION,
        freq=recurrence.WEEKLY,
        until=make_aware(datetime(2014, 12, 31, 0, 0, 0), tz.UTC)
    )
    Param.objects.create(
        rule=rule,
        param='byday',
        value=6,
        index=0
    )

    expected = 'RRULE:FREQ=WEEKLY;UNTIL=20141231T000000Z;BYDAY=SU'

    original = Rule.objects.to_rule_object(rule)
    serialized = recurrence.serialize(original)
    assert serialized == expected

    object = Rule.objects.create_from_rule_object(
        choices.INCLUSION,
        original,
        limits
    )

    serialized = recurrence.serialize(object.to_rule_object())
    assert serialized == expected


@pytest.mark.django_db
def test_create_from_rule_object_bymonth():
    limits = Recurrence.objects.create()
    rule = Rule.objects.create(
        recurrence=limits,
        mode=choices.INCLUSION,
        freq=recurrence.WEEKLY,
        until=make_aware(datetime(2014, 12, 31, 0, 0, 0), tz.UTC)
    )
    Param.objects.create(
        rule=rule,
        param='bymonth',
        value=6,
        index=0
    )
    Param.objects.create(
        rule=rule,
        param='bymonth',
        value=8,
        index=1
    )

    expected = 'RRULE:FREQ=WEEKLY;UNTIL=20141231T000000Z;BYMONTH=6,8'

    original = Rule.objects.to_rule_object(rule)
    serialized = recurrence.serialize(original)
    assert serialized == expected

    object = Rule.objects.create_from_rule_object(
        choices.INCLUSION,
        original,
        limits
    )

    serialized = recurrence.serialize(object.to_rule_object())
    assert serialized == expected
