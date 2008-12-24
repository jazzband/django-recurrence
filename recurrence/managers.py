from dateutil import rrule

from django.db.models import manager


class RruleManager(manager.Manager):
    related_params = (
        'bysetpos', 'bymonth', 'bymonthday', 'byyearday', 'byeaster',
        'byweekno', 'byweekday', 'byhour', 'byminute', 'bysecond'
    )
    
    def create(
        self, freq,
        dtstart=None, interval=1, wkst=None, count=None, until=None,
        bysetpos=None, bymonth=None, bymonthday=None, byyearday=None,
        byeaster=None, byweekno=None, byweekday=None, byhour=None,
        byminute=None, bysecond=None):

        rrule_model = super(RruleManager, self).create(
            freq=freq, dtstart=dtstart, interval=interval,
            wkst=wkst, count=count, until=until,
        )

        for param in self.related_params:
            value_list = locals()[param]
            if not value_list:
                continue
            related_manager = getattr(rrule_model, param)
            if not hasattr(value_list, '__iter__'):
                value_list = [value_list]
            for value in value_list:
                related_manager.create(value=value)

        return rrule_model

    def to_rrule(self, rrule_model, cache=False):
        rrule_args = (rrule_model.freq,)
        rrule_kwargs = {
            'cache': cache,
            'dtstart': rrule_model.dtstart,
            'interval': rrule_model.interval,
            'wkst': rrule_model.wkst,
            'count': rrule_model.count,
            'until': rrule_model.until,
        }

        for param in self.related_params:
            related_manager = getattr(rrule_model, param)
            rrule_kwargs[param] = (
                map(lambda v: v[0], related_manager.values_list('value'))
                or None)

        return rrule.rrule(*rrule_args, **rrule_kwargs)


class RruleSetManager(manager.Manager):
    def create(self, rrules=[], rdates=[], exrules=[], exdates=[]):
        rruleset_model = super(RrulesetManager, self).create()

        for rrule_model in rrules:
            if not rrule_model.pk:
                rrule_model.save()
            rruleset_model.rrules.add(rrule_model)
        for exrule_model in exrules:
            if not exrule_model.pk:
                exrule_model.save()
            rruleset_model.exrules.add(exrule_model)

        for dt in rdates:
            rruleset_model.rdates.create(dt=dt)
        for dt in exdates:
            rruleset_model.exdates.create(dt=dt)

        return rruleset_model
    
    def to_rruleset(self, rruleset_model, cache=False):
        rruleset = rrule.rruleset(cache=cache)

        for rrule_model in rruleset_model.rrules.all():
            rruleset.rrule(rrule_model.to_rrule())
        for rdate_model in rruleset_model.rdates.all():
            rruleset.rdate(rdate_model.dt)
        for exrule_model in rruleset_model.exrules.all():
            rruleset.exrule(exrule_model.to_rrule())
        for exdate_model in rruleset_model.exdates.all():
            rruleset.exdate(exdate_model.dt)

        return rruleset
