if (!recurrence) {
    var recurrence = new Object();
}

recurrence.widget = new Object();


recurrence.widget.Widget = function(textarea, options) {
    this.init(textarea, options);
};
recurrence.widget.Widget.prototype = {
    init: function(textarea, options) {
        if (textarea.toLowerCase) {
            textarea = document.getElementById(textarea);
        }
        this.selected_panel = null;
        this.panels = [];
        this.data = recurrence.deserialize(textarea.value);
        this.textarea = textarea;
        this.options = options;

        this.init_dom();
        this.init_panels();
        /*
        if (this.panels.length) {
            this.panels[0].expand();
            this.selected_panel = this.panels[0];
        }
        */
    },

    init_dom: function() {
        this.original_size = {
            width: this.textarea.clientWidth + 'px',
            height: this.textarea.clientHeight + 'px'
        };
        this.textarea.style.display = 'none';
        this.elements = this.build_dom();
        this.textarea.parentNode.insertBefore(this.elements.root, this.textarea);
    },

    init_panels: function() {
        for (var n=0; n < this.data.rrules.length; n++) {
            this.panels.push(
                new recurrence.widget.RulePanel(
                    this, recurrence.widget.INCLUSION, this.data.rrules[n]));
        }
        for (var n=0; n < this.data.exrules.length; n++) {
            this.panels.push(
                new recurrence.widget.RulePanel(
                    this, recurrence.widget.EXCLUSION, this.data.exrules[n]));
        }
        for (var n=0; n < this.data.rdates.length; n++) {
            this.panels.push(
                new recurrence.widget.DatePanel(
                    this, recurrence.widget.INCLUSION, this.data.rdates[n]));
        }
        for (var n=0; n < this.data.exdates.length; n++) {
            this.panels.push(
                new recurrence.widget.DatePanel(
                    this, recurrence.widget.EXCLUSION, this.data.exdates[n]));
        }
    },

    build_dom: function() {
        var widget = this;
        var elements = {root: document.createElement('div')};
        elements.root.className = this.textarea.className;

        elements.panels = document.createElement('div');
        elements.panels.className = 'panels';
        elements.root.appendChild(elements.panels);

        elements.control = document.createElement('div');
        elements.control.className = 'control';
        elements.root.appendChild(elements.control);

        elements.add_rule = document.createElement('a');
        elements.add_rule.setAttribute('href', 'javascript:void(0)');
        elements.add_rule.className = 'add-rule';
        var plus = document.createElement('span');
        plus.className = 'plus';
        plus.innerHTML = '+';
        elements.add_rule.appendChild(plus);
        elements.add_rule.innerHTML += ' ' + recurrence.display.labels.add_rule;
        elements.control.appendChild(elements.add_rule);

        elements.add_rule.onclick = function() {
            widget.add_rule();
        };

        return elements;
    },

    add_rule: function() {
        var rule = new recurrence.Rule(recurrence.WEEKLY);
        this.data.rrules.push(rule);
        var panel = new recurrence.widget.RulePanel(
            this, recurrence.widget.INCLUSION, rule);
        this.panels.push(panel);
        panel.expand();
    },

    update: function() {
        this.textarea.value = this.data.serialize();
    }
};


