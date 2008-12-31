import pytz
from django.db.models import manager, query

import recurrence


class RuleManager(manager.Manager):
    def create(
        self, freq,
        interval=1, wkst=None, count=None, until=None, **kwargs):

        rule_model = super(RuleManager, self).create(
            freq=freq, interval=interval, wkst=wkst, count=count, until=until,
        )

        for param in recurrence.Rule.byparams:
            if param in kwargs:
                value_list = kwargs[param]
                if not value_list:
                    continue
                related_manager = getattr(rule_model, param)
                if not hasattr(value_list, '__iter__'):
                    value_list = [value_list]
                for value in value_list:
                    if param == 'byday':
                        # see recurrence.base docstrings about byday handling
                        weekday = recurrence.to_weekday(value)
                        related_manager.create(
                            value=weekday.weekday, index=weekday.n)
                    else:
                        related_manager.create(value=value)

        return rule_model

    def to_rule_object(self, rule_model):
        rule_args = (rule_model.freq,)
        rule_kwargs = {
            'interval': rule_model.interval,
            'wkst': rule_model.wkst,
            'count': rule_model.count,
            'until': rule_model.until,
        }

        for param in recurrence.Rule.byparams:
            related_manager = getattr(rule_model, param)
            if param == 'byday':
                # see recurrence.base docstrings about byday handling
                rule_kwargs[param] = (map(
                    lambda v: recurrence.weekday(*v),
                    related_manager.values_list('value', 'index')) or None)
            else:
                rule_kwargs[param] = (map(
                    lambda v: v[0], related_manager.values_list('value'))
                    or None)

        return recurrence.Rule(*rule_args, **rule_kwargs)

    def from_rule_object(self, rule):
        rule_args = (rule.freq,)
        rule_kwargs = {
            'interval': rule.interval,
            'wkst': rule.wkst,
            'count': rule.count,
            'until': rule.until,
        }

        for param in recurrence.Rule.byparams:
            rule_kwargs[param] = getattr(rule, param)

        return self.create(*rule_args, **rule_kwargs)


class RecurrenceQuerySet(query.QuerySet):
    def delete(self, delete_rules=True):
        if delete_rules:
            from recurrence import models
            models.Rule.objects.filter(in_recurrence_as_rule__in=self).delete()
            models.Rule.objects.filter(in_recurrence_as_exrule__in=self).delete()
        super(self, RecurrenceQuerySet).delete()


class RecurrenceEmptyQuerySet(query.EmptyQuerySet):
    def delete(self, delete_rules=True):
        pass


class RecurrenceManager(manager.Manager):
    def get_query_set(self):
        return RecurrenceQuerySet(self.model)

    def get_empty_query_set(self):
        return RecurrenceEmptyQuerySet(self.model)

    def create(
        self, dtstart=None,
        rrules=[], rdates=[], exrules=[], exdates=[]):

        from recurrence import models

        # all datetimes are stored as utc.
        def to_utc(dt):
            if not dt:
                return dt
            if dt.tzinfo:
                return dt.tzinfo.astimezone(pytz.utc)
            else:
                return pytz.utc.localize(dt)

        recurrence_model = super(
            RecurrenceManager, self).create(dtstart=to_utc(dtstart))

        for rule_model in rrules:
            if isinstance(rule_model, recurrence.Rule):
                rule_model = models.Rule.objects.from_rule_object(rule_model)
            if not rule_model.pk:
                rule_model.save()
            recurrence_model.rrules.add(rule_model)
        for exrule_model in exrules:
            if isinstance(exrule_model, recurrence.Rule):
                exrule_model = models.Rule.objects.from_rule_object(exrule_model)
            if not exrule_model.pk:
                exrule_model.save()
            recurrence_model.exrules.add(exrule_model)

        for dt in rdates:
            recurrence_model.rdates.create(dt=to_utc(dt))
        for dt in exdates:
            recurrence_model.exdates.create(dt=to_utc(dt))

        return recurrence_model

    def to_recurrence_object(self, recurrence_model, dtstart=None):
        rrules, exrules, rdates, exdates = [], [], [], []

        for rule_model in recurrence_model.rrules.all():
            rrules.append(rule_model.to_rule_object())
        for exrule_model in recurrence_model.exrules.all():
            exrules.append(rule_model.to_rule_object())

        for rdate_model in recurrence_model.rdates.all():
            rdates.append(rdate_model.get_dt_localized())
        for exdate_model in recurrence_model.exdates.all():
            exdates.append(exdate_model.get_dt_localized())

        return recurrence.Recurrence(dtstart, rrules, exrules, rdates, exdates)

    def from_recurrence_object(self, recurrence_obj):
        return self.create(
            rrules=recurrence_obj.rrules, exrules=recurrence_obj.exrules,
            rdates=recurrence_obj.rdates, exdates=recurrence_obj.exdates)
