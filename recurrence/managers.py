from django.db.models import manager

import recurrence
from recurrence import choices, to_utc


class RuleManager(manager.Manager):
    def to_rule_object(self, rule_model):
        rule_args = (rule_model.freq,)
        rule_kwargs = {
            'interval': rule_model.interval,
            'wkst': rule_model.wkst,
            'count': rule_model.count,
            'until': to_utc(rule_model.until),
        }

        for param in recurrence.Rule.byparams:
            if param == 'byday':
                # see recurrence.base docstrings about byday handling
                rule_kwargs[param] = (map(
                    lambda v: recurrence.Weekday(*v),
                    rule_model.params.filter(param=param).values_list(
                        'value', 'index')) or None)
            else:
                rule_kwargs[param] = (map(
                    lambda v: v[0],
                    rule_model.params.filter(param=param).values_list(
                        'value'
                    )
                ) or None)

        return recurrence.Rule(*rule_args, **rule_kwargs)

    def create_from_rule_object(self, mode, rule_obj, recurrence_model):
        until = to_utc(rule_obj.until)

        rule_model = self.create(
            recurrence=recurrence_model, mode=mode,
            freq=rule_obj.freq, interval=rule_obj.interval, wkst=rule_obj.wkst,
            count=rule_obj.count, until=until)

        for param in recurrence.Rule.byparams:
            value_list = getattr(rule_obj, param, None)
            if not value_list:
                continue
            if not hasattr(value_list, '__iter__'):
                value_list = [value_list]
            for value in value_list:
                if param == 'byday':
                    # see recurrence.base docstrings about byday handling
                    weekday = recurrence.to_weekday(value)
                    rule_model.params.create(
                        param=param, value=weekday.number, index=weekday.index)
                else:
                    rule_model.params.create(param=param, value=value)

        return rule_model


class RecurrenceManager(manager.Manager):
    def to_recurrence_object(self, recurrence_model):
        rrules, exrules, rdates, exdates = [], [], [], []

        for rule_model in recurrence_model.rules.filter(mode=choices.INCLUSION):
            rrules.append(rule_model.to_rule_object())
        for exrule_model in recurrence_model.rules.filter(mode=choices.EXCLUSION):
            exrules.append(exrule_model.to_rule_object())

        for rdate_model in recurrence_model.dates.filter(mode=choices.INCLUSION):
            rdates.append(to_utc(rdate_model.dt))
        for exdate_model in recurrence_model.dates.filter(mode=choices.EXCLUSION):
            exdates.append(to_utc(exdate_model.dt))

        dtstart = to_utc(recurrence_model.dtstart)
        dtend = to_utc(recurrence_model.dtend)

        return recurrence.Recurrence(
            dtstart, dtend, rrules, exrules, rdates, exdates)

    def create_from_recurrence_object(self, recurrence_obj):
        from recurrence import models

        recurrence_model = self.create(
            dtstart=to_utc(recurrence_obj.dtstart),
            dtend=to_utc(recurrence_obj.dtend))

        for rrule in recurrence_obj.rrules:
            models.Rule.objects.create_from_rule_object(
                choices.INCLUSION, rrule, recurrence_model)
        for exrule in recurrence_obj.exrules:
            models.Rule.objects.create_from_rule_object(
                choices.EXCLUSION, exrule, recurrence_model)

        for dt in recurrence_obj.rdates:
            recurrence_model.dates.create(mode=choices.INCLUSION, dt=to_utc(dt))
        for dt in recurrence_obj.exdates:
            recurrence_model.dates.create(mode=choices.EXCLUSION, dt=to_utc(dt))

        return recurrence_model
