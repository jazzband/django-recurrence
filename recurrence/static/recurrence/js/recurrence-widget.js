if (!recurrence)
    var recurrence = {};

recurrence.widget = {};


recurrence.widget.Grid = function(cols, rows) {
    this.init(cols, rows);
};
recurrence.widget.Grid.prototype = {
    init: function(cols, rows) {
        this.disabled = false;
        this.cells = [];
        this.cols = cols;
        this.rows = rows;

        this.init_dom();
    },

    init_dom: function() {
        var tbody = recurrence.widget.e('tbody');
        for (var y=0; y < this.rows; y++) {
            var tr = recurrence.widget.e('tr');
            tbody.appendChild(tr);
            for (var x=0; x < this.cols; x++) {
                var td = recurrence.widget.e('td');
                tr.appendChild(td);
                this.cells.push(td);
            }
        }
        var table = recurrence.widget.e(
            'table', {
                'class': 'grid', 'cellpadding': 0,
                'cellspacing': 0, 'border': 0},
            [tbody]);

        this.elements = {'root': table, 'table': table, 'tbody': tbody};
    },

    cell: function(col, row) {
        return this.elements.tbody.childNodes[row].childNodes[col];
    },

    enable: function () {
        recurrence.widget.remove_class('disabled');
        this.disabled = false;
    },

    disable: function () {
        recurrence.widget.add_class('disabled');
        this.disabled = true;
    }
};


recurrence.widget.Calendar = function(date, options) {
    this.init(date, options);
};
recurrence.widget.Calendar.prototype = {
    init: function(date, options) {
        this.date = date || recurrence.widget.date_today();
        this.month = this.date.getMonth();
        this.year = this.date.getFullYear();
        this.options = options || {};

        if (this.options.onchange)
            this.onchange = this.options.onchange;
        if (this.options.onclose)
            this.onclose = this.options.onclose;

        this.init_dom();
        this.show_month(this.year, this.month);
    },

    init_dom: function() {
        var calendar = this;

        // navigation

        var remove = recurrence.widget.e('a', {
            'class': 'remove',
            'href': 'javascript:void(0)',
            'title': recurrence.display.labels.remove,
            'onclick': function() {
                calendar.close();
            }
        }, '&times;');
        var year_prev = recurrence.widget.e(
            'a', {
                'href': 'javascript:void(0)', 'class': 'prev-year',
                'onclick': function() {calendar.show_prev_year();}},
            '&lt;&lt;');
        var year_next = recurrence.widget.e(
            'a', {
                'href': 'javascript:void(0)', 'class': 'next-year',
                'onclick': function() {calendar.show_next_year();}},
            '&gt;&gt;');
        var month_prev = recurrence.widget.e(
            'a', {
                'href': 'javascript:void(0)', 'class': 'prev-month',
                'onclick': function() {calendar.show_prev_month();}},
            '&lt;');
        var month_next = recurrence.widget.e(
            'a', {
                'href': 'javascript:void(0)', 'class': 'next-month',
                'onclick': function() {calendar.show_next_month();}},
            '&gt;');
        var month_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.months[this.month]);

        var header_elements = [
            year_prev, month_prev, month_label, month_next, year_next];
        var header_grid = new recurrence.widget.Grid(header_elements.length, 1);
        recurrence.array.foreach(header_elements, function(item, i) {
            header_grid.cells[i].appendChild(item);
            recurrence.widget.add_class(
                header_grid.cells[i], item.className);
            });
        recurrence.widget.add_class(header_grid.elements.root, 'navigation');

        // core

        var calendar_year = recurrence.widget.e(
            'div', {'class': 'year'}, this.year);
        var calendar_navigation = header_grid.elements.root;
        // var calendar_week = week_grid.elements.root;
        var calendar_body = recurrence.widget.e('div', {'class': 'body'});
        var calendar_footer = recurrence.widget.e('div', {'class': 'footer'});

        var td = recurrence.widget.e(
            'td', {},
            [remove, calendar_year, calendar_navigation,
             calendar_body, calendar_footer]);
        var tr = recurrence.widget.e('tr', {}, [td]);
        var tbody = recurrence.widget.e('tbody', {}, [tr]);
        var root = recurrence.widget.e(
            'table', {'class': 'recurrence-calendar'}, [tbody]);
        root.style.display = 'none';

        this.elements = {
            'root': root,
            'year': calendar_year,
            'year_prev': year_prev,
            'year_next': year_next,
            'month_prev': month_prev,
            'month_next': month_next,
            'month_label': month_label,
            'calendar_body': calendar_body
        };
    },

    get_month_grid: function(year, month) {
        var calendar = this;

        var dt = new Date(year, month, 1);
        var start = dt.getDay();
        var days = recurrence.date.days_in_month(dt);
        var grid = new recurrence.widget.Grid(7, Math.ceil(days / 7) + 1);

        var number = 1;
        recurrence.array.foreach(
            grid.cells, function(cell, i) {
                var cell = grid.cells[i];
                if (i < 7) {
                    var weekday_number = i - 1;
                    if (weekday_number < 0)
                        weekday_number = 6;
                    else if (weekday_number > 6)
                        weekday_number = 0;
                    cell.innerHTML = recurrence.display.weekdays_oneletter[
                        weekday_number];
                    recurrence.widget.add_class(cell, 'header');
                } else if (i - 7 < start || number > days) {
                    recurrence.widget.add_class(cell, 'empty');
                } else {
                    recurrence.widget.add_class(cell, 'day');
                    if (this.date.getDate() == number &&
                        this.date.getFullYear() == dt.getFullYear() &&
                        this.date.getMonth() == dt.getMonth())
                        recurrence.widget.add_class(cell, 'active');
                    cell.innerHTML = number;
                    number = number + 1;
                    cell.onclick = function () {
                        calendar.set_date(
                            calendar.year, calendar.month,
                            parseInt(this.innerHTML, 10));
                    };
                }
            }, this);

        return grid;
    },

    show_month: function(year, month) {
        if (this.elements.calendar_body.childNodes.length)
            this.elements.calendar_body.removeChild(
                this.elements.calendar_body.childNodes[0]);
        this.elements.month_grid = this.get_month_grid(year, month);
        this.elements.calendar_body.appendChild(
            this.elements.month_grid.elements.root);
        this.elements.month_label.firstChild.nodeValue = (
            recurrence.display.months[this.month]);
        this.elements.year.firstChild.nodeValue = this.year;
    },

    show_prev_year: function() {
        this.year = this.year - 1;
        this.show_month(this.year, this.month);
    },

    show_next_year: function() {
        this.year = this.year + 1;
        this.show_month(this.year, this.month);
    },

    show_prev_month: function() {
        this.month = this.month - 1;
        if (this.month < 0) {
            this.month = 11;
            this.year = this.year - 1;
        }
        this.show_month(this.year, this.month);
    },

    show_next_month: function() {
        this.month = this.month + 1;
        if (this.month > 11) {
            this.month = 0;
            this.year = this.year + 1;
        }
        this.show_month(this.year, this.month);
    },

    set_date: function(year, month, day) {
        if (year != this.date.getFullYear() ||
            month != this.date.getMonth() ||
            day != this.date.getDate()) {

            this.date.setFullYear(year);
            this.date.setMonth(month);
            this.date.setDate(day);

            recurrence.array.foreach(
                this.elements.month_grid.cells, function(cell) {
                    if (recurrence.widget.has_class(cell, 'day')) {
                        var number = parseInt(cell.innerHTML, 10);
                        if (number == day) {
                            recurrence.widget.add_class(cell, 'active');
                        } else {
                            recurrence.widget.remove_class(cell, 'active');
                        }
                    }
                });

            if (this.onchange)
                this.onchange(this.date);
        }
    },

    set_position: function(x, y) {
        this.elements.root.style.left = x + 'px';
        this.elements.root.style.top = y + 'px';
    },

    show: function() {
        this.elements.root.style.display = '';
    },

    hide: function() {
        this.elements.root.style.display = 'none';
    },

    close: function() {
        if (this.elements.root.parentNode) {
            this.elements.root.parentNode.removeChild(this.elements.root);
            if (this.onclose)
                this.onclose();
        }
    }
};


