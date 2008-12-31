"""
Wrapper around ``dateutil.rrule``.
"""

import re
import datetime
import calendar

import pytz
import dateutil
from dateutil.rrule import (
    weekday,
    MO, TU, WE, TH, FR, SA, SU,
    YEARLY, MONTHLY, WEEKLY, DAILY, HOURLY, MINUTELY, SECONDLY,
)
from django.conf import settings


class Rule(object):
    byparams = (
        'bysetpos', 'bymonth', 'bymonthday', 'byyearday',
        'byweekno', 'byday', 'byhour', 'byminute', 'bysecond'
    )
    frequencies = (
        'YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY',
        'HOURLY', 'MINUTELY', 'SECONDLY'
    )
    weekdays = (
        'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'
    )
    firstweekday = calendar.firstweekday()

    def __init__(
        self, freq,
        interval=1, wkst=None, count=None, until=None, **kwargs):

        self.freq = freq
        self.interval = interval
        self.wkst = wkst
        self.count = count
        self.until = until

        for param in self.byparams:
            if param in kwargs:
                value = kwargs[param]
                if hasattr(value, '__iter__'):
                    value = list(value)
                    if not value:
                        value = None
                elif value is not None:
                    value = [value]
                else:
                    value = None
                setattr(self, param, value)
            else:
                setattr(self, param, None)

    def to_dateutil_rrule(self, dtstart=None, cache=False):
        kwargs = dict((p, getattr(self, p) or None) for p in self.byparams)
        # dateutil.rrule renames the parameter 'byweekday' by we're using
        # the parameter name originally specified by rfc2445.
        kwargs['byweekday'] = kwargs.pop('byday')
        return dateutil.rrule.rrule(
            self.freq, dtstart,
            self.interval, self.wkst, self.count, self.until,
            cache=cache, **kwargs)


class Recurrence(object):
    def __init__(
        self, dtstart=None,
        rrules=[], exrules=[], rdates=[], exdates=[]):

        self.dtstart = dtstart
        self.rrules = list(rrules)
        self.exrules = list(exrules)
        self.rdates = list(rdates)
        self.exdates = list(exdates)

    def __call__(self, dtstart=None, tzinfo=None, cache=False):
        localtz = pytz.timezone(settings.TIME_ZONE)
        def recurrence(rruleset, tzinfo):
            for dt in rruleset:
                if not dt.tzinfo:
                    dt = localtz.localize(dt)
                yield dt.astimezone(tzinfo)
        return iter(recurrence(
            self.to_dateutil_rruleset(dtstart or self.dtstart, cache),
            tzinfo or localtz))

    def __iter__(self):
        return self.__call__()

    def __unicode__(self):
        return serialize(self)

    def to_dateutil_rruleset(self, dtstart=None, cache=False):
        localtz = pytz.timezone(settings.TIME_ZONE)
        dtstart = dtstart or self.dtstart
        if dtstart:
            if not dtstart.tzinfo:
                dtstart = localtz.localize(dtstart)
            dtstart = dtstart.astimezone(pytz.utc)

        rruleset = dateutil.rrule.rruleset(cache=cache)
        for rrule in self.rrules:
            rruleset.rrule(rrule.to_dateutil_rrule(dtstart, cache))
        for exrule in self.exrules:
            rruleset.exrule(exrule.to_dateutil_rrule(dtstart, cache))
        if dtstart is not None:
            rruleset.rdate(dtstart)
        for rdate in self.rdates:
            rruleset.rdate(rdate)
        for exdate in self.exdates:
            rruleset.exdate(exdate)
        return rruleset


def to_weekday(token):
    if issubclass(token.__class__, dateutil.rrule.weekday):
        return token
    if isinstance(token, int):
        if token > 6:
            raise ValueError
        return dateutil.rrule.weekdays[token]
    elif not token:
        raise ValueError
    elif isinstance(token, basestring) and token.isdigit():
        if int(token) > 6:
            raise ValueError
        return dateutil.rrule.weekdays[int(token)]
    elif isinstance(token, basestring):
        const = token[-2:].lower()
        if const not in Rule.weekdays:
            raise ValueError
        nth = token[:-2]
        if not nth:
            return dateutil.rrule.weekday(
                Rule.weekdays.index(const))
        else:
            return dateutil.rrule.weekday(
                Rule.weekdays.index(const), int(nth))


