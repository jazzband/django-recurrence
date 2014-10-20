from datetime import datetime
from recurrence import Recurrence, Rule
import recurrence


def test_truthiness_with_single_rrule():
    rule = Rule(
        recurrence.DAILY
    )

    object = Recurrence(
        rrules=[rule]
    )

    assert bool(object)


def test_truthiness_with_single_exrule():
    rule = Rule(
        recurrence.DAILY
    )

    object = Recurrence(
        exrules=[rule]
    )

    assert bool(object)


def test_truthiness_with_single_rdate():
    object = Recurrence(
        rdates=[datetime(2014, 12, 31, 0, 0, 0)]
    )

    assert bool(object)


def test_truthiness_with_single_exdate():
    object = Recurrence(
        exdates=[datetime(2014, 12, 31, 0, 0, 0)]
    )

    assert bool(object)


def test_truthiness_with_dtstart():
    object = Recurrence(
        dtstart=datetime(2014, 12, 31, 0, 0, 0)
    )

    assert bool(object)


def test_truthiness_with_dtend():
    object = Recurrence(
        dtend=datetime(2014, 12, 31, 0, 0, 0)
    )

    assert bool(object)


def test_falsiness_with_empty_recurrence_object():
    assert not bool(Recurrence())