recurrence.widget.DateSelector = function(date, options) {
    this.init(date, options);
};
recurrence.widget.DateSelector.prototype = {
    init: function(date, options) {
        this.disabled = false;
        this.date = date;
        this.calendar = null;
        this.options = options || {};

        if (this.options.onchange)
            this.onchange = this.options.onchange;

        this.init_dom();
    },

    init_dom: function() {
        var dateselector = this;

        if (this.date)
            var date_value = recurrence.date.format(this.date, '%Y-%m-%d');
        else
            var date_value = '';
        var date_field = recurrence.widget.e(
            'input', {
                'class': 'date-field', 'size': 10,
                'value': date_value,
                'onchange': function() {dateselector.set_date(this.value);}});
        var calendar_button = recurrence.widget.e(
            'a', {
                'class': 'calendar-button',
                'href': 'javascript:void(0)',
                'title': recurrence.display.labels.calendar,
                'onclick': function() {
                    if (!dateselector.disabled)
                        dateselector.show_calendar();
                }
            },
            '&nbsp;&nbsp;&nbsp;&nbsp;');
        var root = recurrence.widget.e(
            'span', {'class': 'date-selector'},
            [date_field, calendar_button]);

        this.elements = {
            'root': root,
            'date_field': date_field,
            'calendar_button': calendar_button
        };
    },

    show_calendar: function() {
        var dateselector = this;

        var calendar_blur = function(event) {
            var element = event.target;
            var is_in_dom = recurrence.widget.element_in_dom(
                element, dateselector.calendar.elements.root);
            if (!is_in_dom &&
                element != dateselector.elements.calendar_button) {
                // clicked outside of calendar
                dateselector.calendar.close();
                if (window.detachEvent)
                    window.detachEvent('onclick', calendar_blur);
                else
                    window.removeEventListener('click', calendar_blur, false);
            }
        };

        if (!this.calendar) {
            this.calendar = new recurrence.widget.Calendar(
                new Date((this.date || recurrence.widget.date_today()).valueOf()), {
                    'onchange': function() {
                        dateselector.set_date(
                            recurrence.date.format(this.date, '%Y-%m-%d'));
                        dateselector.calendar.close();
                    },
                    'onclose': function() {
                        if (window.detachEvent)
                            window.detachEvent('onclick', calendar_blur);
                        else
                            window.removeEventListener(
                                'click', calendar_blur, false);
                        dateselector.hide_calendar();
                    }
                });
            document.body.appendChild(this.calendar.elements.root);

            this.calendar.show();
            this.set_calendar_position();

            if (window.attachEvent)
                window.attachEvent('onclick', calendar_blur);
            else
                window.addEventListener('click', calendar_blur, false);
        }
    },

    set_date: function(datestring) {
        var tokens = datestring.split('-');
        var year = parseInt(tokens[0], 10);
	var month = parseInt(tokens[1], 10) - 1;
        var day = parseInt(tokens[2], 10);
        var dt = new Date(year, month, day);

        if (String(dt) == 'Invalid Date' || String(dt) == 'NaN') {
            if (this.date && !this.options.allow_null) {
                this.elements.date_field.value = recurrence.date.format(
                    this.date, '%Y-%m-%d');
            } else {
                if (this.elements.date_field.value != '') {
                    if (this.onchange)
                        this.onchange(null);
                }
                this.elements.date_field.value = '';
            }
        } else {
            if (!this.date ||
                (year != this.date.getFullYear() ||
                 month != this.date.getMonth() ||
                 day != this.date.getDate())) {

                if (!this.date)
                    this.date = recurrence.widget.date_today();
                this.date.setFullYear(year);
                this.date.setMonth(month);
                this.date.setDate(day);

                this.elements.date_field.value = datestring;

                if (this.onchange)
                    this.onchange(this.date);
            }
        }
    },

    set_calendar_position: function() {
        var loc = recurrence.widget.cumulative_offset(
            this.elements.calendar_button);

        var calendar_x = loc[0];
        var calendar_y = loc[1];
        var calendar_right = (
            loc[0] + this.calendar.elements.root.clientWidth);
        var calendar_bottom = (
            loc[1] + this.calendar.elements.root.clientHeight);

        if (calendar_right > document.scrollWidth)
            calendar_x = calendar_x - (
                calendar_right - document.scrollWidth);
        if (calendar_bottom > document.scrollHeight)
            calendar_y = calendar_y - (
                calendar_bottom - document.scrollHeight);

        this.calendar.set_position(calendar_x, calendar_y);
    },

    hide_calendar: function() {
        this.calendar = null;
    },

    enable: function () {
        this.disabled = false;
        this.elements.date_field.disabled = false;
    },

    disable: function () {
        this.disabled = true;
        this.elements.date_field.disabled = true;
        if (this.calendar)
            this.calendar.close();
    }
};


