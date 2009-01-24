/*

  recurrence

  Serialize to / deserialize from rfc2445 recurring date/time properties.

*/

if (!window.recurrence) {
    var recurrence = new Object();
}


recurrence.Rule = function(freq, options) {this.init(freq, options);};
recurrence.Rule.prototype = {
    init: function(freq, options) {
        this.freq = freq;

        options = options || {};
        this.interval = options.interval || 1;
        this.wkst = options.wkst || null;
        this.count = options.count || null;
        this.until = options.until || null;

        for (var n=0; n < recurrence.byparams.length; n++) {
            if (options[recurrence.byparams[n]]) {
                var value = options[recurrence.byparams[n]];
                if (value == null) {
                    value = [];
                }
                /*
                if (value.charAt || !value.length) {
                    value = [value];
                }
                */
                var items = [];
                for (var m=0; m < value.length; m++) {
                    items.push(value[m]);
                }
                this[recurrence.byparams[n]] = items;
            } else {
                this[recurrence.byparams[n]] = [];
            }
        }
    },

    copy: function() {
        var until = this.until;
        if (until) {
            until = new Date(until.valueOf());
        }
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

        for (var i=0; i < recurrence.byparams.length; i++) {
            var param = recurrence.byparams[i];
            this[param] = rule[param];
        }
    },

    get_display_text: function(short) {
        short = short || false;
        var parts = [];

        var get_position_display = function(position) {
            if (short) {
                return recurrence.display.weekdays_position_short[
                    String(position)];
            } else {
                return recurrence.display.weekdays_position[
                    String(position)];
            }
        };
        var get_weekday_display = function(number) {
            if (short) {
                return recurrence.display.weekdays_short[number];
            } else {
                return recurrence.display.weekdays[number];
            }
        };
        var get_position_weekday = function(rule) {
            var items = [];
            if (rule.bysetpos.length && rule.byday.length) {
                for (var n=0; n < rule.bysetpos.length; n++) {
                    var label = get_position_display(rule.bysetpos[n] || 1);
                    for (var m=0; m < rule.byday.length; m++) {
                        var weekday_display = get_weekday_display(
                            recurrence.to_weekday(rule.byday[m]).number);
                        items.push(label.format({weekday: weekday_display}));
                    }
                }
            } else if (rule.byday.length) {
                // TODO byday Weekday objects without index means
                // every weekday in the month, and so should appear in
                // plural. i.e. 'on sundays' instead of
                // 'on the first sunday'.
                for (var n=0; n < rule.byday.length; n++) {
                    var label = get_position_display(rule.byday[n].index || 1);
                    var weekday_display = get_weekday_display(
                        recurrence.to_weekday(rule.byday[n]).number);
                    items.push(label.format({weekday: weekday_display}));
                }
            }
            return items.join(', ');
        }

        if (this.interval > 1) {
            parts.push(
                recurrence.display.tokens.every_number_freq.format({
                    number: this.interval,
                    freq: recurrence.display.timeintervals_plural[this.freq]
                }));
        } else {
            parts.push(recurrence.display.frequencies[this.freq]);
        }

        if (this.freq == recurrence.YEARLY) {
            if (this.bymonth.length) {
                // i.e. 'each january, june'
                if (short) {
                    var months = recurrence.display.months_short;
                } else {
                    var months = recurrence.display.months;
                }
                var items = [];
                for (var n=0; n < this.bymonth.length; n++) {
                    items.push(months[this.bymonth[n]]);
                }
                items = items.join(', ');
                parts.push(recurrence.display.tokens.each.format({items: items}));

                if (this.byday.length || this.bysetpos.length) {
                    var weekday_items = get_position_weekday(this);
                    parts.push(recurrence.display.tokens.on_the_items.format({items: weekday_items}));
                }
            }
        }

        if (this.freq == recurrence.MONTHLY) {
            if (this.bymonthday.length) {
                // i.e. 'on the 1st, 5th, 10th'
                var items = [];
                for (var n=0; n < this.bymonthday.length; n++) {
                    var dt = new Date();
                    dt.setDate(this.bymonthday[n]);
                    items.push(dt.format('%j%S'));
                }
                items = items.join(', ');
                parts.push(recurrence.display.tokens.on_the_items.format(
                    {items: items}));

            } else if (this.byday.length) {
                if (this.byday.length || this.bysetpos.length) {
                    var weekday_items = get_position_weekday(this);
                    parts.push(recurrence.display.tokens.on_the_items.format({items: weekday_items}));
                }
            }
        }

        if (this.freq == recurrence.WEEKLY) {
            if (this.byday.length) {
                // i.e. 'each tuesday, wednesday'
                var items = [];
                for (var n=0; n < this.byday.length; n++) {
                    var weekday_number = recurrence.to_weekday(this.byday[n]).number;
                    if (short) {
                        var weekday = recurrence.display.weekdays_short[weekday_number];
                    } else {
                        var weekday = recurrence.display.weekdays[weekday_number];
                    }
                    items.push(weekday);
                }
                items = items.join(', ');
                parts.push(recurrence.display.tokens.each.format({items: items}));
            }
        }

        // daily frequencies has no additional formatting,
        // hour/minute/second formatting not supported.

        if (this.count) {
            if (this.count == 1) {
                parts.push(recurrence.display.tokens.count.format({
                    number: this.count}));
            } else {
                parts.push(recurrence.display.tokens.count_plural.format({
                    number: this.count}));
            }
        } else if (this.until) {
            parts.push(recurrence.display.tokens.until.format({
                date: this.until.format('%Y-%m-%d')}));
        }

        return parts.join(', ');
    }
};


