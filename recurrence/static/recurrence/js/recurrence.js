if (!recurrence)
    var recurrence = {};


recurrence.Rule = function(freq, options) {
    this.init(freq, options);
};
recurrence.Rule.prototype = {
    init: function(freq, options) {
        this.freq = freq;

        options = options || {};
        this.interval = options.interval || 1;
        this.wkst = options.wkst || null;
        this.count = options.count || null;
        this.until = options.until || null;

        recurrence.array.foreach(
            recurrence.byparams, function (param) {
                if (options[param]) {
                    var value = options[param];
                    if (value == null)
                        value = [];
                    this[param] = recurrence.array.from(value);
                } else {
                    this[param] = [];
                }
            }, this);
    },

    copy: function() {
        var until = this.until;
        if (until)
            until = new Date(until.valueOf());
        var rule = new recurrence.Rule(this.freq, this);
        rule.until = until;
        return rule;
    },

    update: function(rule) {
        rule = rule.copy();
        this.freq = rule.freq;
        this.interval = rule.interval;
        this.wkst = rule.wkst;
        this.until = rule.until;
        this.count = rule.count;

        recurrence.array.foreach(
            recurrence.byparams, function(param) {
                this[param] = rule[param];
            }, this);
    },

    get_display_text: function(short) {
        short = short || false;
        var parts = [];

        var get_position_display = function(position) {
            if (short)
                return recurrence.display.weekdays_position_short[
                    String(position)];
            else
                return recurrence.display.weekdays_position[
                    String(position)];
        };
        var get_weekday_display = function(number) {
            if (short)
                return recurrence.display.weekdays_short[number];
            else
                return recurrence.display.weekdays[number];
        };
        var get_position_weekday = function(rule) {
            var items = [];
            if (rule.bysetpos.length && rule.byday.length) {
                recurrence.array.foreach(
                    rule.bysetpos, function(x) {
                        var label = get_position_display(x || 1);
                        recurrence.array.foreach(
                            rule.byday, function(y) {
                                var weekday_display = get_weekday_display(
                                    recurrence.to_weekday(y).number);
                                items.push(
                                    interpolate(
                                        label, {'weekday': weekday_display}, true));
                            });
                    });

            } else if (rule.byday.length) {
                // TODO byday Weekday objects without index means
                // every weekday in the month, and so should appear in
                // plural. i.e. 'on sundays' instead of
                // 'on the first sunday'.
                recurrence.array.foreach(
                    rule.byday, function(x, i) {
                        var label = get_position_display(x.index || 1);
                        var weekday_display = get_weekday_display(
                            recurrence.to_weekday(x).number);
                        items.push(
                            interpolate(
                                label, {'weekday': weekday_display}, true));
                    });
            }
            return items.join(', ');
        }

        if (this.interval > 1)
            parts.push(
                interpolate(
                    recurrence.display.tokens.every_number_freq, {
                        'number': this.interval,
                        'freq': recurrence.display.timeintervals_plural[this.freq]
                    }, true));
        else
            parts.push(recurrence.display.frequencies[this.freq]);

        if (this.freq == recurrence.YEARLY) {
            if (this.bymonth.length) {
                // i.e. 'each january, june'
                if (short)
                    var months = recurrence.display.months_short;
                else
                    var months = recurrence.display.months;
                var items = recurrence.array.foreach(
                    this.bymonth, function(month, i) {
                        return months[month - 1];
                    });
                items = items.join(', ');
                parts.push(
                    interpolate(
                        recurrence.display.tokens.each,
                        {'items': items}, true));
            }

            if (this.byday.length || this.bysetpos.length) {
                var weekday_items = get_position_weekday(this);
                parts.push(
                    interpolate(
                        recurrence.display.tokens.on_the_items,
                        {'items': weekday_items}, true));
            }
        }

        if (this.freq == recurrence.MONTHLY) {
            if (this.bymonthday.length) {
                // i.e. 'on the 1st, 5th, 10th'
                var items = recurrence.array.foreach(
                    this.bymonthday, function(day, i) {
			if (day < 0) {
			    if (short) {
				return recurrence.display.last_of_month_short[String(day)]
			    } else {
				return recurrence.display.last_of_month[String(day)]
			    }
			} else {
                            var dt = new Date();
                            dt.setMonth(0);
                            dt.setDate(day);
                            return recurrence.date.format(dt, recurrence.display.month_day);
			}
                });
                items = items.join(', ');
                parts.push(
                    interpolate(
                        recurrence.display.tokens.on_the_items,
                        {'items': items}, true));

            } else if (this.byday.length) {
                if (this.byday.length || this.bysetpos.length) {
                    var weekday_items = get_position_weekday(this);
                    parts.push(
                        interpolate(
                            recurrence.display.tokens.on_the_items,
                            {'items': weekday_items}, true));
                }
            }
        }

        if (this.freq == recurrence.WEEKLY) {
            if (this.byday.length) {
                // i.e. 'each tuesday, wednesday'
                var items = recurrence.array.foreach(
                    this.byday, function(byday) {
                        var weekday_number = recurrence.to_weekday(byday).number;
                        if (short)
                            var weekday = recurrence.display.weekdays_short[
                                weekday_number];
                        else
                            var weekday = recurrence.display.weekdays[
                                weekday_number];
                        return weekday;
                    });
                items = items.join(', ');
                parts.push(
                    interpolate(
                        recurrence.display.tokens.each,
                        {'items': items}, true));
            }
        }

        // daily frequencies has no additional formatting,
        // hour/minute/second formatting not supported.

        if (this.count) {
            if (this.count == 1)
                parts.push(
                    interpolate(
                        recurrence.display.tokens.count,
                        {'number': this.count}, true));
            else
                parts.push(
                    interpolate(
                        recurrence.display.tokens.count_plural,
                        {'number': this.count}, true));
        } else if (this.until) {
            parts.push(
                interpolate(
                    recurrence.display.tokens.until,
                    {'date': recurrence.date.format(this.until, pgettext('Until date format', '%Y-%m-%d'))}, true));
        }

        return parts.join(', ');
    }
};