recurrence.widget.RulePanel = function(widget, mode, rule) {
    this.init(widget, mode, rule);
};
recurrence.widget.RulePanel.prototype = {
    init: function(widget, mode, rule) {
        this.collapsed = true;
        this.selected_freq = rule.freq;
        this.widget = widget;
        this.mode = mode;
        this.rule = rule;

        var rule_options = {
            interval: rule.interval,
            until: rule.until,
            count: rule.count
        };

        this.freq_rules = [
            new recurrence.Rule(recurrence.YEARLY, rule_options),
            new recurrence.Rule(recurrence.MONTHLY, rule_options),
            new recurrence.Rule(recurrence.WEEKLY, rule_options),
            new recurrence.Rule(recurrence.DAILY, rule_options)
        ];
        this.freq_rules[this.rule.freq].update(this.rule);

        this.init_dom();

        this.freq_forms = [
            new recurrence.widget.RuleYearlyForm(
                this, this.freq_rules[recurrence.YEARLY]),
            new recurrence.widget.RuleMonthlyForm(
                this, this.freq_rules[recurrence.MONTHLY]),
            new recurrence.widget.RuleWeeklyForm(
                this, this.freq_rules[recurrence.WEEKLY]),
            new recurrence.widget.RuleDailyForm(
                this, this.freq_rules[recurrence.DAILY])
        ];

        this.set_freq(this.rule.freq);
    },

    init_dom: function() {
        this.elements = this.build_dom();
        this.widget.elements.panels.appendChild(this.elements.root);
        this.update();
    },

    build_dom: function() {
        var panel = this;

        var elements = {root: document.createElement('div')};
        elements.root.className = 'panel inclusion';

        elements.remove = document.createElement('a');
        elements.remove.setAttribute('href', 'javascript:void(0)');
        elements.remove.setAttribute('title', recurrence.display.labels.remove);
        elements.remove.className = 'remove';
        elements.remove.innerHTML = '&times;';
        elements.root.appendChild(elements.remove);

        elements.remove.onclick = function() {
            panel.remove();
        };

        elements.label = document.createElement('a');
        elements.label.setAttribute('href', 'javascript:void(0)');
        elements.label.className = 'label';
        elements.root.appendChild(elements.label);

        elements.label.onclick = function() {
            if (panel.collapsed) {
                panel.expand();
            } else {
                panel.collapse();
            }
        };

        elements.form = document.createElement('form');
        elements.form.style.display = 'none';
        elements.root.appendChild(elements.form);

        elements.mode = document.createElement('input');
        elements.mode.className = 'checkbox';
        elements.mode.setAttribute('type', 'checkbox');
        elements.mode.setAttribute('name', 'mode');
        var mode_container = document.createElement('div');
        mode_container.className = 'mode';
        var label = document.createElement('span');
        label.className = 'label';
        label.innerHTML = recurrence.display.labels.exclude_occurrences;
        mode_container.appendChild(elements.mode);
        mode_container.appendChild(label);
        elements.form.appendChild(mode_container);

        if (this.mode == recurrence.widget.EXCLUSION) {
            // delay for ie6 compatibility
            setTimeout(function() {
                elements.mode.checked = true;
                elements.root.className = 'panel exclusion';
            }, 10);
        }

        elements.mode.onclick = function() {
            if (this.checked) {
                panel.set_mode(recurrence.widget.EXCLUSION);
            } else {
                panel.set_mode(recurrence.widget.INCLUSION);
            }
        };

        // freq select dropdown
        elements.freq = document.createElement('select');
        elements.freq.setAttribute('name', 'freq');
        var freq_choices = recurrence.display.frequencies.slice(0, 4);
        for (var n=0; n < freq_choices.length; n++) {
            var option = document.createElement('option');
            option.setAttribute('value', n);
            option.innerHTML = freq_choices[n].capitalize();
            elements.freq.appendChild(option);
        }
        var freq_container = document.createElement('div');
        freq_container.className = 'freq';
        freq_container.innerHTML = '<span class="label">' +
            recurrence.display.labels.frequency + ':</span>';
        freq_container.appendChild(elements.freq);
        elements.form.appendChild(freq_container);

        elements.freq.onchange = function() {
            panel.set_freq(parseInt(this.value));
        };

        // interval input
        elements.interval = document.createElement('input');
        elements.interval.setAttribute('name', 'interval');
        elements.interval.setAttribute('value', this.rule.interval);
        elements.interval.setAttribute('size', 1);
        var interval_container = document.createElement('div');
        interval_container.className = 'interval';
        var label1 = document.createElement('span');
        label1.className = 'label';
        label1.innerHTML = recurrence.display.labels.every;
        var label2 = document.createElement('span');
        label2.className = 'label';
        label2.innerHTML = recurrence.display.timeintervals_plural[this.rule.freq];
        interval_container.appendChild(label1);
        interval_container.appendChild(elements.interval);
        interval_container.appendChild(label2);
        elements.form.appendChild(interval_container);

        elements.interval.onchange = function() {
            panel.set_interval(parseInt(this.value));
        };

        elements.form_container = document.createElement('div');
        elements.form_container.className = 'form'
        elements.form.appendChild(elements.form_container);

        // until/count
        elements.until = document.createElement('input');
        elements.until.setAttribute('name', 'until');
        elements.until.setAttribute('size', 10);
        if (this.rule.until) {
            elements.until.setAttribute('value', this.rule.until.format('%Y-%m-%d'));
        }
        var until_container = document.createElement('li');
        until_container.className = 'until';
        elements.until_radio = document.createElement('input');
        elements.until_radio.disabled = true;
        elements.until_radio.className = 'radio';
        elements.until_radio.setAttribute('type', 'radio');
        elements.until_radio.setAttribute('name', 'until_count');
        elements.until_radio.setAttribute('value', 'until');
        var label = document.createElement('span');
        label.className = 'label';
        label.innerHTML = recurrence.display.labels.date + ':';
        until_container.appendChild(elements.until_radio);
        until_container.appendChild(label);
        until_container.appendChild(elements.until);

        elements.count = document.createElement('input');
        elements.count.setAttribute('name', 'count');
        elements.count.setAttribute('size', 1);
        if (this.rule.count) {
            elements.count.setAttribute('value', this.rule.count);
        } else {
            elements.count.setAttribute('value', 1);
        }
        var count_container = document.createElement('li');
        count_container.className = 'count';
        elements.count_radio = document.createElement('input');
        elements.count_radio.disabled = true;
        elements.count_radio.className = 'radio';
        elements.count_radio.setAttribute('type', 'radio');
        elements.count_radio.setAttribute('name', 'until_count');
        elements.count_radio.setAttribute('value', 'count');
        if (this.rule.count < 2) {
            var token = recurrence.display.labels.count.capitalize();
        } else {
            var token = recurrence.display.labels.count_plural.capitalize();
        }
        var label1 = document.createElement('span');
        label1.className = 'label';
        label1.innerHTML = token.split('%number')[0];
        var label2 = document.createElement('span');
        label2.className = 'label';
        label2.innerHTML = token.split('%number')[1];
        count_container.appendChild(elements.count_radio);
        count_container.appendChild(label1);
        count_container.appendChild(elements.count);
        count_container.appendChild(label2);

        var until_count_container = document.createElement('ul');
        until_count_container.className = 'until-count disabled';
        until_count_container.appendChild(until_container);
        until_count_container.appendChild(count_container);

        var limit_container = document.createElement('div');
        limit_container.className = 'limit';
        elements.limit = document.createElement('input');
        elements.limit.className = 'checkbox';
        elements.limit.setAttribute('type', 'checkbox');
        elements.limit.setAttribute('name', 'limit');
        var label = document.createElement('span');
        label.className = 'label';
        label.innerHTML = recurrence.display.labels.repeat_until + ':';
        limit_container.appendChild(elements.limit);
        limit_container.appendChild(label);
        limit_container.appendChild(until_count_container);
        elements.form.appendChild(limit_container);

        if (this.rule.until || this.rule.count) {
            // compatibility with ie, we delay
            setTimeout(function() {elements.limit.checked = true;}, 10);
            // elements.limit.checked = true;
            elements.until_radio.disabled = false;
            elements.count_radio.disabled = false;
            until_count_container.className = 'until-count';
        }

        elements.limit.onclick = function () {
            if (this.checked) {
                until_count_container.className = 'until-count';
                elements.until_radio.disabled = false;
                elements.count_radio.disabled = false;
                if (elements.until_radio.checked) {
                    elements.until.disabled = false;
                    panel.set_until(elements.until.value);
                }
                if (elements.count_radio.checked) {
                    elements.count.disabled = false;
                    panel.set_count(parseInt(elements.count.value));
                }
            } else {
                until_count_container.className = 'until-count disabled';
                elements.until_radio.disabled = true;
                elements.count_radio.disabled = true;
                elements.until.disabled = true;
                elements.count.disabled = true;
                for (var n=0; n < panel.freq_rules.length; n++) {
                    var rule = panel.freq_rules[n];
                    rule.until = null;
                    rule.count = null;
                }
                panel.update();
            }
        }

        // for compatibility with ie, use timeout
        setTimeout(function () {
            if (panel.rule.count) {
                elements.count_radio.checked = true;
                elements.until.disabled = true;
            } else {
                elements.until_radio.checked = true;
                elements.count.disabled = true;
            }
        }, 1);

        elements.until_radio.onclick = function () {
            this.checked = true;
            elements.until.disabled = false;
            elements.count_radio.checked = false;
            elements.count.disabled = true;
            panel.set_until(elements.until.value);
        };

        elements.count_radio.onclick = function () {
            this.checked = true;
            elements.count.disabled = false;
            elements.until_radio.checked = false;
            elements.until.disabled = true;
            panel.set_count(parseInt(elements.count.value));
        };

        elements.until.onchange = function () {
            panel.set_until(this.value);
        };

        elements.count.onchange = function () {
            panel.set_count(parseInt(this.value));
        };

        return elements;
    },

    set_until: function(until) {
        var tokens = until.split('-');
        var dt = new Date(parseInt(tokens[0]), parseInt(tokens[1]), parseInt(tokens[2]));
        if (String(dt) == 'Invalid Date' || String(dt) == 'NaN') {
            var prev_until = this.freq_rules[this.selected_freq].until;
            if (prev_until) {
                this.elements.until.value = prev_until.format('%Y-%m-%d');
            } else {
                this.elements.until.value = '';
            }
            dt = null;
        }
        for (var n=0; n < this.freq_rules.length; n++) {
            var rule = this.freq_rules[n];
            rule.count = null;
            rule.until = dt;
        }
        this.update();
    },

    set_count: function(count) {
        if (count < 2) {
            var token = recurrence.display.labels.count.capitalize();
        } else {
            var token = recurrence.display.labels.count_plural.capitalize();
        }
        this.elements.count.previousSibling.firstChild.nodeValue = token.split('%number')[0];
        this.elements.count.nextSibling.firstChild.nodeValue = token.split('%number')[1];
        for (var n=0; n < this.freq_rules.length; n++) {
            var rule = this.freq_rules[n];
            rule.until = null;
            rule.count = count;
        }
        this.update();
    },

    set_interval: function(interval) {
        interval = parseInt(interval);
        if (String(interval) == 'NaN') {
            // invalid value, reset to previous value
            this.elements.interval.value = this.freq_rules[this.selected_freq].interval;
            return;
        }

        if (interval < 2) {
            this.elements.interval.nextSibling.firstChild.nodeValue = (
                recurrence.display.timeintervals[this.selected_freq]);
        } else {
            this.elements.interval.nextSibling.firstChild.nodeValue = (
                recurrence.display.timeintervals_plural[this.selected_freq]);
        }
        for (var n=0; n < this.freq_rules.length; n++) {
            this.freq_rules[n].interval = interval;
        }

        this.elements.interval.value = interval;
        this.update();
    },

    set_freq: function(freq) {
        this.freq_forms[this.selected_freq].hide();
        this.freq_forms[freq].show();
        this.elements.freq.value = freq;
        this.selected_freq = freq;
        // need to update interval to display different label
        this.set_interval(parseInt(this.elements.interval.value));
        this.update();
    },

    set_mode: function(mode) {
        if (this.mode != mode) {
            if (this.mode == recurrence.widget.INCLUSION) {
                this.widget.data.exrules.push(this.widget.data.rrules.pop(this.rule));
                this.elements.root.className = 'panel exclusion';
            } else {
                this.widget.data.rrules.push(this.widget.data.exrules.pop(this.rule));
                this.elements.root.className = 'panel inclusion';
            }
            this.mode = mode;
        }
        this.update();
    },

    expand: function() {
        if (this.widget.selected_panel) {
            if (this.widget.selected_panel != this) {
                this.widget.selected_panel.collapse();
            }
        }
        this.collapsed = false;
        this.elements.form.style.display = '';
        this.widget.selected_panel = this;
    },

    collapse: function() {
        this.collapsed = true;
        this.elements.form.style.display = 'none';
    },

    update: function() {
        var text = this.freq_rules[this.selected_freq].get_display_text();
        if (this.mode == recurrence.widget.EXCLUSION) {
            text = recurrence.display.mode.exclusion + ' ' + text;
        }
        this.elements.label.innerHTML = text.capitalize();

        this.rule.update(this.freq_rules[this.selected_freq]);

        this.widget.update();
    },

    remove: function() {
        this.elements.root.parentNode.removeChild(this.elements.root);
        if (this.mode == recurrence.widget.INCLUSION) {
            this.widget.data.rrules.pop(this.rule);
        } else {
            this.widget.data.exrules.pop(this.rule);
        }
        this.update();
    }
};


