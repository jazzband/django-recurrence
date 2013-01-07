from django.db.models import fields
from django.db.models.fields import related, subclassing

import recurrence
from recurrence import models, forms

try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], [
        "^recurrence\.fields\.RecurrenceField",
        "^recurrence\.fields\.RecurrenceModelField",
    ])
except ImportError:
    pass 


class RecurrenceField(fields.Field):
    """
    Field that stores a `recurrence.base.Recurrence` object to the
    database.
    """
    __metaclass__ = subclassing.SubfieldBase

    def get_internal_type(self):
        return 'TextField'

    def to_python(self, value):
        if value is None:
            return value
        if isinstance(value, recurrence.Recurrence):
            return value
        value = super(RecurrenceField, self).to_python(value) or u''
        return recurrence.deserialize(value)

    def get_db_prep_value(self, value, connection=None, prepared=False):
        if value is None and self.null == False:
            raise ValueError(
                'Cannot assign None: "%s.%s" does not allow null values.' % (
                self.model._meta.object_name, self.name))

        if isinstance(value, basestring):
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


class RecurrenceModelField(related.OneToOneField):
    """
    A `OneToOneField` to a `recurrence.models.Recurrence` model object.

    The value is represented by a `recurrence.base.Recurrence` to
    provide behavior like that of `RecurrenceField`, and it is
    automatically converted to a model object on save.

    `RecurrenceModelField` mediates the creation and deletion of the
    related `recurrence.models.Recurrence` model. While updating the
    model instance on which `RecurrenceField` is being used, the
    policy is to delete the existing `recurrence.models.Recurrence`
    model object and replace it with a new one if the
    `recurrence.base.Recurrence` object is determined to be different.
    """
    def __init__(self, **kwargs):
        if 'to' in kwargs:
            kwargs.pop('to')
        super(RecurrenceModelField, self).__init__(models.Recurrence, **kwargs)

    def pre_save(self, model_instance, add):
        # obtain model if already exists. obj may represent the model
        # or a different one set but not saved to the db.
        try:
            obj = getattr(model_instance, self.name)
            model = getattr(model_instance, self.get_cache_name(), None)
        except models.Recurrence.DoesNotExist:
            # if null=False and model doesn't exist. This is for model
            # instances not yet stored in the db.
            obj = None
            model = None
        if model:
            if obj is not None:
                if model.to_recurrence_object() != obj:
                    model.delete()
                else:
                    return super(RecurrenceModelField, self).pre_save(
                        model_instance, add)
            else:
                model.delete()
        if obj is not None:
            model = models.Recurrence.objects.create_from_recurrence_object(obj)
            setattr(model_instance, self.attname, model.pk)
            setattr(model_instance, self.get_cache_name(), model)
        else:
            setattr(model_instance, self.attname, None)
            try:
                delattr(model_instance, self.get_cache_name())
            except AttributeError:
                pass

        return super(RecurrenceModelField, self).pre_save(model_instance, add)

    def contribute_to_class(self, cls, name):
        super(RecurrenceModelField, self).contribute_to_class(cls, name)
        setattr(cls, self.name, RecurrenceModelDescriptor(self))

    def formfield(self, **kwargs):
        defaults = {'form_class': forms.RecurrenceField}
        defaults.update(kwargs)
        return super(RecurrenceField, self).formfield(**defaults)


class RecurrenceModelDescriptor(related.ReverseSingleRelatedObjectDescriptor):
    def __get__(self, instance, instance_type=None):
        try:
            return getattr(
                instance, '%s_recurrence' % self.field.get_cache_name())
        except AttributeError:
            pass
        model = super(RecurrenceModelDescriptor, self).__get__(
            instance, instance_type)
        if model is None:
            return None
        recurrence_obj = model.to_recurrence_object()
        setattr(
            instance, '%s_recurrence' % self.field.get_cache_name(),
            recurrence_obj)
        return recurrence_obj

    def __set__(self, instance, value):
        if instance is None:
            raise AttributeError(
                    "%s must be accessed via instance" % self._field.name)

        if value is None and self.field.null == False:
            raise ValueError(
                'Cannot assign None: "%s.%s" does not allow null values.' % (
                instance._meta.object_name, self.field.name))
        elif value is not None and not isinstance(value, recurrence.Recurrence):
            raise ValueError(
                'Cannot assign "%r": "%s.%s" must be a "%s" instance.' % (
                value, instance._meta.object_name,
                self.field.name, recurrence.Recurrence.__name__))

        setattr(instance, '%s_recurrence' % self.field.get_cache_name(), value)