recurrence.Recurrence = function(options) {
    this.init(options);
};
recurrence.Recurrence.prototype = {
    init: function(options) {
        options = options || {};
        this.dtstart = options.dtstart || null;
        this.dtend = options.dtend || null;
        this.rrules = recurrence.array.from(options.rrules || []);
        this.exrules = recurrence.array.from(options.exrules || []);
        this.rdates = recurrence.array.from(options.rdates || []);
        this.exdates = recurrence.array.from(options.exdates || []);
    },

    copy: function() {
        return new recurrence.Recurrence({
            'rrules': recurrence.array.foreach(
                this.rrules, function(item) {return item.copy();}),
            'exrules': recurrence.array.foreach(
                this.exrules, function(item) {return item.copy();}),
            'rdates': recurrence.array.foreach(
                this.rdates, function(item) {return item.copy();}),
            'exdates': recurrence.array.foreach(
                this.exdates, function(item) {return item.copy();})
        });
    },

    serialize: function() {
        return recurrence.serialize(this);
    }
};


recurrence.Weekday = function(number, index) {
    this.init(number, index);
};
recurrence.Weekday.prototype = {
    init: function(number, index) {
        this.number = number;
        this.index = index || null;
    },

    with_index: function(index) {
        if (index == this.index)
            return this;
        else
            return new recurrence.Weekday(this.number, index);
    },

    equals: function(other) {
        if (this.number == other.number && this.index == other.index)
            return True;
        else
            return False;
    },

    toString: function() {
        if (this.index)
            return this.index + recurrence.weekdays[this.number];
        else
            return recurrence.weekdays[this.number];
    }
};


