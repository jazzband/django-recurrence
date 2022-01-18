from django import forms, urls
from django.conf import settings
from django.views import i18n
from django.utils.translation import gettext_lazy as _
from django.contrib.staticfiles.storage import staticfiles_storage

import recurrence
from recurrence import exceptions


class RecurrenceWidget(forms.Textarea):

    def __init__(self, attrs=None, **kwargs):
        self.js_widget_options = kwargs
        defaults = {'class': 'recurrence-widget'}
        if attrs is not None:
            defaults.update(attrs)
        super().__init__(defaults)

    def get_media(self):
        extra = '' if settings.DEBUG else '.min'
        js = [
            'admin/js/vendor/jquery/jquery%s.js' % extra,
            'admin/js/jquery.init.js',
            staticfiles_storage.url('recurrence/js/recurrence.js'),
            staticfiles_storage.url('recurrence/js/recurrence-widget.js'),
            staticfiles_storage.url('recurrence/js/recurrence-widget.init.js'),
        ]
        i18n_media = find_recurrence_i18n_js_catalog()
        if i18n_media:
            js.insert(0, i18n_media)

        return forms.Media(
            js=js, css={
                'all': (
                    staticfiles_storage.url('recurrence/css/recurrence.css'),
                ),
            },
        )
    media = property(get_media)


class RecurrenceField(forms.CharField):
    """
    A Field that accepts the recurrence related parameters of rfc2445.

    Values are deserialized into `recurrence.base.Recurrence` objects.
    """
    widget = RecurrenceWidget
    default_error_messages = {
        'invalid_frequency': _(
            u'Invalid frequency.'),
        'max_rrules_exceeded': _(
            u'Max rules exceeded. The limit is %(limit)s'),
        'max_exrules_exceeded': _(
            u'Max exclusion rules exceeded. The limit is %(limit)s'),
        'max_rdates_exceeded': _(
            u'Max dates exceeded. The limit is %(limit)s'),
        'max_exdates_exceeded': _(
            u'Max exclusion dates exceeded. The limit is %(limit)s'),
        'recurrence_required': _(
            u'This field is required. Set either a recurrence rule or date.'),
    }

    def __init__(
        self,
        frequencies=None, accept_dtstart=True, accept_dtend=True,
        max_rrules=None, max_exrules=None, max_rdates=None, max_exdates=None,
        *args, **kwargs
    ):
        """
        Create a recurrence field.

        A `RecurrenceField` takes the same parameters as a `CharField`
        field with some additional paramaters.

        :Parameters:
            `frequencies` : sequence
                A sequence of the frequency constants specifying which
                frequencies are valid for input. By default all
                frequencies are valid.

            `accept_dtstart` : bool
                Whether to accept a dtstart value passed in the input.

            `accept_dtend` : bool
                Whether to accept a dtend value passed in the input.

            `max_rrules` : int
                The max number of rrules to accept in the input. A
                value of ``0`` means input of rrules is disabled.

            `max_exrules` : int
                The max number of exrules to accept in the input. A
                value of ``0`` means input of exrules is disabled.

            `max_rdates` : int
                The max number of rdates to accept in the input. A
                value of ``0`` means input of rdates is disabled.

            `max_exdates` : int
                The max number of exdates to accept in the input. A
                value of ``0`` means input of exdates is disabled.
        """
        self.accept_dtstart = accept_dtstart
        self.accept_dtend = accept_dtend
        self.max_rrules = max_rrules
        self.max_exrules = max_exrules
        self.max_rdates = max_rdates
        self.max_exdates = max_exdates
        if frequencies is not None:
            self.frequencies = frequencies
        else:
            self.frequencies = (
                recurrence.YEARLY, recurrence.MONTHLY,
                recurrence.WEEKLY, recurrence.DAILY,
                recurrence.HOURLY, recurrence.MINUTELY,
                recurrence.SECONDLY,
            )
        super().__init__(*args, **kwargs)

    def clean(self, value):
        """
        Validates that ``value`` deserialized into a
        `recurrence.base.Recurrence` object falls within the
        parameters specified to the `RecurrenceField` constructor.
        """
        try:
            recurrence_obj = recurrence.deserialize(value)
        except exceptions.DeserializationError as error:
            raise forms.ValidationError(error.args[0])
        except TypeError:
            return None
        if not self.accept_dtstart:
            recurrence_obj.dtstart = None
        if not self.accept_dtend:
            recurrence_obj.dtend = None

        if self.max_rrules is not None:
            if len(recurrence_obj.rrules) > self.max_rrules:
                raise forms.ValidationError(
                    self.error_messages['max_rrules_exceeded'] % {
                        'limit': self.max_rrules
                    }
                )
        if self.max_exrules is not None:
            if len(recurrence_obj.exrules) > self.max_exrules:
                raise forms.ValidationError(
                    self.error_messages['max_exrules_exceeded'] % {
                        'limit': self.max_exrules
                    }
                )
        if self.max_rdates is not None:
            if len(recurrence_obj.rdates) > self.max_rdates:
                raise forms.ValidationError(
                    self.error_messages['max_rdates_exceeded'] % {
                        'limit': self.max_rdates
                    }
                )
        if self.max_exdates is not None:
            if len(recurrence_obj.exdates) > self.max_exdates:
                raise forms.ValidationError(
                    self.error_messages['max_exdates_exceeded'] % {
                        'limit': self.max_exdates
                    }
                )

        for rrule in recurrence_obj.rrules:
            if rrule.freq not in self.frequencies:
                raise forms.ValidationError(
                    self.error_messages['invalid_frequency'])
        for exrule in recurrence_obj.exrules:
            if exrule.freq not in self.frequencies:
                raise forms.ValidationError(
                    self.error_messages['invalid_frequency'])

        if self.required:
            if not recurrence_obj.rrules and not recurrence_obj.rdates and not recurrence_obj.exdates and not recurrence_obj.exrules:
                raise forms.ValidationError(
                    self.error_messages['recurrence_required']
                )

        return recurrence_obj


_recurrence_javascript_catalog_url = None


def find_recurrence_i18n_js_catalog():
    # used cached version
    global _recurrence_javascript_catalog_url
    if _recurrence_javascript_catalog_url:
        return _recurrence_javascript_catalog_url

    # first try to use the dynamic form of the javascript_catalog view
    if hasattr(i18n, 'javascript_catalog'):
        try:
            return urls.reverse(
                i18n.javascript_catalog, kwargs={'packages': 'recurrence'})
        except urls.NoReverseMatch:
            pass

    # then scan the entire urlconf for a javascript_catalague pattern
    # that manually selects recurrence as one of the packages to include
    def check_urlpatterns(urlpatterns):
        for pattern in urlpatterns:
            if hasattr(pattern, 'url_patterns'):
                match = check_urlpatterns(pattern.url_patterns)
                if match:
                    return match
            elif (hasattr(i18n, 'javascript_catalog') and pattern.callback == i18n.javascript_catalog and
                  'recurrence' in pattern.default_args.get('packages', [])):
                if pattern.name:
                    return urls.reverse(pattern.name)
                else:
                    return urls.reverse(pattern.callback)

    root_urlconf = __import__(settings.ROOT_URLCONF, {}, {}, [''])
    url = check_urlpatterns(root_urlconf.urlpatterns)
    # cache it for subsequent use
    _recurrence_javascript_catalog_url = url
    return url