recurrence.Recurrence = function(options) {this.init(options);};
recurrence.Recurrence.prototype = {
    init: function(options) {
        options = options || {};
        this.dtstart = options.dtstart || null;
        this.dtend = options.dtend || null;
        this.rrules = [];
        this.exrules = [];
        this.rdates = [];
        this.exdates = [];

        var rrules = options.rrules || [];
        var exrules = options.exrules || [];
        var rdates = options.rdates || [];
        var exdates = options.exdates || [];

        for (var i=0; i < rrules.length; i++) {
            this.rrules.push(rrules[i]);
        }
        for (var i=0; i < exrules.length; i++) {
            this.exrules.push(exrules[i]);
        }
        for (var i=0; i < rdates.length; i++) {
            this.rdates.push(rdates[i]);
        }
        for (var i=0; i < exdates.length; i++) {
            this.exdates.push(exdates[i]);
        }
    },

    copy: function() {
        var rrules = [];
        var exrules = [];
        var rdates = [];
        var exdates = [];

        for (var i=0; i < this.rrules.length; i++) {
            rrules.push(this.rrules[i].copy());
        }
        for (var i=0; i < this.exrules.length; i++) {
            exrules.push(this.exrules[i].copy());
        }
        for (var i=0; i < this.rdates.length; i++) {
            rdates.push(new Date(this.rdates.valueOf()));
        }
        for (var i=0; i < this.exdates.length; i++) {
            exdates.push(new Date(this.exdates.valueOf()));
        }

        return new recurrence.Recurrence({rrules: rrules, exrules: exrules});
    },

    serialize: function() {
        return recurrence.serialize(this);
    }
};


recurrence.Weekday = function(number, index) {this.init(number, index);};
recurrence.Weekday.prototype = {
    init: function(number, index) {
        this.number = number;
        this.index = index || null;
    },

    with_index: function(index) {
        if (index == this.index) {
            return this;
        } else {
            return new recurrence.Weekday(this.number, index);
        }
    },

    equals: function(other) {
        if (this.number == other.number && this.index == other.index) {
            return True;
        } else {
            return False;
        }
    },

    toString: function() {
        if (this.index) {
            return this.index + recurrence.weekdays[this.number];
        } else {
            return recurrence.weekdays[this.number];
        }
    }
};


