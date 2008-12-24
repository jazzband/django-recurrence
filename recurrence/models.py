import calendar

from django.db import models

from recurrence import managers, choices


class Rrule(models.Model):
    freq = models.PositiveIntegerField(choices=choices.FREQUENCY_CHOICES)
    dtstart = models.DateTimeField(null=True, blank=True)
    interval = models.PositiveIntegerField(default=1)
    wkst = models.PositiveIntegerField(
        default=calendar.firstweekday(), null=True, blank=True)
    count = models.PositiveIntegerField(null=True, blank=True)
    until = models.DateTimeField(null=True, blank=True)

    objects = managers.RruleManager()

    def __unicode__(self):
        return self.get_display()

    def get_display(self):
        params = (
            'freq', 'dtstart', 'interval', 'wkst', 'count', 'until'
            ) + Rrule.objects.related_params
        display = []
        for param in params:
            if param.startswith('by'):
                # related manager
                mgr = getattr(self, param)
                value_list = (
                    map(lambda v: v[0], mgr.values_list('value'))
                    or None)
                if value_list:
                    display.append((param, tuple(value_list)))
            else:
                # local model field
                value = getattr(self, param)
                if value is not None:
                    display.append((param, value))
        return ' '.join(map(lambda i: '%s=%s' % i, display))
                
    def to_rrule(self, cache=False):
        return Rrule.objects.to_rrule(self, cache)


class RruleParam(models.Model):
    class Meta:
        abstract = True

    value = models.IntegerField()

    def __unicode__(self):
        return self.value


class RruleBysetpos(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='bysetpos')


class RruleBymonth(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='bymonth')


class RruleBymonthday(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='bymonthday')


class RruleByyearday(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='byyearday')


class RruleByweekno(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='byweekno')


class RruleByweekday(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='byweekday')


class RruleByhour(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='byhour')


class RruleByminute(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='byminute')


class RruleBysecond(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='bysecond')


class RruleByeaster(RruleParam):
    rrule = models.ForeignKey(Rrule, related_name='byeaster')


class RruleSet(models.Model):
    rrules = models.ManyToManyField(
        Rrule, related_name='in_rrulesets_as_rrule', null=True, blank=True)
    exrules = models.ManyToManyField(
        Rrule, related_name='in_rrulesets_as_exrule', null=True, blank=True)

    objects = managers.RruleSetManager()

    def to_rruleset(self, cache=False):
        return RruleSet.objects.to_rruleset(self, cache)


class RruleSetDate(models.Model):
    class Meta:
        abstract = True

    dt = models.DateTimeField()

    def __unicode__(self):
        return unicode(self.dt)


class RruleSetRdate(RruleSetDate):
    rruleset = models.ForeignKey(RruleSet, related_name='rdates')


class RruleSetExdate(models.Model):
    rruleset = models.ForeignKey(RruleSet, related_name='exdates')
