from datetime import datetime
from recurrence import Recurrence, Rule
import recurrence


RULE = Rule(
    recurrence.DAILY
)

PATTERN = Recurrence(
    dtstart=datetime(2014, 1, 2, 0, 0, 0),
    dtend=datetime(2014, 1, 3, 0, 0, 0),
    rrules=[RULE]
)


def test_occurrences_with_implicit_start_and_end():
    occurrences = [
        instance for instance in
        PATTERN.occurrences()
    ]

    assert occurrences == [
        datetime(2014, 1, 2, 0, 0, 0),
        datetime(2014, 1, 3, 0, 0, 0),
    ]

    assert 2 == PATTERN.count()


def test_occurrences_with_explicit_start():
    occurrences = [
        instance for instance in
        PATTERN.occurrences(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
        )
    ]

    # If you specify dtstart, you get occurrences based on the rules
    # from the Recurrence object, which may be outside of the
    # Recurrence object's range.
    assert occurrences == [
        datetime(2014, 1, 1, 0, 0, 0),
        datetime(2014, 1, 2, 0, 0, 0),
        datetime(2014, 1, 3, 0, 0, 0),
    ]

    assert 3 == PATTERN.count(
        dtstart=datetime(2014, 1, 1, 0, 0, 0),
    )


def test_occurrences_with_explicit_end():
    occurrences = [
        instance for instance in
        PATTERN.occurrences(
            dtend=datetime(2014, 1, 4, 0, 0, 0),
        )
    ]

    # If you specify dtend, you get occurrences based on the rules
    # from the Recurrence object, which may be outside of the
    # Recurrence object's range.
    assert occurrences == [
        datetime(2014, 1, 2, 0, 0, 0),
        datetime(2014, 1, 3, 0, 0, 0),
        datetime(2014, 1, 4, 0, 0, 0),
    ]

    assert 3 == PATTERN.count(
        dtend=datetime(2014, 1, 4, 0, 0, 0),
    )


def test_occurrences_with_explicit_start_and_end():
    occurrences = [
        instance for instance in
        PATTERN.occurrences(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
            dtend=datetime(2014, 1, 4, 0, 0, 0),
        )
    ]

    # If you specify dtstart or dtend, you get occurrences based on
    # the rules from the Recurrence object, which may be outside of
    # the Recurrence object's range.
    assert occurrences == [
        datetime(2014, 1, 1, 0, 0, 0),
        datetime(2014, 1, 2, 0, 0, 0),
        datetime(2014, 1, 3, 0, 0, 0),
        datetime(2014, 1, 4, 0, 0, 0),
    ]

    assert 4 == PATTERN.count(
        dtstart=datetime(2014, 1, 1, 0, 0, 0),
        dtend=datetime(2014, 1, 4, 0, 0, 0),
    )


def test_occurrences_with_specific_include_dates():
    pattern = Recurrence(
        rdates=[
            datetime(2014, 1, 1, 0, 0, 0),
            datetime(2014, 1, 2, 0, 0, 0),
        ]
    )

    occurrences = [
        instance for instance in
        pattern.occurrences(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
            dtend=datetime(2014, 1, 4, 0, 0, 0),
        )
    ]

    assert occurrences == [
        datetime(2014, 1, 1, 0, 0, 0),
        datetime(2014, 1, 2, 0, 0, 0),
        datetime(2014, 1, 4, 0, 0, 0),
    ]

    assert 3 == pattern.count(
        dtstart=datetime(2014, 1, 1, 0, 0, 0),
        dtend=datetime(2014, 1, 4, 0, 0, 0),
    )

    all_occurrences = [
        instance for instance in
        pattern.occurrences()
    ]

    assert all_occurrences == [
        datetime(2014, 1, 1, 0, 0, 0),
        datetime(2014, 1, 2, 0, 0, 0),
    ]

    assert 2 == pattern.count()


def test_occurrences_until():
    rule = Rule(
        recurrence.DAILY,
        until=datetime(2014, 1, 3, 0, 0, 0)
    )

    pattern = Recurrence(
        rrules=[
            rule
        ]
    )

    occurrences = [
        instance for instance in
        pattern.occurrences(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
            dtend=datetime(2014, 1, 5, 0, 0, 0),
        )
    ]

    assert occurrences == [
        datetime(2014, 1, 1, 0, 0, 0),
        datetime(2014, 1, 2, 0, 0, 0),
        datetime(2014, 1, 3, 0, 0, 0),
        # We always get dtend, for reasons that aren't entirely clear
        datetime(2014, 1, 5, 0, 0, 0),
    ]

    assert 4 == pattern.count(
        dtstart=datetime(2014, 1, 1, 0, 0, 0),
        dtend=datetime(2014, 1, 5, 0, 0, 0),
    )

    occurrences = [
        instance for instance in
        pattern.occurrences(
            dtstart=datetime(2014, 1, 1, 0, 0, 0),
            dtend=datetime(2014, 1, 2, 0, 0, 0),
        )
    ]

    assert occurrences == [
        datetime(2014, 1, 1, 0, 0, 0),
        datetime(2014, 1, 2, 0, 0, 0),
    ]

    assert 2 == pattern.count(
        dtstart=datetime(2014, 1, 1, 0, 0, 0),
        dtend=datetime(2014, 1, 2, 0, 0, 0),
    )


def test_before():
    assert PATTERN.before(
        datetime(2014, 1, 3, 0, 0, 0)
    ) == datetime(2014, 1, 2, 0, 0, 0)

    assert PATTERN.before(
        datetime(2014, 1, 3, 0, 0, 0),
        inc=True
    ) == datetime(2014, 1, 3, 0, 0, 0)


def test_after():
    assert PATTERN.after(
        datetime(2014, 1, 2, 0, 0, 0)
    ) == datetime(2014, 1, 3, 0, 0, 0)

    assert PATTERN.after(
        datetime(2014, 1, 2, 0, 0, 0),
        inc=True
    ) == datetime(2014, 1, 2, 0, 0, 0)
