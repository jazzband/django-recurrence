from recurrence import Rule
import recurrence


def test_rule_to_text_simple():
    assert Rule(
        recurrence.WEEKLY
    ).to_text() == 'weekly'


def test_rule_to_text_interval():
    assert Rule(
        recurrence.WEEKLY,
        interval=3
    ).to_text() == 'every 3 weeks'


def test_rule_to_text_oneoff():
    assert Rule(
        recurrence.WEEKLY,
        count=1
    ).to_text() == 'weekly, occuring once'


def test_rule_to_text_multiple():
    assert Rule(
        recurrence.WEEKLY,
        count=5
    ).to_text() == 'weekly, occuring 5 times'


def test_rule_to_text_yearly_bymonth():
    assert Rule(
        recurrence.YEARLY,
        bymonth=[1, 3],
    ).to_text() == 'annually, each January, March'

    assert Rule(
        recurrence.YEARLY,
        bymonth=[1, 3],
    ).to_text(True) == 'annually, each Jan, Mar'


def test_rule_to_text_yearly_byday():
    assert Rule(
        recurrence.YEARLY,
        byday=[1, 3],
    ).to_text() == 'annually, on the Tuesday, Thursday'

    assert Rule(
        recurrence.YEARLY,
        byday=[1, 3],
    ).to_text(True) == 'annually, on the Tue, Thu'