recurrence.DateFormat = function(date) {
    this.init(date);
};
recurrence.DateFormat.prototype = {
    init: function(date) {
        this.data = date;
    },

    format: function(format) {
        var tokens = format.match(recurrence.DateFormat.formatchars);
        recurrence.array.foreach(tokens, function(token) {
            if (this[token.charAt(1)])
                format = format.replace(token, this[token.charAt(1)]());
        }, this);
        return format;
    },

    a: function() {
        if (this.data.getHours() > 11)
            return recurrence.display.ampm.am;
        else
            return recurrence.display.ampm.pm;
    },

    A: function() {
        if (this.data.getHours() > 11)
            return recurrence.display.ampm.AM;
        else
            return recurrence.display.ampm.PM;
    },

    f: function() {
        if (this.data.getMinutes() == 0)
            return this.g();
        else
            return [this.g(), this.i()].join(':');
    },

    g: function() {
        if (this.data.getHours() == 0)
            return 12;
        else
            return this.data.getHours() - 12;
        return this.data.getHours();
    },

    G: function() {
        return this.data.getHours();
    },

    h: function() {
        return recurrence.string.rjust(String(this.g()), 2, '0');
    },

    H: function() {
        return recurrence.string.rjust(String(this.G()), 2, '0');
    },

    i: function() {
        return recurrence.string.rjust(String(this.data.getMinutes()), 2, '0');
    },

    P: function() {
        if (this.data.getMinutes() == 0 && this.data.getHours() == 0)
            return recurrence.display.tokens.midnight;
        if (this.data.getMinutes() == 0 && this.data.getHours() == 12)
            return recurrence.display.tokens.noon;
    },

    s: function() {
        return recurrence.string.rjust(String(this.data.getSeconds()), 2, '0');
    },

    Y: function() {
        return this.data.getFullYear();
    },

    b: function() {
        return recurrence.display.months_short[this.data.getMonth()];
    },

    d: function() {
        return recurrence.string.rjust(String(this.data.getDate()), 2, '0');
    },

    D: function() {
        return recurrence.display.weekdays_short[
            recurrence.date.weekday(this.data)];
    },

    F: function() {
        return recurrence.display.months[this.data.getMonth()];
    },

    I: function() {
        var now = new Date();
        var date1 = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        var date2 = new Date(now.getFullYear(), 6, 1, 0, 0, 0, 0);
        var temp = date1.toGMTString();
        var date3 = new Date(temp.substring(0, temp.lastIndexOf(' ')-1));
        var temp = date2.toGMTString();
        var date4 = new Date(temp.substring(0, temp.lastIndexOf(" ")-1));
        var hours_diff_standard_time = (date1 - date3) / (1000 * 60 * 60);
        var hours_diff_daylight_time = (date2 - date4) / (1000 * 60 * 60);
        if (hours_diff_daylight_time == hours_diff_standard_time)
            return '0';
        else
            return '1';
    },

    j: function() {
        return this.data.getDate();
    },

    l: function() {
        return recurrence.display.weekdays[
            recurrence.date.weekday(this.data)];
    },

    L: function() {
        return recurrence.date.isleap(this.data);
    },

    m: function() {
        return recurrence.string.rjust(
            String(this.data.getMonth() + 1), 2, '0');
    },

    M: function() {
        return recurrence.display.months_short[this.data.getMonth()];
    },

    n: function() {
        return this.data.getMonth() + 1;
    },

    N: function() {
        return recurrence.display.months_ap[this.data.getMonth()];
    },

    O: function() {
        var seconds = this.Z();
        return (
            '+' +
            recurrence.string.rjust(
                String(Math.floor(seconds / 3600)), 2, '0') +
            recurrence.string.rjust(
                String(Math.floor((seconds / 60) % 60)), 2, '0'));
    },

    r: function() {
        return recurrence.date.format(this, '%D, %j %M %Y %H:%i:%s %O');
    },

    S: function() {
        var day = this.data.getDate();
        var ordinal_indicator = recurrence.display.ordinal_indicator;
        var language_code = recurrence.language_code;
        if (language_code in ordinal_indicator) {
            return ordinal_indicator[language_code](day);
	} else if (language_code.split('-')[0] in ordinal_indicator) {
	    return ordinal_indicator[language_code.split('-')[0]](day)
	}
        return '';
    },

    t: function() {
        var month = this.data.getMonth()
        var ndays =
            recurrence.DateFormat.mdays[month] +
            (month == recurrence.FEBRUARY && this.L());
        return recurrence.string.rjust(String(ndays), 2, '0');
    },

    T: function() {
        var tzname = String(this.data).match(/\([^\)]+\)/g).slice(1, -1);
        if (!tzname)
            tzname = recurrence.date.format(this, '%O');
        return tzname;
    },

    U: function() {
        return this.data.getTime();
    },

    w: function() {
        return recurrence.date.weekday(this.data.weekday);
    },

    W: function() {
        var week_number = null;
        var jan1_weekday = new Date(
            this.data.getFullYear(), this.data.getMonth(), 1);
        var weekday = this.data.getDay();
        var day_of_year = self.z();
        var prev_year = new Date(this.data.getFullYear() - 1, 0, 1);
        if (day_of_year <= (8 - jan1_weekday) && jan1_weekday > 4) {
            if (jan1_weekday == 5 ||
                (jan1_weekday == 6 && recurrence.date.isleap(prev_year)))
                week_number = 53;
            else
                week_number = 52;
        } else {
            if (recurrence.date.isleap(this.data))
                var i = 366;
            else
                var i = 365;
            if ((i - day_of_year) < (4 - weekday)) {
                week_number = 1;
            } else {
                var j = day_of_year + (7 - weekday) + (jan1_weekday - 1);
                week_number = Math.floor(j / 7);
                if (jan1_weekday > 4)
                    week_number = week_number - 1;
            }
        }
        return week_number;
    },

    y: function() {
        return String(this.data.getFullYear()).slice(2);
    },

    Y: function() {
        return this.data.getFullYear();
    },

    z: function() {
        var doy = recurrence.DateFormat.year_days[this.data.getMonth()] +
            this.data.getDate();
        if (this.L() && this.data.getMonth() > 2)
            doy += 1;
        return doy;
    },

    Z: function() {
        var offset = this.data.getTimezoneOffset();
        return offset * 60;
    }
};
recurrence.DateFormat.formatchars = RegExp(
    '%[aAbBdDfFgGhHiIjlLmMnNOPrsStTUwWyYzZ]', 'g');
