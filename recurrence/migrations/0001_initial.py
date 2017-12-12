# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Date',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('mode', models.BooleanField(default=True, choices=[(True, 'Inclusion'), (False, 'Exclusion')])),
                ('dt', models.DateTimeField()),
            ],
        ),
        migrations.CreateModel(
            name='Param',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('param', models.CharField(max_length=16)),
                ('value', models.IntegerField()),
                ('index', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='Recurrence',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('dtstart', models.DateTimeField(null=True, blank=True)),
                ('dtend', models.DateTimeField(null=True, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Rule',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('mode', models.BooleanField(default=True, choices=[(True, 'Inclusion'), (False, 'Exclusion')])),
                ('freq', models.PositiveIntegerField(choices=[(6, 'Secondly'), (5, 'Minutely'), (4, 'Hourly'), (3, 'Daily'), (2, 'Weekly'), (1, 'Monthly'), (0, 'Yearly')])),
                ('interval', models.PositiveIntegerField(default=1)),
                ('wkst', models.PositiveIntegerField(default=0, null=True, blank=True)),
                ('count', models.PositiveIntegerField(null=True, blank=True)),
                ('until', models.DateTimeField(null=True, blank=True)),
                ('recurrence', models.ForeignKey(related_name='rules', to='recurrence.Recurrence', on_delete=models.DO_NOTHING)),
            ],
        ),
        migrations.AddField(
            model_name='param',
            name='rule',
            field=models.ForeignKey(related_name='params', to='recurrence.Rule', on_delete=models.DO_NOTHING),
        ),
        migrations.AddField(
            model_name='date',
            name='recurrence',
            field=models.ForeignKey(related_name='dates', to='recurrence.Recurrence', on_delete=models.DO_NOTHING),
        ),
    ]
