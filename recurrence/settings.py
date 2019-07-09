"""
Settings for django recurrence.

DESERIALIZE_TZ determines if a datetime serialized as rfc2445 text
is returned as a naive datetime or a datetime with timezone.

If the django setting RECURRENCE_USE_TZ is true
then a timezone aware datetime is returned

If the django setting RECURRENCE_USE_TZ is false
then a naive datetime is returned

If this setting is not present the setting USE_TZ is used
as a default.
"""

from django.conf import settings


def deserialize_tz():
    try:
        return settings.RECURRENCE_USE_TZ
    except AttributeError:
        return settings.USE_TZ
