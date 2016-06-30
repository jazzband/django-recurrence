from django.db.models import fields
from django.utils.six import string_types
import recurrence
from recurrence import forms
from recurrence.compat import Creator

try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], [
        "^recurrence\.fields\.RecurrenceField",
    ])
except ImportError:
    pass


# Do not use SubfieldBase meta class because is removed in Django 1.10

class RecurrenceField(fields.Field):
    """Field that stores a `recurrence.base.Recurrence` to the database."""

    def get_internal_type(self):
        return 'TextField'

    def to_python(self, value):
        if value is None or isinstance(value, recurrence.Recurrence):
            return value
        value = super(RecurrenceField, self).to_python(value) or u''
        return recurrence.deserialize(value)

    def from_db_value(self, value, *args, **kwargs):
        return self.to_python(value)

    def get_prep_value(self, value):
        if not isinstance(value, string_types):
            value = recurrence.serialize(value)
        return value

    def contribute_to_class(self, cls, *args, **kwargs):
        super(RecurrenceField, self).contribute_to_class(cls, *args, **kwargs)
        setattr(cls, self.name, Creator(self))

    def value_to_string(self, obj):
        return self.get_prep_value(self._get_val_from_obj(obj))

    def formfield(self, **kwargs):
        defaults = {
            'form_class': forms.RecurrenceField,
            'widget': forms.RecurrenceWidget,
        }
        defaults.update(kwargs)
        return super(RecurrenceField, self).formfield(**defaults)
