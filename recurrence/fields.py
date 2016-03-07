from django import VERSION
from django.db.models import fields
from django.utils.six import string_types, with_metaclass

import recurrence
from recurrence import forms

try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], [
        "^recurrence\.fields\.RecurrenceField",
    ])
except ImportError:
    pass


if VERSION >= (1, 8):
    _RecurrenceField = fields.Field
else:
    # Django < 1.8, deprecated code remove it after Django 1.9 release
    # in December 2015
    from django.db.models.fields.subclassing import SubfieldBase
    _RecurrenceField = with_metaclass(SubfieldBase, fields.Field)


class RecurrenceField(_RecurrenceField):
    """
    Field that stores a `recurrence.base.Recurrence` object to the
    database.
    """

    def get_internal_type(self):
        return 'TextField'

    def to_python(self, value):
        if value is None:
            return value
        if isinstance(value, recurrence.Recurrence):
            return value
        value = super(RecurrenceField, self).to_python(value) or u''
        return recurrence.deserialize(value)

    def from_db_value(self, value, *args, **kwargs):
        return self.to_python(value)

    def get_db_prep_value(self, value, connection=None, prepared=False):
        if isinstance(value, string_types):
            value = recurrence.deserialize(value)
        return recurrence.serialize(value)

    def value_to_string(self, obj):
        return self.get_db_prep_value(self._get_val_from_obj(obj))

    def formfield(self, **kwargs):
        defaults = {
            'form_class': forms.RecurrenceField,
            'widget': forms.RecurrenceWidget,
        }
        defaults.update(kwargs)
        return super(RecurrenceField, self).formfield(**defaults)