def serialize(rule_or_recurrence):
    def serialize_dt(dt):
        localtz = pytz.timezone(settings.TIME_ZONE)
        if not dt.tzinfo:
            dt = localtz.localize(dt)
        dt = dt.astimezone(pytz.utc)

        return u'%s%s%sT%s%s%sZ' % (
            str(dt.year).rjust(4, '0'),
            str(dt.month).rjust(2, '0'),
            str(dt.day).rjust(2, '0'),
            str(dt.hour).rjust(2, '0'),
            str(dt.minute).rjust(2, '0'),
            str(dt.second).rjust(2, '0'),
        )

    def serialize_rule(rule):
        values = []
        values.append((u'FREQ', [Rule.frequencies[rule.freq]]))

        if rule.interval != 1:
            values.append((u'INTERVAL', [str(rule.interval)]))
        if rule.wkst:
            values.append((u'WKST', [Rule.weekdays[rule.wkst]]))
        if rule.count is not None:
            values.append((u'COUNT', [str(rule.count)]))
        elif rule.until is not None:
            values.append((u'UNTIL', [serialize_dt(rule.until)]))

        if rule.byday:
            days = []
            for d in rule.byday:
                d = to_weekday(d)
                if d.n:
                    days.append(u'%s%s' % (d.n, Rule.weekdays[d.weekday]))
                else:
                    days.append(Rule.weekdays[d.weekday])
            values.append((u'BYDAY', days))

        remaining_params = list(Rule.byparams)
        remaining_params.remove('byday')
        for param in remaining_params:
            value_list = getattr(rule, param, None)
            if value_list:
                values.append((param.upper(), [str(n) for n in value_list]))

        return u';'.join(u'%s=%s' % (i[0], u','.join(i[1])) for i in values)

    localtz = pytz.timezone(settings.TIME_ZONE)
    obj = rule_or_recurrence
    if isinstance(obj, Rule):
        obj = Recurrence(rrules=[obj])

    items = []
    if obj.dtstart:
        if obj.dtstart.tzinfo:
            dtstart = serialize_dt(obj.dtstart.astimezone(pytz.utc))
        else:
            dtstart = serialize_dt(
                localtz.localize(obj.dtstart).astimezone(pytz.utc))
        items.append((u'DTSTART', dtstart))
    for rrule in obj.rrules:
        items.append((u'RRULE', serialize_rule(rrule)))
    for exrule in obj.exrules:
        items.append((u'EXRULES', serialize_rule(exrule)))
    for rdate in obj.rdates:
        if rdate.tzinfo:
            rdate = serialize_dt(rdate.astimezone(pytz.utc))
        else:
            rdate = serialize_dt(
                localtz.localize(rdate).astimezone(pytz.utc))
        items.append((u'RDATE', serialize_dt(rdate)))
    for exdate in obj.exdates:
        if exdate.tzinfo:
            exdate = serialize_dt(exdate.astimezone(pytz.utc))
        else:
            exdate = serialize_dt(
                localtz.localize(exdate).astimezone(pytz.utc))
        items.append((u'EXDATE', serialize_dt(exdate)))

    return u'\n'.join(u'%s:%s' % i for i in items)


def deserialize(text):
    def deserialize_dt(text):
        year, month, day = int(text[:4]), int(text[4:6]), int(text[6:8])
        if u'T' in text:
            hour, minute, second = (
                int(text[9:11]), int(text[11:13]), int(text[13:15]))
        else:
            hour, minute, second = (0, 0, 0)
        if u'Z' in text:
            tzinfo = pytz.utc
        else:
            # right now there is no support for VTIMEZONE/TZID since
            # this is a partial implementation of rfc2445 so we'll
            # just use the time zone specified in the Django settings.
            tzinfo = pytz.timezone(settings.TIME_ZONE)
        return datetime.datetime(
            year, month, day, hour, minute, second, tzinfo=tzinfo)

    dtstart, rrules, exrules, rdates, exdates = None, [], [], [], []

    tokens = re.compile(
        u'(DTSTART|RRULE|EXRULE|RDATE|EXDATE)[^:]*:(.*)',
        re.MULTILINE).findall(text)

    for label, param_text in tokens:
        if u'=' not in param_text:
            params = param_text
        else:
            params = {}
            param_tokens = param_text.split(u';')
            for item in param_tokens:
                param_name, param_value = map(
                    lambda i: i.strip(), item.split(u'=', 1))
                params[param_name] = map(
                    lambda i: i.strip(), param_value.split(u','))

        if label in (u'RRULE', u'EXRULE'):
            kwargs = {}
            for key, value in params.items():
                if key == u'FREQ':
                    kwargs[str(key.lower())] = list(
                        Rule.frequencies).index(value[0])
                elif key == u'INTERVAL':
                    kwargs[str(key.lower())] = int(value[0])
                elif key == u'WKST':
                    kwargs[str(key.lower())] = to_weekday(value[0])
                elif key == u'COUNT':
                    kwargs[str(key.lower())] = int(value[0])
                elif key == u'UNTIL':
                    kwargs[str(key.lower())] = deserialize_dt(value[0])
                elif key == u'BYDAY':
                    kwargs[str(key.lower())] = map(lambda v: to_weekday(v), value)
                else:
                    kwargs[str(key.lower())] = map(lambda v: int(v))
            if label == u'RRULE':
                rrules.append(Rule(**kwargs))
            else:
                exrule.append(Rule(**kwargs))
        elif label == u'DTSTART':
            dtstart = deserialize_dt(params)
        elif label == u'RDATE':
            rdates.append(deserialize_dt(params))
        elif label == u'EXDATE':
            exdates.append(deserialize_dt(params))

    return Recurrence(dtstart, rrules, exrules, rdates, exdates)