recurrence.widget.Widget = function(textarea, options) {
    this.init(textarea, options);
};
recurrence.widget.Widget.prototype = {
    init: function(textarea, options) {
        if (textarea.toLowerCase)
            textarea = document.getElementById(textarea);
        this.selected_panel = null;
        this.panels = [];
        this.data = recurrence.deserialize(textarea.value);
        this.textarea = textarea;
        this.options = options;

        this.default_freq = options.default_freq || recurrence.WEEKLY;

        this.init_dom();
        this.init_panels();
    },

    init_dom: function() {
        var widget = this;

        var panels = recurrence.widget.e('div', {'class': 'panels'});
        var control = recurrence.widget.e('div', {'class': 'control'});
        var root = recurrence.widget.e(
            'div', {'class': this.textarea.className}, [panels, control]);

        var add_rule = new recurrence.widget.AddButton(
            recurrence.display.labels.add_rule, {
            'onclick': function () {widget.add_rule();}
        });
        recurrence.widget.add_class(add_rule.elements.root, 'add-rule');
        control.appendChild(add_rule.elements.root);

        var add_date = new recurrence.widget.AddButton(
            recurrence.display.labels.add_date, {
            'onclick': function () {widget.add_date();}
        });
        recurrence.widget.add_class(add_date.elements.root, 'add-date');
        control.appendChild(add_date.elements.root);

        this.elements = {
            'root': root,
            'panels': panels,
            'control': control
        };

        // attach immediately
        this.textarea.style.display = 'none';
        this.textarea.parentNode.insertBefore(
            this.elements.root, this.textarea);
    },

    init_panels: function() {
        recurrence.array.foreach(
            this.data.rrules, function(item) {
                this.add_rule_panel(recurrence.widget.INCLUSION, item);
            }, this);
        recurrence.array.foreach(
            this.data.exrules, function(item) {
                this.add_rule_panel(recurrence.widget.EXCLUSION, item);
            }, this);
        recurrence.array.foreach(
            this.data.rdates, function(item) {
                this.add_date_panel(recurrence.widget.INCLUSION, item);
            }, this);
        recurrence.array.foreach(
            this.data.exdates, function(item) {
                this.add_date_panel(recurrence.widget.EXCLUSION, item);
            }, this);
    },

    add_rule_panel: function(mode, rule) {
        var panel = new recurrence.widget.Panel(this);
        var form = new recurrence.widget.RuleForm(panel, mode, rule);

        panel.onexpand = function() {
            if (panel.widget.selected_panel)
                if (panel.widget.selected_panel != this)
                    panel.widget.selected_panel.collapse();
            panel.widget.selected_panel = this;
        };
        panel.onremove = function() {
            form.remove();
        };

        this.elements.panels.appendChild(panel.elements.root);
        this.panels.push(panel);
        this.update();
        return panel;
    },

    add_date_panel: function(mode, date) {
        var panel = new recurrence.widget.Panel(this);
        var form = new recurrence.widget.DateForm(panel, mode, date);

        panel.onexpand = function() {
            if (panel.widget.selected_panel)
                if (panel.widget.selected_panel != this)
                    panel.widget.selected_panel.collapse();
            panel.widget.selected_panel = this;
        };
        panel.onremove = function() {
            form.remove();
        };

        this.elements.panels.appendChild(panel.elements.root);
        this.panels.push(panel);
        this.update();
        return panel;
    },

    add_rule: function(rule) {
        var rule = rule || new recurrence.Rule(this.default_freq);
        this.data.rrules.push(rule);
        this.add_rule_panel(recurrence.widget.INCLUSION, rule).expand();
    },

    add_date: function(date) {
        var date = date || recurrence.widget.date_today();
        this.data.rdates.push(date);
        this.add_date_panel(recurrence.widget.INCLUSION, date).expand();
    },

    update: function() {
        this.textarea.value = this.data.serialize();
    }
};


recurrence.widget.AddButton = function(label, options) {
    this.init(label, options);
};
recurrence.widget.AddButton.prototype = {
    init: function(label, options) {
        this.label = label;
        this.options = options || {};

        this.init_dom();
    },

    init_dom: function() {
        var addbutton = this;

        var plus = recurrence.widget.e(
            'span', {'class': 'plus'}, '+');
        var label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'}, this.label);
        var root = recurrence.widget.e(
            'a', {'class': 'add-button', 'href': 'javascript:void(0)'},
            [plus, label]);

        root.onclick = function() {
            addbutton.options.onclick();
        };

        this.elements = {'root': root, 'plus': plus, 'label': label};
    }
};


recurrence.widget.Panel = function(widget, options) {
    this.init(widget, options);
};
recurrence.widget.Panel.prototype = {
    init: function(widget, options) {
        this.collapsed = false;
        this.widget = widget;
        this.options = options || {};

        if (this.options.onremove)
            this.onremove = this.options.onremove;
        if (this.options.onexpand)
            this.onexpand = this.options.onexpand;
        if (this.options.oncollapse)
            this.oncollapse = this.options.oncollapse;

        this.init_dom();
    },

    init_dom: function() {
        var panel = this;

        var remove = recurrence.widget.e('a', {
            'class': 'remove',
            'href': 'javascript:void(0)',
            'title': recurrence.display.labels.remove,
            'onclick': function() {
                panel.remove();
            }
        }, '&times;');
        var label = recurrence.widget.e('a', {
           'class': 'recurrence-label',
           'href': 'javascript:void(0)',
           'onclick': function() {
               if (panel.collapsed)
                   panel.expand();
               else
                   panel.collapse();
           }
        }, '&nbsp;');
        var header = recurrence.widget.e(
             'div', {'class': 'header'}, [remove, label]);
        var body = recurrence.widget.e(
            'div', {'class': 'body'});
        var root = recurrence.widget.e(
            'div', {'class': 'panel'}, [header, body]);

        this.elements = {
            'root': root, 'remove': remove, 'label': label,
            'header': header, 'body': body
        };

        this.collapse();
    },

    set_label: function(label) {
        this.elements.label.innerHTML = label;
    },

    set_body: function(element) {
        if (this.elements.body.childNodes.length)
            this.elements.body.removeChild(this.elements.body.childNodes[0]);
        this.elements.body.appendChild(element);
    },

    expand: function() {
        this.collapsed = false;
        this.elements.body.style.display = '';
        if (this.onexpand)
            this.onexpand(this);
    },

    collapse: function() {
        this.collapsed = true;
        this.elements.body.style.display = 'none';
        if (this.oncollapse)
            this.oncollapse(this);
    },

    remove: function() {
        var parent = this.elements.root.parentNode;
        if (parent)
            parent.removeChild(this.elements.root);
        if (this.onremove)
            this.onremove(parent);
    }
};


