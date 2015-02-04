from datetime import datetime
from django import forms
from recurrence import Recurrence, Rule
from recurrence.forms import RecurrenceField
import pytest
import recurrence


def test_clean_normal_value():
    field = RecurrenceField()
    value = "RRULE:FREQ=WEEKLY;BYDAY=TU"

    obj = field.clean(value)

    assert len(obj.rrules) == 1
    assert obj.rrules[0].to_text() == "weekly, each Tuesday"


def test_clean_invalid_value():
    field = RecurrenceField()
    value = "RRULE:FREQS=WEEKLY"

    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == "bad parameter: FREQS"


def test_strip_dtstart_and_dtend_if_required():
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
    assert cleaned_value == limits
    assert cleaned_value.dtstart == datetime(2014, 1, 1, 0, 0, 0)
    assert cleaned_value.dtend == datetime(2014, 2, 3, 0, 0, 0)

    field = RecurrenceField(accept_dtstart=False, accept_dtend=False)
    cleaned_value = field.clean(value)
    assert cleaned_value != limits
    assert cleaned_value.dtstart is None
    assert cleaned_value.dtend is None


def test_check_max_rrules():
    rule = Rule(
        recurrence.WEEKLY
    )

    limits = Recurrence(
        rrules=[rule]
    )

    value = recurrence.serialize(limits)

    field = RecurrenceField(max_rrules=0)
    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == "Max rules exceeded. The limit is 0"


def test_check_max_exrules():
    rule = Rule(
        recurrence.WEEKLY
    )

    limits = Recurrence(
        exrules=[rule]
    )

    value = recurrence.serialize(limits)

    field = RecurrenceField(max_exrules=0)
    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == ("Max exclusion rules exceeded. "
                                   "The limit is 0")


def test_check_max_rdates():
    limits = Recurrence(
        rdates=[
            datetime(2014, 1, 1, 0, 0, 0),
            datetime(2014, 1, 2, 0, 0, 0),
        ]
    )

    value = recurrence.serialize(limits)

    field = RecurrenceField(max_rdates=2)
    field.clean(value)

    field = RecurrenceField(max_rdates=1)
    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == "Max dates exceeded. The limit is 1"


def test_check_max_exdates():
    limits = Recurrence(
        exdates=[
            datetime(2014, 1, 1, 0, 0, 0),
            datetime(2014, 1, 2, 0, 0, 0),
        ]
    )

    value = recurrence.serialize(limits)

    field = RecurrenceField(max_exdates=2)
    field.clean(value)

    field = RecurrenceField(max_exdates=1)
    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == ("Max exclusion dates exceeded. "
                                   "The limit is 1")


def test_check_allowable_frequencies():
    rule = Rule(
        recurrence.WEEKLY
    )

    limits = Recurrence(
        rrules=[rule]
    )

    value = recurrence.serialize(limits)

    field = RecurrenceField(frequencies=[
        recurrence.WEEKLY
    ])
    field.clean(value)

    field = RecurrenceField(frequencies=[
        recurrence.YEARLY
    ])
    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == "Invalid frequency."

    limits = Recurrence(
        exrules=[rule]
    )

    value = recurrence.serialize(limits)

    with pytest.raises(forms.ValidationError) as e:
        field.clean(value)
    assert e.value.messages[0] == "Invalid frequency."