recurrence.DateFormat.year_days = [
    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
recurrence.DateFormat.mdays = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];


recurrence.to_weekday = function(token) {
    if (token.number && token.index) {
        return new recurrence.Weekday(token.number, token.index);
    } else if (String(token).match(/[^0-9\-]/g)) {
        var token = String(token);
        var constant = token.slice(-2, token.length);
        var nth = token.slice(0, -2);
        if (nth.match(/[^0-9\-]/g))
            throw Error('Invalid weekday token.');
        var weekday = recurrence.weekdays.indexOf(constant);
        if (weekday < 0)
            throw Error('Invalid weekday token.');
        else
            return new recurrence.Weekday(weekday, nth || null);
    } else {
        return new recurrence.Weekday(parseInt(token, 10));
    }
    throw Error('Invalid weekday token.');
};


recurrence.serialize = function(rule_or_recurrence) {
    var serialize_dt = function(dt) {
        var pad = function(initial, length) {
            initial = String(initial)
            var offset = length - initial.length;
            if (offset < 0) {
                return initial;
            } else {
                while (initial.length < length) {
                    initial = '0' + initial;
                }
                return initial;
            }
        };
        return pad(dt.getUTCFullYear(), 4) +
            pad(dt.getUTCMonth() + 1, 2) +
            pad(dt.getUTCDate(), 2) + 'T' +
            pad(dt.getUTCHours(), 2) +
            pad(dt.getUTCMinutes(), 2) +
            pad(dt.getUTCSeconds(), 2) + 'Z';
    };

    var serialize_rule = function(rule) {
        var map_to_string = function(sequence) {
            var new_sequence = [];
            recurrence.array.foreach(sequence, function(item) {
                    new_sequence.push(String(item));
            });
            return new_sequence;
        };

        var map_to_param = function(sequence) {
            var new_sequence = [];
            recurrence.array.foreach(sequence, function(item) {
                new_sequence.push(item[0] + '=' + item[1].join(','));
            });
            return new_sequence;
        };

        var values = [];

        values.push(['FREQ', [recurrence.frequencies[rule.freq]]]);
        if (rule.interval != 1)
            values.push(['INTERVAL', [String(rule.interval)]]);
        if (rule.wkst)
            values.push(['WKST', [recurrence.weekdays[rule.wkst]]]);
        if (rule.count != null)
            values.push(['COUNT', [String(rule.count)]]);
        else if (rule.until != null)
            values.push(['UNTIL', [serialize_dt(rule.until)]]);
        if (rule.byday.length) {
            var days = recurrence.array.foreach(rule.byday, function(item) {
                return recurrence.to_weekday(item).toString();
            });
            values.push(['BYDAY', days]);
        }
        recurrence.array.foreach(recurrence.byparams, function(param) {
            if (param != 'byday') {
                var value_list = rule[param] || [];
                if (value_list.length)
                    values.push([param.toUpperCase(), map_to_string(value_list)]);
            }
        });
        return map_to_param(values).join(';');
    };

    var map_to_property = function(sequence) {
        var new_sequence = recurrence.array.foreach(
            sequence, function(item) {
                return item.join(':');
            });
        return new_sequence;
    };

    var obj = rule_or_recurrence;
    if (obj.freq)
        obj = new recurrence.Recurrence({'rrules': [obj]});

    var items = [];

    if (obj.dtstart)
        items.push(['DTSTART', serialize_dt(obj.dtstart)]);
    if (obj.dtend)
        items.push(['DTEND', serialize_dt(obj.dtend)]);

    recurrence.array.foreach(
        obj.rrules, function(item) {
            items.push(['RRULE', serialize_rule(item)]);
        });
    recurrence.array.foreach(
        obj.exrules, function(item) {
            items.push(['EXRULE', serialize_rule(item)]);
        });
    recurrence.array.foreach(
        obj.rdates, function(item) {
            items.push(['RDATE', serialize_dt(item)]);
        });
    recurrence.array.foreach(
        obj.exdates, function(item) {
            items.push(['EXDATE', serialize_dt(item)]);
        });

    return map_to_property(items).join('\n');
};


