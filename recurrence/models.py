from django.db import models

import recurrence as recur
from recurrence import managers, choices


class Recurrence(models.Model):
    dtstart = models.DateTimeField(null=True, blank=True)
    dtend = models.DateTimeField(null=True, blank=True)

    objects = managers.RecurrenceManager()

    def to_recurrence_object(self):
        return Recurrence.objects.to_recurrence_object(self)


class Rule(models.Model):
    recurrence = models.ForeignKey(Recurrence, related_name='rules', on_delete=models.CASCADE)
    mode = models.BooleanField(default=True, choices=choices.MODE_CHOICES)
    freq = models.PositiveIntegerField(choices=choices.FREQUENCY_CHOICES)
    interval = models.PositiveIntegerField(default=1)
    wkst = models.PositiveIntegerField(
        default=recur.Rule.firstweekday, null=True, blank=True)
    count = models.PositiveIntegerField(null=True, blank=True)
    until = models.DateTimeField(null=True, blank=True)

    objects = managers.RuleManager()

    def to_rule_object(self):
        return self.__class__.objects.to_rule_object(self)


class Date(models.Model):
    recurrence = models.ForeignKey(Recurrence, related_name='dates', on_delete=models.CASCADE)
    mode = models.BooleanField(default=True, choices=choices.MODE_CHOICES)
    dt = models.DateTimeField()


class Param(models.Model):
    rule = models.ForeignKey(Rule, related_name='params', on_delete=models.CASCADE)
    param = models.CharField(max_length=16)
    value = models.IntegerField()
    index = models.IntegerField(default=0)
