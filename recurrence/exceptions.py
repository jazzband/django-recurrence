class RecurrenceError(Exception): pass

class SerializationError(RecurrenceError): pass

class DeserializationError(RecurrenceError): pass

class ValidationError(RecurrenceError): pass
