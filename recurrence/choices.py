import calendar

from django.utils.translation import ugettext_lazy as _


# constants
SECONDLY, MINUTELY, HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY = range(7)
MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY = (
    range(calendar.firstweekday(), calendar.firstweekday() + 7))
JANUARY, FEBRUARY, MARCH, APRIL, MAY, JUN, JULY, AUGUST, SEPTEMBER, OCTOBER, NOVEMBER, DECEMBER = range(12)


FREQUENCY_CHOICES = (
    (SECONDLY, _('Secondly')),
    (MINUTELY, _('Minutely')),
    (HOURLY, _('Hourly')),
    (DAILY, _('Daily')),
    (WEEKLY, _('Weekly')),
    (MONTHLY, _('Monthly')),
    (YEARLY, _('Yearly')),
)

WEEKDAY_CHOICES = (
    (MONDAY, _('Monday')),
    (TUESDAY, _('Tuesday')),
    (WEDNESDAY, _('Wednesday')),
    (THURSDAY, _('Thursday')),
    (FRIDAY, _('Friday')),
    (SATURDAY, _('Saturday')),
    (SUNDAY, _('Sunday')),
)

MONTH_CHOICES = (
    (JANUARY, _('January')),
    (FEBRUARY, _('February')),
    (MARCH, _('March')),
    (APRIL, _('April')),
    (MAY, _('May')),
    (JUNE, _('June')),
    (JULY, _('July')),
    (AUGUST, _('August')),
    (SEPTEMBER, _('September')),
    (OCTOBER, _('October')),
    (NOVEMBER, _('November')),
    (DECEMBER, _('December')),
)