recurrence.widget.RuleYearlyForm = function(panel, rule) {
    this.init(panel, rule);
};
recurrence.widget.RuleYearlyForm.prototype = {
    init: function(panel, rule) {
        this.panel = panel;
        this.rule = rule;

        this.elements = this.build_dom();
        this.init_dom();
    },

    init_dom: function() {
        this.panel.elements.form_container.appendChild(this.elements.root);
    },

    build_dom: function() {
        var form = this;
        var elements = new Object();
        elements.root = document.createElement('div');
        elements.root.className = 'yearly';
        elements.root.style.display = 'none';

        elements.grid = new recurrence.widget.Grid(4, 3);
        var number = 0;
        for (var y=0; y < 3; y++) {
            for (var x=0; x < 4; x++) {
                var cell = elements.grid.cell(x, y);
                cell.value = number;
                cell.innerHTML = recurrence.display.months_short[number];
                cell.onclick = function () {
                    if (this.className == 'active') {
                        this.className = '';
                    } else {
                        this.className = 'active';
                    }
                    form.set_bymonth();
                };
                number += 1;
            }
        }

        var byday_container = document.createElement('div');
        byday_container.className = 'byday';
        elements.byday = document.createElement('input');
        elements.byday.className = 'checkbox';
        elements.byday.setAttribute('type', 'checkbox');
        elements.byday.setAttribute('name', 'byday');
        var label = document.createElement('span');
        label.className = 'label'
        label.innerHTML = recurrence.display.labels.on_the.capitalize() + ':';

        byday_container.appendChild(elements.byday);
        byday_container.appendChild(label);

        var setpos_container = document.createElement('div');
        setpos_container.className = 'section';

        elements.position = document.createElement('select');
        elements.position.setAttribute('name', 'position');
        var values = [1, 2, 3, -1, -2, -3];
        for (var n=0; n < values.length; n++) {
            var option = document.createElement('option');
            option.value = values[n];
            option.innerHTML = recurrence.display.weekdays_position[
                String(values[n])].split('%weekday')[0].strip();
            elements.position.appendChild(option);
        }
        setpos_container.appendChild(elements.position);

        elements.weekday = document.createElement('select');
        elements.weekday.setAttribute('name', 'weekday');
        for (var n=0; n < recurrence.display.weekdays.length; n++) {
            var option = document.createElement('option');
            option.value = n;
            option.innerHTML = recurrence.display.weekdays[n];
            elements.weekday.appendChild(option);
        }
        setpos_container.appendChild(elements.weekday);

        var year = document.createElement('div');
        //year.className = 'section';
        year.appendChild(elements.grid.elements.root);

        elements.root.appendChild(year);
        elements.root.appendChild(byday_container);
        elements.root.appendChild(setpos_container);

        if (this.rule.byday.length) {
            elements.byday.checked = true;
        } else {
            elements.position.disabled = true;
            elements.weekday.disabled = true;
        }

        elements.byday.onclick = function () {
            if (this.checked) {
                elements.position.disabled = false;
                elements.weekday.disabled = false;
                form.set_byday();
            } else {
                elements.position.disabled = true;
                elements.weekday.disabled = true;
                form.rule.byday = [];
                form.panel.update();
            }
        };

        elements.position.onchange = function () {
            form.set_byday();
        };

        elements.weekday.onchange = function () {
            form.set_byday();
        };

        return elements;
    },

    get_weekday: function() {
        var number = parseInt(this.elements.weekday.value);
        var index = parseInt(this.elements.position.value);
        return new recurrence.Weekday(number, index);
    },

    set_bymonth: function() {
        var bymonth = [];
        for (var n=0; n < this.elements.grid.cells.length; n++) {
            var cell = this.elements.grid.cells[n];
            if (cell.className == 'active') {
                bymonth.push(cell.value);
            }
        }
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

        this.elements = this.build_dom();
        this.init_dom();
    },

    init_dom: function() {
        this.panel.elements.form_container.appendChild(this.elements.root);
    },

    build_dom: function() {
        var form = this;
        var elements = new Object();
        elements.root = document.createElement('div');
        elements.root.className = 'monthly';
        elements.root.style.display = 'none';

        var ul = document.createElement('ul');

        var monthday_li = document.createElement('li');
        monthday_li.className = 'monthday';
        elements.monthday_radio = document.createElement('input');
        elements.monthday_radio.className = 'radio';
        elements.monthday_radio.setAttribute('type', 'radio');
        elements.monthday_radio.setAttribute('name', 'monthly');
        elements.monthday_radio.setAttribute('value', 'monthday');
        var label = document.createElement('span');
        label.className = 'label';
        label.innerHTML = recurrence.display.labels.each + ':';
        monthday_li.appendChild(elements.monthday_radio);
        monthday_li.appendChild(label);

        var monthday_container = document.createElement('div');
        monthday_container.className = 'section';

        elements.grid = new recurrence.widget.Grid(7, Math.ceil(31 / 7));
        var number = 0;
        for (var y=0; y < Math.ceil(31 / 7); y++) {
            for (var x=0; x < 7; x++) {
                number += 1;
                var cell = elements.grid.cell(x, y);
                if (number > 31) {
                    cell.className = 'empty';
                    continue;
                } else {
                    cell.innerHTML = number;
                    if (this.rule.bymonthday.indexOf(number) > -1) {
                        cell.className = 'active';
                    }
                    cell.onclick = function () {
                        if (elements.grid.disabled) {
                            return;
                        }
                        var day = parseInt(this.innerHTML) || null;
                        if (day) {
                            if (this.className == 'active') {
                                this.className = '';
                            } else {
                                this.className = 'active';
                            }
                            form.set_bymonthday();
                        }
                    }
                }
            }
        }
        monthday_container.appendChild(elements.grid.elements.root);
        monthday_li.appendChild(monthday_container);

        ul.appendChild(monthday_li);

        var setpos_li = document.createElement('li');
        setpos_li.className = 'setpos';
        elements.setpos_radio = document.createElement('input');
        elements.setpos_radio.className = 'radio';
        elements.setpos_radio.setAttribute('type', 'radio');
        elements.setpos_radio.setAttribute('name', 'monthly');
        elements.setpos_radio.setAttribute('value', 'setpos');
        var label = document.createElement('span');
        label.className = 'label';
        label.innerHTML = recurrence.display.labels.on_the + ':';
        setpos_li.appendChild(elements.setpos_radio);
        setpos_li.appendChild(label);

        var setpos_container = document.createElement('div');
        setpos_container.className = 'section';

        elements.position = document.createElement('select');
        elements.position.setAttribute('name', 'position');
        var values = [1, 2, 3, -1, -2, -3];
        for (var n=0; n < values.length; n++) {
            var option = document.createElement('option');
            option.value = values[n];
            option.innerHTML = recurrence.display.weekdays_position[
                String(values[n])].split('%weekday')[0].strip();
            elements.position.appendChild(option);
        }
        setpos_container.appendChild(elements.position);

        elements.weekday = document.createElement('select');
        elements.weekday.setAttribute('name', 'weekday');
        for (var n=0; n < recurrence.display.weekdays.length; n++) {
            var option = document.createElement('option');
            option.value = n;
            option.innerHTML = recurrence.display.weekdays[n];
            elements.weekday.appendChild(option);
        }
        setpos_container.appendChild(elements.weekday);

        setpos_li.appendChild(setpos_container);
        
        ul.appendChild(setpos_li);
        
        elements.root.appendChild(ul);
        
        // for compatibility with ie, use timeout
        setTimeout(function () {
            if (form.rule.byday.length) {
                elements.setpos_radio.checked = true;
                elements.position.value = String(form.rule.bysetpos[0]);
                elements.weekday.value = String(form.rule.byday[0].number);
                elements.grid.disable();
            } else {
                elements.monthday_radio.checked = true;
                elements.position.disabled = true;
                elements.weekday.disabled = true;
            }
        }, 1);

        elements.monthday_radio.onclick = function () {
            this.checked = true;
            elements.setpos_radio.checked = false;
            elements.position.disabled = true;
            elements.weekday.disabled = true;
            elements.grid.enable();
            form.set_bymonthday();
        };

        elements.setpos_radio.onclick = function () {
            this.checked = true;
            elements.monthday_radio.checked = false;
            elements.position.disabled = false;
            elements.weekday.disabled = false;
            elements.grid.disable();
            form.set_byday();
        };

        elements.position.onchange = function () {
            form.set_byday();
        };

        elements.weekday.onchange = function () {
            form.set_byday();
        };

        return elements;
    },

    get_weekday: function() {
        var number = parseInt(this.elements.weekday.value);
        var index = parseInt(this.elements.position.value);
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
        for (var n=0; n < this.elements.grid.cells.length; n++) {
            var cell = this.elements.grid.cells[n];
            var day = parseInt(cell.innerHTML) || null;
            if (day && cell.className == 'active') {
                monthdays.push(day);
            }
        }
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

        this.elements = this.build_dom();
        this.init_dom();
    },

    init_dom: function() {
        this.panel.elements.form_container.appendChild(this.elements.root);
    },

    build_dom: function() {
        var form = this;
        var elements = new Object();
        elements.root = document.createElement('div');
        elements.root.className = 'weekly';
        elements.root.style.display = 'none';

        elements.grid = new recurrence.widget.Grid(7, 1);
        for (var x=0; x < 7; x++) {
            var cell = elements.grid.cell(x, 0);
            cell.value = x;
            cell.innerHTML = recurrence.display.weekdays_short[x];
            cell.onclick = function () {
                if (elements.grid.disabled) {
                    return;
                }
                if (this.className == 'active') {
                    this.className = '';
                } else {
                    this.className = 'active';
                }
                form.set_byday();
            };
        }

        var week_container = document.createElement('div');
        week_container.className = 'section';
        week_container.appendChild(elements.grid.elements.root);

        elements.root.appendChild(week_container);
        
        return elements;
    },

    set_byday: function() {
        var byday = [];
        for (var n=0; n < this.elements.grid.cells.length; n++) {
            var cell = this.elements.grid.cells[n];
            if (cell.className == 'active') {
                byday.push(new recurrence.Weekday(cell.value));
            }
        }
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

        this.elements = this.build_dom();
        this.init_dom();
    },

    init_dom: function() {
        this.panel.elements.form_container.appendChild(this.elements.root);
    },

    build_dom: function() {
        var elements = new Object();
        elements.root = document.createElement('div');
        elements.root.className = 'daily';
        elements.root.style.display = 'none';
        return elements;
    },

    show: function() {
        // this.elements.root.style.display = '';
    },

    hide: function() {
        // this.elements.root.style.display = 'none';
    }
};