recurrence.widget.RuleForm = function(panel, mode, rule, options) {
    this.init(panel, mode, rule, options);
};
recurrence.widget.RuleForm.prototype = {
    init: function(panel, mode, rule, options) {
        this.selected_freq = rule.freq;
        this.panel = panel;
        this.mode = mode;
        this.rule = rule;
        this.options = options || {};

        var rule_options = {
            interval: rule.interval, until: rule.until, count: rule.count
        };

        this.freq_rules = [
            new recurrence.Rule(recurrence.YEARLY, rule_options),
            new recurrence.Rule(recurrence.MONTHLY, rule_options),
            new recurrence.Rule(recurrence.WEEKLY, rule_options),
            new recurrence.Rule(recurrence.DAILY, rule_options)
        ];
        this.freq_rules[this.rule.freq].update(this.rule);

        this.init_dom();

        this.set_freq(this.selected_freq);
    },

    init_dom: function() {
        var form = this;

        // mode

        var mode_checkbox = recurrence.widget.e(
            'input', {'class': 'checkbox', 'type': 'checkbox', 'name': 'mode'});
        var mode_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.exclude_occurrences);
        var mode_container = recurrence.widget.e(
            'div', {'class': 'mode'},
            [mode_checkbox, mode_label]);
        if (this.mode == recurrence.widget.EXCLUSION)
            // delay for ie6 compatibility
            setTimeout(function() {
                mode_checkbox.checked = true;
                recurrence.widget.add_class(form.panel, 'exclusion');
            }, 10);

        // freq

        var freq_choices = recurrence.display.frequencies.slice(0, 4);
        var freq_options = recurrence.array.foreach(
            freq_choices, function(item, i) {
                var option = recurrence.widget.e(
                    'option', {'value': i},
                    recurrence.string.capitalize(item));
                return option;
            });
        var freq_select = recurrence.widget.e(
            'select', {'name': 'freq'}, freq_options);
        var freq_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.frequency + ':');
        var freq_container = recurrence.widget.e(
            'div', {'class': 'freq'},
            [freq_label, freq_select]);

        // interval

        var interval_field = recurrence.widget.e(
            'input', {
            'name': 'interval', 'size': 1, 'value': this.rule.interval});
        var interval_label1 = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.every);
        var interval_label2 = recurrence.widget.e(
            'span', {'class': 'laebl'},
            recurrence.display.timeintervals_plural[this.rule.freq]);
        var interval_container = recurrence.widget.e(
            'div', {'class': 'interval'},
            [interval_label1, interval_field, interval_label2]);

        // until

        if (this.rule.until)
            until_value = recurrence.date.format(this.rule.until, '%Y-%m-%d');
        else
            until_value = '';
        var until_radio = recurrence.widget.e(
            'input', {'class': 'radio', 'type': 'radio',
                      'name': 'until_count', 'value': 'until'});
        var until_date_selector = new recurrence.widget.DateSelector(
            this.rule.until, {
                'onchange': function(date) {form.set_until(date);},
                'allow_null': true
            });
        var until_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.date + ':');
        var until_container = recurrence.widget.e(
            'li', {'class': 'until'},
            [until_radio, until_label, until_date_selector.elements.root]);

        // count

        if (this.rule.count)
            count_value = this.rule.count;
        else
            count_value = 1;
        var count_radio = recurrence.widget.e(
            'input', {
                'class': 'radio', 'type': 'radio',
                'name': 'until_count', 'value': 'count'});
        var count_field = recurrence.widget.e(
            'input', {'name': 'count', 'size': 1, 'value': count_value});
        if (this.rule.count && this.rule.count < 2)
            var token = recurrence.string.capitalize(
                recurrence.display.labels.count);
        else
            var token = recurrence.string.capitalize(
                recurrence.display.labels.count_plural);
        var count_label1 = recurrence.widget.e(
            'span', {'class': 'recurrence-label'}, token.split('%(number)s')[0]);
        var count_label2 = recurrence.widget.e(
            'span', {'class': 'recurrence-label'}, token.split('%(number)s')[1]);
        var count_container = recurrence.widget.e(
            'li', {'class': 'count'},
            [count_radio, count_label1, count_field, count_label2]);

        // limit container

        var until_count_container = recurrence.widget.e(
            'ul', {'class': 'until-count'},
            [until_container, count_container]);
        var limit_checkbox = recurrence.widget.e(
            'input', {
                'class': 'checkbox', 'type': 'checkbox',
                'name': 'limit'});
        var limit_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.repeat_until + ':');
        var limit_container = recurrence.widget.e(
            'div', {'class': 'limit'},
            [limit_checkbox, limit_label, until_count_container]);
        if (this.rule.until || this.rule.count) {
            // compatibility with ie, we delay
            setTimeout(function() {limit_checkbox.checked = true;}, 10);
        } else {
            until_radio.disabled = true;
            count_radio.disabled = true;
            until_date_selector.disable();
            recurrence.widget.add_class(until_count_container, 'disabled');
        }

        // core

        var freq_form_container = recurrence.widget.e(
            'div', {'class': 'form'});
        var root = recurrence.widget.e(
            'form', {}, [
                mode_container, freq_container, interval_container,
                freq_form_container, limit_container]);

        // events

        mode_checkbox.onclick = function() {
            if (this.checked)
                form.set_mode(recurrence.widget.EXCLUSION);
            else
                form.set_mode(recurrence.widget.INCLUSION);
        };

        freq_select.onchange = function() {
            form.set_freq(parseInt(this.value), 10);
        };

        interval_field.onchange = function() {
            form.set_interval(parseInt(this.value), 10);
        };

        limit_checkbox.onclick = function () {
            if (this.checked) {
                recurrence.widget.remove_class(
                    until_count_container, 'disabled');
                until_radio.disabled = false;
                count_radio.disabled = false;
                if (until_radio.checked) {
                    until_date_selector.enable();
                    form.set_until(until_date_selector.date);
                }
                if (count_radio.checked) {
                    count_field.disabled = false;
                    form.set_count(parseInt(count_field.value));
                }
            } else {
                recurrence.widget.add_class(
                    until_count_container, 'disabled');
                until_radio.disabled = true;
                count_radio.disabled = true;
                until_date_selector.disable();
                count_field.disabled = true;
                recurrence.array.foreach(
                    form.freq_rules, function(rule) {
                        rule.until = null;
                        rule.count = null;
                    });
                form.update();
            }
        }

        // for compatibility with ie, use timeout
        setTimeout(function () {
            if (form.rule.count) {
                count_radio.checked = true;
                until_date_selector.disable();
            } else {
                until_radio.checked = true;
                count_field.disabled = true;
            }
        }, 1);

        until_radio.onclick = function () {
            this.checked = true;
            until_date_selector.enable();
            count_radio.checked = false;
            count_field.disabled = true;
            form.set_until(until_date_selector.date);
        };

        count_radio.onclick = function () {
            this.checked = true;
            count_field.disabled = false;
            until_radio.checked = false;
            until_date_selector.disable();
            form.set_count(parseInt(count_field.value), 10);
        };

        count_field.onchange = function () {
            form.set_count(parseInt(this.value), 10);
        };

        // freq forms

        var forms = [
            recurrence.widget.RuleYearlyForm,
            recurrence.widget.RuleMonthlyForm,
            recurrence.widget.RuleWeeklyForm,
            recurrence.widget.RuleDailyForm
        ];
        var freq_forms = recurrence.array.foreach(
            forms, function(form, i) {
                var rule = this.freq_rules[i];
                var f = new form(this, rule);
                freq_form_container.appendChild(f.elements.root);
                return f;
            }, this);

        this.freq_forms = freq_forms;

        // install dom

        this.panel.set_label(this.get_display_text());
        this.panel.set_body(root);

        this.elements = {
            'root': root,
            'mode_checkbox': mode_checkbox,
            'freq_select': freq_select,
            'interval_field': interval_field,
            'freq_form_container': freq_form_container,
            'until_radio': until_radio,
            'count_field': count_field,
            'count_radio': count_radio,
            'limit_checkbox': limit_checkbox
        };
    },

    get_display_text: function() {
        var text = this.freq_rules[this.selected_freq].get_display_text();
        if (this.mode == recurrence.widget.EXCLUSION)
            text = recurrence.display.mode.exclusion + ' ' + text;
        return recurrence.string.capitalize(text);
    },

    set_until: function(until) {
        recurrence.array.foreach(
            this.freq_rules, function(rule) {
                rule.count = null;
                rule.until = until;
            });
        this.update();
    },

    set_count: function(count) {
        if (count < 2)
            var token = recurrence.string.capitalize(
                recurrence.display.labels.count);
        else
            var token = recurrence.string.capitalize(
                recurrence.display.labels.count_plural);
        var label1 = this.elements.count_field.previousSibling;
        var label2 = this.elements.count_field.nextSibling;
        label1.firstChild.nodeValue = token.split('%(number)s')[0];
        label2.firstChild.nodeValue = token.split('%(number)s')[1];
        recurrence.array.foreach(
            this.freq_rules, function(rule) {
                rule.until = null;
                rule.count = count;
            });
        this.update();
    },

    set_interval: function(interval) {
        interval = parseInt(interval, 10);
        if (String(interval) == 'NaN') {
            // invalid value, reset to previous value
            this.elements.interval_field.value = (
                this.freq_rules[this.selected_freq].interval);
            return;
        }

        var label = this.elements.interval_field.nextSibling;

        if (interval < 2)
            label.firstChild.nodeValue = (
                recurrence.display.timeintervals[this.selected_freq]);
        else
            label.firstChild.nodeValue = (
                recurrence.display.timeintervals_plural[this.selected_freq]);
        recurrence.array.foreach(
            this.freq_rules, function(rule) {
                rule.interval = interval;
            });

        this.elements.interval_field.value = interval;
        this.update();
    },

    set_freq: function(freq) {
        this.freq_forms[this.selected_freq].hide();
        this.freq_forms[freq].show();
        this.elements.freq_select.value = freq;
        this.selected_freq = freq;
        // need to update interval to display different label
        this.set_interval(parseInt(this.elements.interval_field.value), 10);
        this.update();
    },

    set_mode: function(mode) {
        if (this.mode != mode) {
            if (this.mode == recurrence.widget.INCLUSION) {
                recurrence.array.remove(
                    this.panel.widget.data.rrules, this.rule);
                this.panel.widget.data.exrules.push(this.rule);
                recurrence.widget.remove_class(
                    this.panel.elements.root, 'inclusion');
                recurrence.widget.add_class(
                    this.panel.elements.root, 'exclusion');
            } else {
                recurrence.array.remove(
                    this.panel.widget.data.exrules, this.rule);
                this.panel.widget.data.rrules.push(this.rule);
                recurrence.widget.remove_class(
                    this.panel.elements.root, 'exclusion');
                recurrence.widget.add_class(
                    this.panel.elements.root, 'inclusion');
            }
            this.mode = mode;
        }
        this.update();
    },

    update: function() {
        this.panel.set_label(this.get_display_text());
        this.rule.update(this.freq_rules[this.selected_freq]);
        this.panel.widget.update();
    },

    remove: function() {
        var parent = this.elements.root.parentNode;
        if (parent)
            parent.removeChild(this.elements.root);
        if (this.mode == recurrence.widget.INCLUSION)
            recurrence.array.remove(this.panel.widget.data.rrules, this.rule);
        else
            recurrence.array.remove(this.panel.widget.data.exrules, this.rule);
        this.panel.widget.update();
    }
};


