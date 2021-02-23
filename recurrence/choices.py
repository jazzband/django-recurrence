from django.utils.translation import gettext_lazy as _

import recurrence


FREQUENCY_CHOICES = (
    (recurrence.SECONDLY, _('Secondly')),
    (recurrence.MINUTELY, _('Minutely')),
    (recurrence.HOURLY, _('Hourly')),
    (recurrence.DAILY, _('Daily')),
    (recurrence.WEEKLY, _('Weekly')),
    (recurrence.MONTHLY, _('Monthly')),
    (recurrence.YEARLY, _('Yearly')),
)

WEEKDAY_CHOICES = (
    (recurrence.MONDAY, _('Monday')),
    (recurrence.TUESDAY, _('Tuesday')),
    (recurrence.WEDNESDAY, _('Wednesday')),
    (recurrence.THURSDAY, _('Thursday')),
    (recurrence.FRIDAY, _('Friday')),
    (recurrence.SATURDAY, _('Saturday')),
    (recurrence.SUNDAY, _('Sunday')),
)

MONTH_CHOICES = (
    (recurrence.JANUARY, _('January')),
    (recurrence.FEBRUARY, _('February')),
    (recurrence.MARCH, _('March')),
    (recurrence.APRIL, _('April')),
    (recurrence.MAY, _('May')),
    (recurrence.JUNE, _('June')),
    (recurrence.JULY, _('July')),
    (recurrence.AUGUST, _('August')),
    (recurrence.SEPTEMBER, _('September')),
    (recurrence.OCTOBER, _('October')),
    (recurrence.NOVEMBER, _('November')),
    (recurrence.DECEMBER, _('December')),
)

EXCLUSION = False
INCLUSION = True
MODE_CHOICES = (
    (INCLUSION, _('Inclusion')),
    (EXCLUSION, _('Exclusion')),
)