recurrence.deserialize = function(text) {
    var deserialize_dt = function(text) {
        var year = parseInt(text.slice(0, 4), 10);
        var month = parseInt(text.slice(4, 6), 10);
        var day = parseInt(text.slice(6, 8), 10);
        if (text.indexOf('T') > 0) {
            var hour = parseInt(text.slice(9, 11), 10);
            var minute = parseInt(text.slice(11, 13), 10);
            var second = parseInt(text.slice(13, 15), 10);
        } else {
            var hour = 0;
            var minute = 0;
            var second = 0;
        }
        var dt = new Date();
        if (text.indexOf('Z') > 0) {
            dt.setTime(Date.UTC(year, month - 1, day, hour, minute, second) / 1);
        } else {
            dt.setTime(new Date(year, month - 1, day, hour, minute, second).getTime());
        }
        return dt;
    };

    var dtstart = null;
    var dtend = null;
    var rrules = [];
    var exrules = [];
    var rdates = [];
    var exdates = [];

    var pattern = /(DTSTART|DTEND|RRULE|EXRULE|RDATE|EXDATE)[^:]*:(.*)/g;
    var tokens = text.match(pattern) || [];

    recurrence.array.foreach(
        tokens, function(token) {
            var label = token.split(':', 2)[0];
            var param_text = token.split(':', 2)[1];

            if (param_text.indexOf('=') < 0) {
                var params = param_text;
            } else {
                var param_tokens = param_text.split(';');
                var params = recurrence.array.foreach(
                    param_tokens, function(item) {
                        var param_name = recurrence.string.strip(
                            item.split('=', 2)[0]);
                        var param_value = recurrence.string.strip(
                            item.split('=', 2)[1]);
                        var value_list = param_value.split(',');
                        var value_list = recurrence.array.foreach(
                            param_value.split(','), function(item) {
                                return recurrence.string.strip(item);
                            });
                        return [param_name, value_list];
                    });
            }

            if (label == 'RRULE' || label == 'EXRULE') {
                var freq = 0;
                var options = {};
                recurrence.array.foreach(
                    params, function(item) {
                        var key = item[0];
                        var param = key.toLowerCase();
                        var value = item[1];

                        if (key == 'FREQ') {
                            if (recurrence.frequencies.indexOf(value[0]) != -1) {
                                freq = recurrence.frequencies.indexOf(value[0]);
                            }
                        } else if (key == 'INTERVAL') {
                            options[param] = parseInt(value[0], 10);
                        } else if (key == 'WKST') {
                            options[param] = recurrence.to_weekday(value[0]);
                        } else if (key == 'COUNT') {
                            options[param] = parseInt(value[0], 10);
                        } else if (key == 'UNTIL') {
                            options[param] = deserialize_dt(value[0]);
                        } else if (key == 'BYDAY') {
                            options[param] = recurrence.array.foreach(
                                value, function(item) {
                                    return recurrence.to_weekday(item);
                                });
                        } else {
                            options[param] = recurrence.array.foreach(
                                value, function(item) {
                                    return parseInt(item, 10);
                                });
                        }
                    });
                if (label == 'RRULE')
                    rrules.push(new recurrence.Rule(freq, options));
                else
                    exrules.push(new recurrence.Rule(freq, options));

            } else if (label == 'DTSTART') {
                dtstart = deserialize_dt(params);
            } else if (label == 'DTEND') {
                dtend = deserialize_dt(params);
            } else if (label == 'RDATE') {
                rdates.push(deserialize_dt(params));
            } else if (label == 'EXDATE') {
                exdates.push(deserialize_dt(params));
            }
        });

    return new recurrence.Recurrence({
        'dtstart': dtstart, 'dtend': dtend,
        'rrules': rrules, 'exrules': exrules,
        'rdates': rdates, 'exdates': exdates
    });
};