recurrence.widget.RuleYearlyForm = function(panel, rule) {
    this.init(panel, rule);
};
recurrence.widget.RuleYearlyForm.prototype = {
    init: function(panel, rule) {
        this.panel = panel;
        this.rule = rule;

        this.init_dom();
    },

    init_dom: function() {
        var form = this;

        var grid = new recurrence.widget.Grid(4, 3);
        var number = 0;
        for (var y=0; y < 3; y++) {
            for (var x=0; x < 4; x++) {
                var cell = grid.cell(x, y);
                if (this.rule.bymonth.indexOf(number + 1) > -1)
                    recurrence.widget.add_class(cell, 'active');
                cell.value = number + 1;
                cell.innerHTML = recurrence.display.months_short[number];
                cell.onclick = function () {
                    if (recurrence.widget.has_class(this, 'active'))
                        recurrence.widget.remove_class(this, 'active');
                    else
                        recurrence.widget.add_class(this, 'active');
                    form.set_bymonth();
                };
                number += 1;
            }
        }

        // by weekday checkbox

        var byday_checkbox = recurrence.widget.e(
            'input', {
                'class': 'checkbox', 'type': 'checkbox',
                'name': 'byday'});
        var byday_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.string.capitalize(
                recurrence.display.labels.on_the) + ':');
        var byday_container = recurrence.widget.e(
            'div', {'class': 'byday'},
            [byday_checkbox, byday_label]);

        // weekday-position

        var position_options = recurrence.array.foreach(
            [1, 2, 3, -1, -2, -3], function(value) {
                var option = recurrence.widget.e(
                    'option', {'value': value},
                    recurrence.string.strip(recurrence.display.weekdays_position[
                        String(value)].split('%(weekday)s')[0]));
                return option;
            });
        var position_select = recurrence.widget.e(
            'select', {'name': 'position'}, position_options);
        var weekday_options = recurrence.array.foreach(
            recurrence.display.weekdays, function(weekday, i) {
                var option = recurrence.widget.e(
                    'option', {'value': i}, weekday);
                return option;
            });
        var weekday_select = recurrence.widget.e(
            'select', {'name': 'weekday'}, weekday_options);
        var weekday_position_container = recurrence.widget.e(
            'div', {'class': 'section'}, [position_select, weekday_select]);

        // core

        var year = recurrence.widget.e('div');
        year.appendChild(grid.elements.root);

        var root = recurrence.widget.e(
            'div', {'class': 'yearly'},
            [year, byday_container, weekday_position_container]);
        root.style.display = 'none';

        if (this.rule.byday.length) {
            if (form.rule.bysetpos.length) {
                position_select.value = String(form.rule.bysetpos[0]);
            } else {
                position_select.value = String(form.rule.byday[0].index);
            }
            weekday_select.value = String(form.rule.byday[0].number);
            byday_checkbox.checked = true;
        } else {
            position_select.disabled = true;
            weekday_select.disabled = true;
        }

        // events

        byday_checkbox.onclick = function () {
            if (this.checked) {
                position_select.disabled = false;
                weekday_select.disabled = false;
                form.set_byday();
            } else {
                position_select.disabled = true;
                weekday_select.disabled = true;
                form.rule.byday = [];
                form.panel.update();
            }
        };

        position_select.onchange = function () {
            form.set_byday();
        };

        weekday_select.onchange = function () {
            form.set_byday();
        };

        this.elements = {
            'root': root,
            'grid': grid,
            'byday_checkbox': byday_checkbox,
            'position_select': position_select,
            'weekday_select': weekday_select
        };
    },

    get_weekday: function() {
        var number = parseInt(this.elements.weekday_select.value, 10);
        var index = parseInt(this.elements.position_select.value, 10);
        return new recurrence.Weekday(number, index);
    },

    set_bymonth: function() {
        var bymonth = [];
        recurrence.array.foreach(
            this.elements.grid.cells, function(cell) {
                if (recurrence.widget.has_class(cell, 'active'))
                    bymonth.push(cell.value);
            })
        this.rule.bymonth = bymonth;
        this.panel.update();
    },

    set_byday: function() {
        this.rule.byday = [this.get_weekday()];
        this.panel.update();
    },

    show: function() {
        this.elements.root.style.display = '';
    },

    hide: function() {
        this.elements.root.style.display = 'none';
    }
};