recurrence.widget.DatePanel = function(widget, mode, date) {
    this.init(widget, mode, date);
};
recurrence.widget.DatePanel.prototype = {
    init: function(widget, mode, date) {
    }
};


recurrence.widget.Grid = function(cols, rows) {
    this.init(cols, rows);
};
recurrence.widget.Grid.prototype = {
    init: function(cols, rows) {
        this.disabled = false;
        this.cells = [];
        this.cols = cols;
        this.rows = rows;

        this.elements = this.build_dom();
    },

    build_dom: function() {
        var elements = new Object();
        elements.root = document.createElement('table');
        elements.table = elements.root;
        elements.table.className = 'grid';
        elements.table.setAttribute('cellpadding', '0');
        elements.table.setAttribute('cellspacing', '0');
        elements.table.setAttribute('border', '0');
        elements.tbody = document.createElement('tbody');
        elements.table.appendChild(elements.tbody);

        for (var y=0; y < this.rows; y++) {
            var tr = document.createElement('tr');
            elements.tbody.appendChild(tr);
            for (var x=0; x < this.cols; x++) {
                var td = document.createElement('td');
                tr.appendChild(td);
                this.cells.push(td);
            }
        }

        return elements;
    },

    enable: function () {
        this.elements.root.className = 'grid';
        this.disabled = false;
    },

    disable: function () {
        this.elements.root.className = 'grid disabled';
        this.disabled = true;
    },

    cell: function(col, row) {
        return this.elements.tbody.childNodes[row].childNodes[col];
    }
};


recurrence.textareas_to_widgets = function(token) {
    var elements = [];
    if (!token) {
        token = 'recurrence-widget';
    }
    if (token.toLowerCase) {
        var textareas = document.getElementsByTagName('textarea');
        for (var n=0; n < textareas.length; n++) {
            if (textareas[n].className.match(token)) {
                elements.push(textareas[n]);
            }
        }
    }
    for (var n=0; n < elements.length; n++) {
        new recurrence.widget.Widget(
            elements[n], window[elements[n].id] || {});
    }
};


recurrence.widget.INCLUSION = true;
recurrence.widget.EXCLUSION = false;


if (!recurrence.display) {
    recurrence.display = new Object();
}

recurrence.display.mode = {
    inclusion: 'including', exclusion: 'excluding'
};

recurrence.display.labels = {
    frequency: 'Frequency',
    on_the: 'On the',
    each: 'Each',
    every: 'Every',
    until: 'Until',
    count: 'Occurs %number time',
    count_plural: 'Occurs %number times',
    date: 'Date',
    repeat_until: 'Repeat until',
    exclude_occurrences: 'Exclude these occurences',
    add_rule: 'Add rule',
    remove: 'Remove'
};