recurrence.DateFormat = function(date) {
    this.init(date);
};
recurrence.DateFormat.formatchars = RegExp(
    '%[aAbBdDfFgGhHiIjlLmMnNOPrsStTUwWyYzZ]', 'g');
recurrence.DateFormat.year_days = [
    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
recurrence.DateFormat.mdays = [
    31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
recurrence.DateFormat.prototype = {
    init: function(date) {
        this.data = date;
    },

    format: function(format) {
        var tokens = format.match(recurrence.DateFormat.formatchars);
        for (var n=0; n < tokens.length; n++) {
            if (this[tokens[n].charAt(1)]) {
                format = format.replace(tokens[n], this[tokens[n].charAt(1)]());
            }
        }
        return format;
    },

    a: function() {
        if (this.data.getHours() > 11) {
            return recurrence.display.ampm.am;
        } else {
            return recurrence.display.ampm.pm;
        }
    },

    A: function() {
        if (this.data.getHours() > 11) {
            return recurrence.display.ampm.AM;
        } else {
            return recurrence.display.ampm.PM;
        }
    },

    f: function() {
        if (this.data.getMinutes() == 0) {
            return this.g();
        } else {
            return [this.g(), this.i()].join(':');
        }
    },

    g: function() {
        if (this.data.getHours() == 0) {
            return 12;
        } else {
            return this.data.getHours() - 12;
        }
        return this.data.getHours();
    },

    G: function() {
        return this.data.getHours();
    },

    h: function() {
        return String(this.g()).rjust(2, '0');
    },

    H: function() {
        return String(this.G()).rjust(2, '0');
    },

    i: function() {
        return String(this.data.getMinutes()).rjust(2, '0');
    },

    P: function() {
        if (this.data.getMinutes() == 0 && this.data.getHours() == 0) {
            return recurrence.display.tokens.midnight;
        }
        if (this.data.getMinutes() == 0 && this.data.getHours() == 12) {
            return recurrence.display.tokens.noon;
        }
    },

    s: function() {
        return String(this.data.getSeconds()).rjust(2, '0');
    },

    Y: function() {
        return this.data.getFullYear();
    },

    b: function() {
        return recurrence.display.months_short[this.data.getMonth()];
    },

    d: function() {
        return String(this.data.getDate()).rjust(2, '0');
    },

    D: function() {
        return recurrence.display.weekdays_short[this.data.getDay() - 1];
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
        if (hours_diff_daylight_time == hours_diff_standard_time) {
            return '0';
        } else {
            return '1';
        }
    },

    j: function() {
        return this.data.getDate();
    },

    l: function() {
        return recurrence.display.weekdays[this.data.getDay()];
    },

    L: function() {
        return this.data.isleap();
    },

    m: function() {
        return String(this.data.getMonth()).rjust(2, '0');
    },

    M: function() {
        return recurrence.display.months_short[this.data.getMonth()];
    },

    n: function() {
        return this.data.getMonth();
    },

    N: function() {
        return recurrence.display.months_ap[this.data.getMonth()];
    },

    O: function() {
        var seconds = this.Z();
        return '+' + String(Math.floor(seconds / 3600)).rjust(2, '0') +
            String(Math.floor((seconds / 60) % 60)).rjust(2, '0');
    },

    r: function() {
        return this.format('%D, %j %M %Y %H:%i:%s %O');
    },

    S: function() {
        var day = this.data.getDate();
        if (day == 11 || day == 12 || day == 13) {
            return 'th';
        }
        var last = day % 10;
        if (last == 1) {
            return 'st';
        }
        if (last == 2) {
            return 'nd';
        }
        if (last == 3) {
            return 'rd';
        }
        return 'th';
    },

    t: function() {
        var month = this.data.getMonth()
        var ndays =
            recurrence.DateFormat.mdays[month] +
            (month == recurrence.FEBRUARY && this.L());
        return String(ndays).rjust(2, '0');
    },

    T: function() {
        var tzname = String(this.data).match(/\([^\)]+\)/g).slice(1, -1);
        if (!tzname) {
            tzname = this.format('O');
        }
        return tzname;
    },

    U: function() {
        return this.data.getTime();
    },

    w: function() {
        return this.data.getDay() - 1;
    },

    W: function() {
        var week_number = null;
        var jan1_weekday = new Date(
            this.data.getFullYear(), this.data.getMonth(), 1);
        var weekday = this.data.getDay();
        var day_of_year = self.z();
        var prev_year = new Date(this.data.getFullYear() - 1, 0, 1);
        if (day_of_year <= (8 - jan1_weekday) && jan1_weekday > 4) {
            if (jan1_weekday == 5 || (jan1_weekday == 6 && prev_year.isleap())) {
                week_number = 53;
            } else {
                week_number = 52;
            }
        } else {
            if (this.data.isleap()) {
                var i = 366;
            } else {
                var i = 365;
            }
            if ((i - day_of_year) < (4 - weekday)) {
                week_number = 1;
            } else {
                var j = day_of_year + (7 - weekday) + (jan1_weekday - 1);
                week_number = Math.floor(j / 7);
                if (jan1_weekday > 4) {
                    week_number = week_number - 1;
                }
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
        if (this.L() && this.data.getMonth() > 2) {
            doy += 1;
        }
        return doy;
    },

    Z: function() {
        var offset = this.data.getTimezoneOffset();
        return offset * 60;
    }
}


recurrence.to_weekday = function(token) {
    if (token.number && token.index) {
        return new recurrence.Weekday(token.number, token.index);
    } else if (String(token).match(/[^0-9\-]/g)) {
        var token = String(token);
        var constant = token.slice(-2, token.length);
        var nth = token.slice(0, -2);
        if (nth.match(/[^0-9\-]/g)) {
            throw Error('Invalid weekday token.');
        }
        var weekday = recurrence.weekdays.indexOf(constant);
        if (weekday < 0) {
            throw Error('Invalid weekday token.');
        } else {
            return new recurrence.Weekday(weekday, nth || null);
        }
    } else {
        return new recurrence.Weekday(parseInt(token));
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
            pad(dt.getUTCDate(), 2) +
            'T' +
            pad(dt.getUTCHours(), 2) +
            pad(dt.getUTCMinutes(), 2) +
            pad(dt.getUTCDate(), 2) +
            'Z';
    };

    var serialize_rule = function(rule) {
        var map_to_string = function(sequence) {
            var new_sequence = [];
            for (var n=0; n < sequence.length; n++) {
                new_sequence.push(String(sequence[n]));
            }
            return new_sequence;
        };

        var map_to_param = function(sequence) {
            var new_sequence = [];
            for (var n=0; n < sequence.length; n++) {
                new_sequence.push(sequence[n][0] + '=' + sequence[n][1].join(','));
            }
            return new_sequence;
        };

        var values = [];

        values.push(['FREQ', [recurrence.frequencies[rule.freq]]]);
        if (rule.interval != 1) {
            values.push(['INTERVAL', [String(rule.interval)]]);
        }
        if (rule.wkst) {
            values.push(['WKST', [recurrence.weekdays[rule.wkst]]]);
        }
        if (rule.count != null) {
            values.push(['COUNT', [String(rule.count)]]);
        } else if (rule.until != null) {
            values.push(['UNTIL', [serialize_dt(rule.until)]]);
        }
        if (rule.byday.length) {
            days = [];
            for (var n=0; n < rule.byday.length; n++) {
                var d = recurrence.to_weekday(rule.byday[n]);
                days.push(d.toString());
            }
            values.push(['BYDAY', days]);
        }
        for (var n=0; n < recurrence.byparams.length; n++) {
            var param = recurrence.byparams[n];
            if (param != 'byday') {
                var value_list = rule[param] || [];
                if (value_list.length) {
                    values.push([param.toUpperCase(), map_to_string(value_list)]);
                }
            }
        }
        return map_to_param(values).join(';');
    };

    var map_to_property = function(sequence) {
        var new_sequence = [];
        for (var n=0; n < sequence.length; n++) {
            new_sequence.push(sequence[n].join(':'));
        }
        return new_sequence;
    };

    var obj = rule_or_recurrence;
    if (obj.freq) {
        obj = new recurrence.Recurrence({rrules: [obj]});
    }

    var items = [];

    if (obj.dtstart) {
        items.push(['DTSTART', serialize_dt(obj.dtstart)]);
    }
    if (obj.dtend) {
        items.push(['DTEND', serialize_dt(obj.dtend)]);
    }

    for (var n=0; n < obj.rrules.length; n++) {
        items.push(['RRULE', serialize_rule(obj.rrules[n])]);
    }
    for (var n=0; n < obj.exrules.length; n++) {
        items.push(['EXRULE', serialize_rule(obj.exrules[n])]);
    }
    for (var n=0; n < obj.rdates.length; n++) {
        items.push(['RDATE', serialize_dt(obj.rdates[n])]);
    }
    for (var n=0; n < obj.exdates.length; n++) {
        items.push(['EXDATE', serialize_dt(obj.exdates[n])]);
    }

    return map_to_property(items).join('\n');
};


recurrence.deserialize = function(text) {
    var deserialize_dt = function(text) {
        var year = parseInt(text.slice(0, 4));
        var month = parseInt(text.slice(4, 6));
        var day = parseInt(text.slice(6, 8));
        if (text.indexOf('T') > 0) {
            var hour = parseInt(text.slice(9, 11));
            var minute = parseInt(text.slice(11, 13));
            var second = parseInt(text.slice(13, 15));
        } else {
            var hour = 0;
            var minute = 0;
            var second = 0;
        }
        var dt = new Date();
        if (text.indexOf('Z') > 0) {
            dt.setUTCFullYear(year);
            dt.setUTCMonth(month - 1);
            dt.setUTCDate(day);
            dt.setUTCHours(hour);
            dt.setUTCMinutes(minute);
            dt.setUTCSeconds(second);
        } else {
            dt.setFullYear(year);
            dt.setMonth(month - 1);
            dt.setDate(day);
            dt.setHours(hour);
            dt.setMinutes(minute);
            dt.setSeconds(second);
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

    for (var n=0; n < tokens.length; n++) {
        var label = tokens[n].split(':', 2)[0];
        var param_text = tokens[n].split(':', 2)[1];

        if (param_text.indexOf('=') < 0) {
            var params = param_text;
        } else {
            var params = [];
            var param_tokens = param_text.split(';');
            for (var i=0; i < param_tokens.length; i++) {
                var param_name = param_tokens[i].split('=', 2)[0].strip();
                var param_value = param_tokens[i].split('=', 2)[1].strip();
                var value_list = param_value.split(',');
                for (var a=0; a < value_list.length; a++) {
                    value_list[a] = value_list[a].strip();
                }
                params.push([param_name, value_list]);
            }
        }

        if (label == 'RRULE' || label == 'EXRULE') {
            var freq = 0;
            var options = {};
            for (var i=0; i < params.length; i++) {
                var key = params[i][0];
                var param = key.toLowerCase();
                var value = params[i][1];

                if (key == 'FREQ') {
                    freq = recurrence.frequencies.indexOf(value[0]);
                } else if (key == 'INTERVAL') {
                    options[param] = parseInt(value[0]);
                } else if (key == 'WKST') {
                    options[param] = recurrence.to_weekday(value[0]);
                } else if (key == 'COUNT') {
                    options[param] = parseInt(value[0]);
                } else if (key == 'UNTIL') {
                    options[param] = deserialize_dt(value[0]);
                } else if (key == 'BYDAY') {
                    for (var a=0; a < value.length; a++) {
                        value[a] = recurrence.to_weekday(value[a]);
                    }
                    options[param] = value;
                } else {
                    for (var a=0; a < value.length; a++) {
                        value[a] = parseInt(value[a]);
                    }
                    options[param] = value;
                }
            }
            if (label == 'RRULE') {
                rrules.push(new recurrence.Rule(freq, options));
            } else {
                exrules.push(new recurrence.Rule(freq, options));
            }
        } else if (label == 'DTSTART') {
            dtstart = deserialize_dt(params);
        } else if (label == 'DTEND') {
            dtend = deserialize_dt(params);
        } else if (label == 'RDATE') {
            rdates.push(deserialize_dt(params));
        } else if (label == 'EXDATE') {
            exdates.push(deserialize_dt(params));
        }
    }

    return new recurrence.Recurrence({
        dtstart: dtstart, dtend: dtend,
        rrules: rrules, exrules: exrules, rdates: rdates, exdates: exdates
    });
};


// type extensions

String.prototype.format = function(map) {
    var string = this;
    for (key in map) {
        string = string.replace(RegExp('%' + key, 'g'), map[key]);
    }
    return string
};


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1, this.length);
};


String.prototype.strip = function() {
    return this.replace(/^[ \t\n\r]*/, '').replace(/[ \t\n\r]*$/, '');
};


String.prototype.rjust = function(length, character) {
    var initial = String(this);
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
};


String.prototype.ljust = function(length, character) {
    var initial = String(this);
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
};


Date.prototype.format = function(format) {
    return new recurrence.DateFormat(this).format(format);
};


Date.prototype.isleap = function() {
    var year = this.getFullYear();
    return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0)
};


if (!Array.indexOf) {
    // ie doesn't have indexOf on arrays
    Array.prototype.indexOf = function(obj) {
        for (var i=0; i < this.length; i++) {
            if (this[i] == obj) {
                return i;
            }
        }
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
recurrence.firstweekday = 0;


// display

if (!recurrence.display) {
    recurrence.display = new Object();
}

recurrence.display.tokens = {
    midnight: 'midnight',
    noon: 'noon',
    on_the_items: 'on the %items',
    every_number_freq: 'every %number %freq',
    each: 'each %items',
    count: 'occuring %number time',
    count_plural: 'occuring %number times',
    until: 'until %date'
};

recurrence.display.timeintervals = [
    'year', 'month', 'week', 'day',
    'hour', 'minute', 'second'
];
recurrence.display.timeintervals_plural = [
    'years', 'months', 'weeks', 'days',
    'hours', 'minutes', 'seconds'
];
recurrence.display.frequencies = [
    'annually', 'monthly', 'weekly', 'daily',
    'hourly', 'minutely', 'secondly'
];
recurrence.display.weekdays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday',
    'Friday', 'Saturday', 'Sunday'
];
recurrence.display.weekdays_short = [
    'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
];
recurrence.display.weekdays_position = {
    '1': 'first %weekday',
    '2': 'second %weekday',
    '3': 'third %weekday',
    '-1': 'last %weekday',
    '-2': 'second last %weekday',
    '-3': 'third last %weekday'
};
recurrence.display.weekdays_position_short = {
    '1': '1st %weekday',
    '2': '2nd %weekday',
    '3': '3rd %weekday',
    '-1': 'last %weekday',
    '-2': '2nd last %weekday',
    '-3': '3rd last %weekday'
};
recurrence.display.months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
recurrence.display.months_short = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
recurrence.display.months_ap = [
    'Jan.', 'Feb.', 'March', 'April', 'May', 'June',
    'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'
];
recurrence.display.ampm = {
    am: 'a.m.', pm: 'p.m.', AM: 'AM', PM: 'PM'
};