recurrence.widget.RuleMonthlyForm = function(panel, rule) {
    this.init(panel, rule);
};
recurrence.widget.RuleMonthlyForm.prototype = {
    init: function(panel, rule) {
        this.panel = panel;
        this.rule = rule;

        this.init_dom();
    },

    init_dom: function() {
        var form = this;

        // monthday

        var monthday_grid = new recurrence.widget.Grid(7, Math.ceil(31 / 7));
        var number = 0;
        for (var y=0; y < Math.ceil(31 / 7); y++) {
            for (var x=0; x < 7; x++) {
                number += 1;
                var cell = monthday_grid.cell(x, y);
                if (number > 31) {
                    recurrence.widget.add_class(cell, 'empty');
                    continue;
                } else {
                    cell.innerHTML = number;
                    if (this.rule.bymonthday.indexOf(number) > -1)
                        recurrence.widget.add_class(cell, 'active');
                    cell.onclick = function () {
                        if (monthday_grid.disabled)
                            return;
                        var day = parseInt(this.innerHTML, 10) || null;
                        if (day) {
                            if (recurrence.widget.has_class(this, 'active'))
                                recurrence.widget.remove_class(this, 'active');
                            else
                                recurrence.widget.add_class(this, 'active');
                            form.set_bymonthday();
                        }
                    }
                }
            }
        }
        var monthday_grid_container = recurrence.widget.e(
            'div', {'class': 'section'});
        monthday_grid_container.appendChild(monthday_grid.elements.root);
        var monthday_radio = recurrence.widget.e(
            'input', {
                'class': 'radio', 'type': 'radio',
                'name': 'monthly', 'value': 'monthday'});
        var monthday_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.each + ':');
        var monthday_container = recurrence.widget.e(
            'li', {'class': 'monthday'},
            [monthday_radio, monthday_label, monthday_grid_container]);

        // weekday-position

        var position_options = recurrence.array.foreach(
            [1, 2, 3, -1, -2, -3], function(value) {
                var option = recurrence.widget.e(
                    'option', {'value': value},
                    recurrence.string.strip(
                        recurrence.display.weekdays_position[
                        String(value)].split('%(weekday)s')[0]));
                return option;
            });
        var position_select = recurrence.widget.e(
            'select', {'name': 'position'}, position_options);

        var weekday_options = recurrence.array.foreach(
            recurrence.display.weekdays, function(weekday, i) {
                var option = recurrence.widget.e(
                    'option', {'value': i}, weekday);
                return option;
            });
        var weekday_select = recurrence.widget.e(
            'select', {'name': 'weekday'}, weekday_options);
        var weekday_position_container = recurrence.widget.e(
            'div', {'class': 'section'}, [position_select, weekday_select]);
        var weekday_radio = recurrence.widget.e(
            'input', {
                'class': 'radio', 'type': 'radio',
                'name': 'monthly', 'value': 'weekday'});
        var weekday_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.on_the + ':');
        var weekday_container = recurrence.widget.e(
            'li', {'class': 'weekday'},
            [weekday_radio, weekday_label, weekday_position_container]);

        // core

        var monthday_weekday_container = recurrence.widget.e(
            'ul', {'class': 'monthly'},
            [monthday_container, weekday_container]);

        var root = recurrence.widget.e(
            'div', {'class': 'monthly'}, [monthday_weekday_container]);
        root.style.display = 'none';

        // events

        // for compatibility with ie, use timeout
        setTimeout(function () {
            if (form.rule.byday.length) {
                weekday_radio.checked = true;
                if (form.rule.bysetpos.length) {
                    position_select.value = String(form.rule.bysetpos[0]);
                } else {
                    position_select.value = String(form.rule.byday[0].index);
                }
                weekday_select.value = String(form.rule.byday[0].number);
                monthday_grid.disable();
            } else {
                monthday_radio.checked = true;
                position_select.disabled = true;
                weekday_select.disabled = true;
            }
        }, 1);

        monthday_radio.onclick = function () {
            this.checked = true;
            weekday_radio.checked = false;
            position_select.disabled = true;
            weekday_select.disabled = true;
            monthday_grid.enable();
            form.set_bymonthday();
        };

        weekday_radio.onclick = function () {
            this.checked = true;
            monthday_radio.checked = false;
            position_select.disabled = false;
            weekday_select.disabled = false;
            monthday_grid.disable();
            form.set_byday();
        };

        position_select.onchange = function () {
            form.set_byday();
        };

        weekday_select.onchange = function () {
            form.set_byday();
        };

        this.elements = {
            'root': root,
            'monthday_grid': monthday_grid,
            'monthday_radio': monthday_radio,
            'weekday_radio': weekday_radio,
            'position_select': position_select,
            'weekday_select': weekday_select
        };
    },

    get_weekday: function() {
        var number = parseInt(this.elements.weekday_select.value, 10);
        var index = parseInt(this.elements.position_select.value, 10);
        return new recurrence.Weekday(number, index);
    },

    set_byday: function() {
        this.rule.bymonthday = [];
        this.rule.bysetpos = [];
        this.rule.byday = [this.get_weekday()];
        this.panel.update();
    },

    set_bymonthday: function() {
        this.rule.bysetpos = [];
        this.rule.byday = [];
        var monthdays = [];
        recurrence.array.foreach(
            this.elements.monthday_grid.cells, function(cell) {
                var day = parseInt(cell.innerHTML, 10) || null;
                if (day && recurrence.widget.has_class(cell, 'active'))
                    monthdays.push(day);
            });
        this.rule.bymonthday = monthdays;
        this.panel.update();
    },

    show: function() {
        this.elements.root.style.display = '';
    },

    hide: function() {
        this.elements.root.style.display = 'none';
    }
};


