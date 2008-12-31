import pytz
from django.db import models
from django.conf import settings

import recurrence
from recurrence import managers, choices


class Rule(models.Model):
    freq = models.PositiveIntegerField(choices=choices.FREQUENCY_CHOICES)
    interval = models.PositiveIntegerField(default=1)
    wkst = models.PositiveIntegerField(
        default=recurrence.Rule.firstweekday, null=True, blank=True)
    count = models.PositiveIntegerField(null=True, blank=True)
    until = models.DateTimeField(null=True, blank=True)

    objects = managers.RuleManager()
                
    def to_rule_object(self):
        return Rule.objects.to_rule_object(self)


class RuleParam(models.Model):
    class Meta:
        abstract = True

    value = models.IntegerField()

    def __unicode__(self):
        return self.value


for param in recurrence.Rule.byparams:
    class_attrs = {
        '__module__': __name__,
        'rule': models.ForeignKey(Rule, related_name=param)
    }
    # weekday parameter slightly more complex, supports indexing
    # much like bysetpos, i.e. second last sunday
    if param == 'byday':
        class_attrs['index'] = models.IntegerField(default=0)
    locals()['Rule%s' % param.capitalize()] = type(
        'Rule%s' % param.capitalize(), (RuleParam,), class_attrs)
del param


class Recurrence(models.Model):
    dtstart = models.DateTimeField(null=True, blank=True)
    rrules = models.ManyToManyField(
        Rule, related_name='in_recurrence_as_rrule', null=True, blank=True)
    exrules = models.ManyToManyField(
        Rule, related_name='in_recurrence_as_exrule', null=True, blank=True)

    objects = managers.RecurrenceManager()

    def delete(self, delete_rules=True):
        if delete_rules:
            self.rrules.all().delete()
            self.exrules.all().delete()
        super(Recurrence, self).delete()

    delete.alters_data = True

    def to_recurrence_object(self, dtstart=None):
        return Recurrence.objects.to_recurrence_object(self, dtstart)


class RecurrenceDate(models.Model):
    class Meta:
        abstract = True

    dt = models.DateTimeField()

    def __unicode__(self):
        return unicode(self.dt)

    def get_dt_localized(self):
        return pytz.utc.localize(dt)


class RecurrenceRdate(RecurrenceDate):
    recurrence = models.ForeignKey(Recurrence, related_name='rdates')


class RecurrenceExdate(models.Model):
    recurrence = models.ForeignKey(Recurrence, related_name='exdates')