recurrence.log = function(message) {
    var dom = document.createElement('div');
    dom.innerHTML = message;
    document.body.insertBefore(dom, document.body.firstChild);
};


recurrence.string = {
    format: function(string, map) {
        for (var key in map)
            string = string.replace(RegExp('%' + key, 'g'), map[key]);
        return string
    },

    capitalize: function(string) {
        return (
            string.charAt(0).toUpperCase() +
            string.slice(1, string.length));
    },

    strip: function(string) {
        return string.replace(
            /^[ \t\n\r]*/, '').replace(/[ \t\n\r]*$/, '');
    },

    rjust: function(string, length, character) {
        var initial = String(string);
        var offset = length - initial.length;
        character = character || ' ';
        if (offset < 0) {
            return initial;
        } else {
            while (initial.length < length) {
                initial = character.charAt(0) + initial;
            }
            return initial;
        }
    },

    ljust: function(string, length, character) {
        var initial = String(string);
        var offset = length - initial.length;
        character = character || ' ';
        if (offset < 0) {
            return initial;
        } else {
            while (initial.length < length) {
                initial = initial + character[0];
            }
            return initial;
        }
    }
};


recurrence.date = {
    format: function(date, format) {
        return new recurrence.DateFormat(date).format(format);
    },

    isleap: function(date) {
        var year = date.getFullYear();
        return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    },

    weekday: function(date) {
        var day = date.getDay() - 1;
        if (day < 0)
            day = day + 7;
        else if (day > 6)
            day = day - 7;
        return day;
    },

    days_in_month: function(date) {
        var m = date.getMonth() + 1;
        var y = date.getFullYear();
        if (m == 1 || m == 3 || m == 5 || m == 7 ||
            m == 8 || m == 10 || m == 12)
            return 31;
        else if (m == 4 || m == 6 || m == 9 || m == 11)
            return 30;
        else if (m == 2 && recurrence.date.isleap(date))
            return 29;
        else
            return 28;
    }
};