recurrence.widget.RuleWeeklyForm = function(panel, rule) {
    this.init(panel, rule);
};
recurrence.widget.RuleWeeklyForm.prototype = {
    init: function(panel, rule) {
        this.panel = panel;
        this.rule = rule;

        this.init_dom();
    },

    init_dom: function() {
        var form = this;

        var weekday_grid = new recurrence.widget.Grid(7, 1);
        var days = [];
        var days = recurrence.array.foreach(
            this.rule.byday, function(day) {
                return recurrence.to_weekday(day).number;
            });
        for (var x=0; x < 7; x++) {
            var cell = weekday_grid.cell(x, 0);
            if (days.indexOf(x) > -1)
                recurrence.widget.add_class(cell, 'active');
            cell.value = x;
            cell.innerHTML = recurrence.display.weekdays_short[x];
            cell.onclick = function () {
                if (weekday_grid.disabled)
                    return;
                if (recurrence.widget.has_class(this, 'active'))
                    recurrence.widget.remove_class(this, 'active');
                else
                    recurrence.widget.add_class(this, 'active');
                form.set_byday();
            };
        }

        var weekday_container = recurrence.widget.e(
            'div', {'class': 'section'});
        weekday_container.appendChild(weekday_grid.elements.root);
        var root = recurrence.widget.e(
            'div', {'class': 'weekly'}, [weekday_container]);
        root.style.display = 'none';

        this.elements = {
            'root': root,
            'weekday_grid': weekday_grid
        };
    },

    set_byday: function() {
        var byday = [];
        recurrence.array.foreach(
            this.elements.weekday_grid.cells, function(cell) {
                if (recurrence.widget.has_class(cell, 'active'))
                    byday.push(new recurrence.Weekday(cell.value));
            });
        this.rule.byday = byday;
        this.panel.update();
    },

    show: function() {
        this.elements.root.style.display = '';
    },

    hide: function() {
        this.elements.root.style.display = 'none';
    }
};


recurrence.widget.RuleDailyForm = function(panel, rule) {
    this.init(panel, rule);
};
recurrence.widget.RuleDailyForm.prototype = {
    init: function(panel, rule) {
        this.panel = panel;
        this.rule = rule;

        this.init_dom();
    },

    init_dom: function() {
        var root = recurrence.widget.e('div', {'class': 'daily'});
        root.style.display = 'none';
        this.elements = {'root': root};
    },

    show: function() {
        // this.elements.root.style.display = '';
    },

    hide: function() {
        // this.elements.root.style.display = 'none';
    }
};


