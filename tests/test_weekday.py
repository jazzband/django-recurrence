import pytest
from recurrence import Weekday


def test_init():
    assert repr(Weekday(3)) == 'TH'
    assert repr(Weekday(3, -2)) == '-2TH'
    assert repr(Weekday(3, 3)) == '3TH'

    with pytest.raises(ValueError):
        Weekday(8)

    with pytest.raises(ValueError):
        Weekday('fish')


def test_call():
    # I'm not sure why this functionality is useful, but this is what
    # calling a weekday currently does.

    day = Weekday(4, -3)
    assert day(2) == Weekday(4, 2)
    assert day(-3) is day
    assert day(None) == Weekday(4)
