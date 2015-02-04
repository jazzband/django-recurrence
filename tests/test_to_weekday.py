from dateutil.rrule import weekday
import pytest
import recurrence


def test_to_weekday_from_weekday():
    day = recurrence.Weekday(4)

    assert recurrence.to_weekday(day) == day


def test_to_weekday_from_dateutil_weekday():
    day = weekday(1)

    assert recurrence.to_weekday(day) == recurrence.Weekday(1)


def test_to_weekday_from_int():
    assert recurrence.to_weekday(1) == recurrence.Weekday(1)

    with pytest.raises(ValueError):
        recurrence.to_weekday(7)


def test_to_weekday_from_nonelike():
    with pytest.raises(ValueError):
        recurrence.to_weekday(None)

    with pytest.raises(ValueError):
        recurrence.to_weekday("")


def test_to_weekday_from_string():
    assert recurrence.to_weekday("3") == recurrence.Weekday(3)

    with pytest.raises(ValueError):
        recurrence.to_weekday("7")

    assert recurrence.to_weekday("MO") == recurrence.Weekday(0)
    assert recurrence.to_weekday("mo") == recurrence.Weekday(0)
    assert recurrence.to_weekday("TU") == recurrence.Weekday(1)
    assert recurrence.to_weekday("Tu") == recurrence.Weekday(1)

    with pytest.raises(ValueError):
        recurrence.to_weekday("FOO")

    assert recurrence.to_weekday("-2TU") == recurrence.Weekday(1, -2)

    # We don't do any validation of the index
    assert recurrence.to_weekday("-7SU") == recurrence.Weekday(6, -7)
