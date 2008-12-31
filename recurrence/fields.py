from django.db.models import fields
from django.db.models.fields import subclassing

import recurrence


class RecurrenceField(fields.TextField):
    __metaclass__ = subclassing.SubfieldBase

    def to_python(self, value):
        value = super(RecurrenceField, self).to_python(value) or u''
        return recurrence.deserialize(value)

    def get_db_prep_value(self, value):
        if isinstance(value, basestring):
            value = recurrence.deserialize(value)
        return recurrence.serialize(value)

    def value_to_string(self, obj):
        return self.get_db_prep_value(self._get_val_from_obj(obj))
