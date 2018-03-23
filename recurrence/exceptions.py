from django.core.exceptions import ValidationError


class RecurrenceError(ValidationError):
    pass


class SerializationError(RecurrenceError):
    pass


class DeserializationError(RecurrenceError):
    pass