recurrence.widget.DateForm = function(panel, mode, date) {
    this.init(panel, mode, date);
};
recurrence.widget.DateForm.prototype = {
    init: function(panel, mode, date) {
        this.collapsed = true;
        this.panel = panel;
        this.mode = mode;
        this.date = date;

        this.init_dom();
    },

    init_dom: function() {
        var form = this;

        // mode

        var mode_checkbox = recurrence.widget.e(
            'input', {
                'class': 'checkbox', 'type': 'checkbox', 'name': 'mode',
                'onclick': function() {
                    if (this.checked)
                        form.set_mode(recurrence.widget.EXCLUSION);
                    else
                        form.set_mode(recurrence.widget.INCLUSION);
                }
            });
        if (this.mode == recurrence.widget.EXCLUSION)
            mode_checkbox.checked = true;
        var mode_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'},
            recurrence.display.labels.exclude_date);
        var mode_container = recurrence.widget.e(
            'div', {'class': 'mode'}, [mode_checkbox, mode_label]);

        // date

        var date_label = recurrence.widget.e(
            'span', {'class': 'recurrence-label'}, recurrence.display.labels.date + ':');
        var date_selector = new recurrence.widget.DateSelector(
            this.date, {'onchange': function() {form.update();}});
        var date_container = recurrence.widget.e(
            'div', {'class': 'date'}, [date_label, date_selector.elements.root]);

        // core

        var root = recurrence.widget.e(
            'form', {'class': 'date'}, [mode_container, date_container]);

        // init dom

        this.panel.set_label(this.get_display_text());
        this.panel.set_body(root);
        this.elements = {'root': root};
    },

    get_display_text: function() {
        var text = recurrence.date.format(this.date, '%l, %F %j, %Y');
        if (this.mode == recurrence.widget.EXCLUSION)
            text = recurrence.display.mode.exclusion + ' ' + text;
        return recurrence.string.capitalize(text);
    },

    set_mode: function(mode) {
        if (this.mode != mode) {
            if (this.mode == recurrence.widget.INCLUSION) {
                recurrence.array.remove(
                    this.panel.widget.data.rdates, this.date);
                this.panel.widget.data.exdates.push(this.date);
                recurrence.widget.remove_class(
                    this.elements.root, 'inclusion');
                recurrence.widget.add_class(
                    this.elements.root, 'exclusion');
                this.update();
            } else {
                recurrence.array.remove(
                    this.panel.widget.data.exdates, this.date);
                this.panel.widget.data.rdates.push(this.date);
                recurrence.widget.remove_class(
                    this.elements.root, 'exclusion');
                recurrence.widget.add_class(
                    this.elements.root, 'inclusion');
                this.update();
            }
            this.mode = mode;
        }
        this.update();
    },

    update: function() {
        this.panel.set_label(this.get_display_text());
        this.panel.widget.update();
    },

    remove: function() {
        var parent = this.elements.root.parentNode;
        if (parent)
            parent.removeChild(this.elements.root);
        if (this.mode == recurrence.widget.INCLUSION)
            recurrence.array.remove(this.panel.widget.data.rdates, this.date);
        else
            recurrence.array.remove(this.panel.widget.data.exdates, this.date);
        this.panel.widget.update();
    }
};


recurrence.widget.e = function(tag_name, attrs, inner) {
    var element = document.createElement(tag_name);
    if (attrs)
        recurrence.widget.set_attrs(element, attrs);
    if (inner) {
        if (!inner.toLowerCase && inner.length)
            recurrence.array.foreach(
                inner, function(e) {element.appendChild(e);});
        else
            element.innerHTML = inner;
    }
    return element;
};


recurrence.widget.set_attrs = function(element, attrs) {
    for (var attname in attrs)
        if (attname.match(/^on/g))
            element[attname] = attrs[attname];
        else if (attname == 'class')
            element.className = attrs[attname];
        else
            element.setAttribute(attname, attrs[attname]);
};


recurrence.widget.add_class = function(element, class_name) {
    var names = (element.className || '').split(/[ \r\n\t]+/g);
    if (names.indexOf(class_name) == -1) {
        names.push(class_name);
        element.className = names.join(' ');
    }
};


recurrence.widget.remove_class = function(element, class_name) {
    var names = (element.className || '').split(/[ \r\n\t]+/g);
    if (names.indexOf(class_name) > -1) {
        recurrence.array.remove(names, class_name);
        element.className = names.join(' ');
    }
};


recurrence.widget.has_class = function(element, class_name) {
    var names = (element.className || '').split(/[ \r\n\t]+/g);
    if (names.indexOf(class_name) > -1)
        return true;
    else
        return false;
};


recurrence.widget.element_in_dom = function(element, dom) {
    if (element == dom) {
        return true;
    } else {
        for (var i=0; i < dom.childNodes.length; i++)
            if (recurrence.widget.element_in_dom(element, dom.childNodes[i]))
                return true;
    }
    return false;
};


recurrence.widget.cumulative_offset = function(element) {
    var y = 0, x = 0;
    do {
        y += element.offsetTop  || 0;
        x += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);
    return [x, y];
};


recurrence.widget.textareas_to_widgets = function(token) {
    var elements = [];
    if (!token)
        token = 'recurrence-widget';
    if (token.toLowerCase) {
        var textareas = document.getElementsByTagName('textarea');
        recurrence.array.foreach(
            textareas, function(textarea) {
                if (recurrence.widget.has_class(textarea, token))
                    elements.push(textarea);
            });
    }
    recurrence.array.foreach(
        elements, function(e) {
            new recurrence.widget.Widget(e, window[e.id] || {});
        });
};


recurrence.widget.date_today = function() {
    var date = new Date();
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
};


recurrence.widget.INCLUSION = true;
recurrence.widget.EXCLUSION = false;


// display


if (!recurrence.display)
    recurrence.display = {};

recurrence.display.mode = {
    'inclusion': gettext('including'), 'exclusion': gettext('excluding')
};

recurrence.display.labels = {
    'frequency': gettext('Frequency'),
    'on_the': gettext('On the'),
    'each': gettext('Each'),
    'every': gettext('Every'),
    'until': gettext('Until'),
    'count': gettext('Occurs %(number)s time'),
    'count_plural': gettext('Occurs %(number)s times'),
    'date': gettext('Date'),
    'time': gettext('Time'),
    'repeat_until': gettext('Repeat until'),
    'exclude_occurrences': gettext('Exclude these occurences'),
    'exclude_date': gettext('Exclude this date'),
    'add_rule': gettext('Add rule'),
    'add_date': gettext('Add date'),
    'remove': gettext('Remove'),
    'calendar': gettext('Calendar')
};
