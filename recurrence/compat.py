try:
    from django.db.models.fields.subclassing import Creator
except ImportError:
    # This class was removed in Django 1.10, so I've pulled it into
    # django-recurrence.

    class Creator:
        """
        A placeholder class that provides a way to set the attribute
        on the model.
        """
        def __init__(self, field):
            self.field = field

        def __get__(self, obj, type=None):
            if obj is None:
                return self
            return obj.__dict__[self.field.name]

        def __set__(self, obj, value):
            obj.__dict__[self.field.name] = self.field.to_python(value)