def from_dateutil_rrule(rrule):
    kwargs = {}
    kwargs['freq'] = rrule._freq
    kwargs['interval'] = rrule._interval
    if rrule._wkst != 0:
        kwargs['wkst'] = rrule._wkst
    kwargs['bysetpos'] = rrule._bysetpos
    if rrule._count is not None:
        kwargs['count'] = rrule._count
    elif rrule._until is not None:
        kwargs['until'] = rrule._until

    days = []
    if (rrule._byweekday is not None and (
        WEEKLY != rrule._freq or len(rrule._byweekday) != 1 or
        rrule._dtstart.weekday() != rrule._byweekday[0])):
        # ignore byweekday if freq is WEEKLY and day correlates
        # with dtstart because it was automatically set by
        # dateutil
        days.extend(dateutil.rrule.weekday(n) for n in rrule._byweekday)

    if rrule._bynweekday is not None:
        days.extend(dateutil.rrule.weekday(*n) for n in rrule._bynweekday)

    if len(days) > 0:
        kwargs['byday'] = days

    if rrule._bymonthday is not None and len(rrule._bymonthday) > 0:
        if not (rrule._freq <= MONTHLY and len(rrule._bymonthday) == 1 and
            rrule._bymonthday[0] == rrule._dtstart.day):
            # ignore bymonthday if it's generated by dateutil
            kwargs['bymonthday'] = list(rrule._bymonthday)

    if rrule._bynmonthday is not None and len(rrule._bynmonthday) > 0:
        kwargs.setdefault('bymonthday', []).extend(rrule._bynmonthday)

    if rrule._bymonth is not None and len(rrule._bymonth) > 0:
        if (rrule._byweekday is not None or
            len(rrule._bynweekday or ()) > 0 or not (
            rrule._freq == YEARLY and len(rrule._bymonth) == 1 and
            rrule._bymonth[0] == rrule._dtstart.month)):
            # ignore bymonth if it's generated by dateutil
            kwargs['bymonth'] = list(rrule._bymonth)

    if rrule._byyearday is not None:
        kwargs['byyearday'] = list(rrule._byyearday)
    if rrule._byweekno is not None:
        kwargs['byweekno'] = list(rrule._byweekno)

    kwargs['byhour'] = list(rrule._byhour)
    kwargs['byminute'] = list(rrule._byminute)
    kwargs['bysecond'] = list(rrule._bysecond)
    if (rrule._dtstart.hour in rrule._byhour and
        rrule._dtstart.minute in rrule._byminute and
        rrule._dtstart.second in rrule._bysecond):
        # ignore byhour/byminute/bysecond automatically set by
        # dateutil from dtstart
        kwargs['byhour'].remove(rrule._dtstart.hour)
        kwargs['byminute'].remove(rrule._dtstart.minute)
        kwargs['bysecond'].remove(rrule._dtstart.second)

    return Rule(**kwargs)


def from_dateutil_rruleset(rruleset):
    rrules = [from_dateutil_rrule(rrule) for rrule in rruleset._rrule]
    exrules = [from_dateutil_rrule(exrule) for exrule in rruleset._exrule]
    rdates = rruleset._rdate
    exdates = rruleset._exdate

    dts = [r._dtstart for r in rruleset._rrule] + rruleset._rdate
    if len(dts) > 0:
        dts.sort()
        dtstart = dts[0]
    else:
        dtstart = None

    return Recurrence(dtstart, rrules, exrules, rdates, exdates)
