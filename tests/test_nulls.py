from django.db import IntegrityError
from recurrence import Recurrence
from tests.models import EventWithNulls, EventWithNoNulls
import pytest


@pytest.mark.django_db
def test_recurs_can_be_explicitly_none_if_none_is_allowed():
    # Check we can save None correctly
    event = EventWithNulls.objects.create(recurs=None)
    assert event.recurs is None

    # Check we can deserialize None correctly
    reloaded = EventWithNulls.objects.get(pk=event.pk)
    assert reloaded.recurs is None


@pytest.mark.django_db
def test_recurs_cannot_be_explicitly_none_if_none_is_disallowed():
    with pytest.raises(IntegrityError):
        EventWithNoNulls.objects.create(recurs=None)


@pytest.mark.django_db
def test_recurs_can_be_empty_even_if_none_is_disallowed():
    event = EventWithNoNulls.objects.create(recurs=Recurrence())
    assert event.recurs == Recurrence()