recurrence.array = {
    foreach: function(array, func, bindto) {
        if (bindto)
            func = recurrence.func.bind(func, bindto);
        array = recurrence.array.from(array);
        var return_values = [];
        for (var i=0; i < array.length; i++)
            return_values.push(func(array[i], i));
        return return_values;
    },

    from: function(iterable) {
        if (!iterable)
            return [];
        if (iterable.toArray) {
            return iterable.toArray();
        } else {
            var results = [];
            for (var i=0, length=iterable.length; i < length; i++)
                results.push(iterable[i]);
            return results;
        }
    },

    remove: function(array, item) {
        array.splice(array.indexOf(item), 1);
    }
};


recurrence.func = {
    bind: function() {
        var args = recurrence.array.from(arguments);
        var func = args.shift();
        var object = args.shift();
        return function() {
            return func.apply(
                object, args.concat(recurrence.array.from(arguments)));
        }
    }
};


if (!Array.indexOf) {
    // ie doesn't have indexOf on arrays
    Array.prototype.indexOf = function(obj) {
        for (var i=0; i < this.length; i++)
            if (this[i] == obj)
                return i;
        return -1;
    };
}


// frequencies
recurrence.YEARLY = 0;
recurrence.MONTHLY = 1;
recurrence.WEEKLY = 2;
recurrence.DAILY = 3;
recurrence.HOURLY = 4;
recurrence.MINUTELY = 5;
recurrence.SECONDLY = 6;

// months
recurrence.JANUARY = 1;
recurrence.FEBRUARY = 2;
recurrence.MARCH = 3;
recurrence.APRIL = 4;
recurrence.MAY = 5;
recurrence.JUNE = 6;
recurrence.JULY = 7;
recurrence.AUGUST = 8;
recurrence.SEPTEMBER = 9;
recurrence.OCTOBER = 10;
recurrence.NOVEMBER = 11;
recurrence.DECEMBER = 12;

// weekdays
recurrence.MONDAY = recurrence.MO = new recurrence.Weekday(0, null);
recurrence.TUEDSAY = recurrence.TU = new recurrence.Weekday(1, null);
recurrence.WEDNESDAY = recurrence.WE = new recurrence.Weekday(2, null);
recurrence.THURSDAY = recurrence.TH = new recurrence.Weekday(3, null);
recurrence.FRIDAY = recurrence.FR = new recurrence.Weekday(4, null);
recurrence.SATURDAY = recurrence.SA = new recurrence.Weekday(5, null);
recurrence.SUNDAY = recurrence.SU = new recurrence.Weekday(6, null);

// enumerations
recurrence.byparams = [
    'bysetpos', 'bymonth', 'bymonthday', 'byyearday',
    'byweekno', 'byday', 'byhour', 'byminute', 'bysecond'
];
recurrence.frequencies = [
    'YEARLY', 'MONTHLY', 'WEEKLY', 'DAILY',
    'HOURLY', 'MINUTELY', 'SECONDLY'
];
recurrence.weekdays = [
    'MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'
];
// recurrence.firstweekday = 0;


// i18n no-ops if jsi18n not loaded

if (typeof(catalog) === 'undefined') {
    var catalog = [];
} else {
    var catalog = catalog;
}

var gettext = gettext || function(msgid) {
    var value = catalog[msgid];
    if (typeof(value) == 'undefined') {
        return msgid;
    } else {
        return (typeof(value) == 'string') ? value : value[0];
    }
};

var interpolate = interpolate || function(fmt, obj, named) {
    if (named) {
        return fmt.replace(/%\(\w+\)s/g, function(match) {
            return String(obj[match.slice(2,-2)])
        });
    } else {
        return fmt.replace(/%s/g, function(match) {
            return String(obj.shift())
        });
    }
};


// display

if (!recurrence.display)
    recurrence.display = {};

recurrence.display.tokens = {
    'midnight': gettext('midnight'),
    'noon': gettext('noon'),
    'on_the_items': gettext('on the %(items)s'),
    'every_number_freq': gettext('every %(number)s %(freq)s'),
    'each': gettext('each %(items)s'),
    'count': gettext('occuring %(number)s time'),
    'count_plural': gettext('occuring %(number)s times'),
    'until': gettext('until %(date)s')
};

recurrence.display.timeintervals = [
    gettext('year'), gettext('month'), gettext('week'), gettext('day'),
    gettext('hour'), gettext('minute'), gettext('second')
];
recurrence.display.timeintervals_plural = [
    gettext('years'), gettext('months'), gettext('weeks'), gettext('days'),
    gettext('hours'), gettext('minutes'), gettext('seconds')
];
recurrence.display.frequencies = [
    gettext('annually'), gettext('monthly'), gettext('weekly'), gettext('daily'),
    gettext('hourly'), gettext('minutely'), gettext('secondly')
];
recurrence.display.weekdays = [
    gettext('Monday'), gettext('Tuesday'), gettext('Wednesday'), gettext('Thursday'),
    gettext('Friday'), gettext('Saturday'), gettext('Sunday')
];
recurrence.display.weekdays_short = [
    gettext('Mon'), gettext('Tue'), gettext('Wed'), gettext('Thu'),
    gettext('Fri'), gettext('Sat'), gettext('Sun')
];
recurrence.display.weekdays_oneletter = [
    pgettext('Monday first letter', 'M'),
    pgettext('Tuesday first letter', 'T'),
    pgettext('Wednesday first letter', 'W'),
    pgettext('Thursday first letter', 'T'),
    pgettext('Friday first letter', 'F'),
    pgettext('Saturday first letter', 'S'),
    pgettext('Sunday first letter', 'S')
];
recurrence.display.weekdays_position = {
    '1': gettext('first %(weekday)s'),
    '2': gettext('second %(weekday)s'),
    '3': gettext('third %(weekday)s'),
    '4': gettext('fourth %(weekday)s'),
    '-1': gettext('last %(weekday)s'),
    '-2': gettext('second last %(weekday)s'),
    '-3': gettext('third last %(weekday)s')
};
recurrence.display.weekdays_position_short = {
    '1': gettext('1st %(weekday)s'),
    '2': gettext('2nd %(weekday)s'),
    '3': gettext('3rd %(weekday)s'),
    '4': gettext('4th %(weekday)s'),
    '-1': gettext('last %(weekday)s'),
    '-2': gettext('2nd last %(weekday)s'),
    '-3': gettext('3rd last %(weekday)s')
};
recurrence.display.last_of_month = {
    '-1': gettext('last'),
    '-2': gettext('second last'),
    '-3': gettext('third last'),
    '-4': gettext('fourth last')
}
recurrence.display.last_of_month_short = {
    '-1': gettext('last'),
    '-2': gettext('2nd last'),
    '-3': gettext('3rd last'),
    '-4': gettext('4th last')
}
recurrence.display.months = [
    gettext('January'), gettext('February'), gettext('March'),
    gettext('April'), pgettext('month name', 'May'), gettext('June'),
    gettext('July'), gettext('August'), gettext('September'),
    gettext('October'), gettext('November'), gettext('December')
];
recurrence.display.months_short = [
    gettext('Jan'), gettext('Feb'), gettext('Mar'),
    gettext('Apr'), pgettext('month name', 'May'), gettext('Jun'),
    gettext('Jul'), gettext('Aug'), gettext('Sep'),
    gettext('Oct'), gettext('Nov'), gettext('Dec')
];
recurrence.display.months_ap = [
    gettext('Jan.'), gettext('Feb.'), gettext('March'),
    gettext('April'), pgettext('month name', 'May'), gettext('June'),
    gettext('July'), gettext('Aug.'), gettext('Sept.'),
    gettext('Oct.'), gettext('Nov.'), gettext('Dec.')
];
recurrence.display.ampm = {
    'am': gettext('a.m.'), 'pm': gettext('p.m.'),
    'AM': gettext('AM'), 'PM': gettext('PM')
};
recurrence.display.month_day = pgettext('Day of month', '%j%S');

recurrence.display.ordinal_indicator = {
    'en': function(day) {
        if (day == 11 || day == 12 || day == 13)
            return 'th';
        var last = day % 10;
        if (last == 1)
            return 'st';
        if (last == 2)
            return 'nd';
        if (last == 3)
            return 'rd';
        return 'th';
    },
    'fr': function(day) {
        if (day == 1)
            return 'er';
        return '';
    }
};
