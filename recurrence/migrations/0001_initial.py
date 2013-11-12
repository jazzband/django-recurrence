# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Recurrence'
        db.create_table(u'recurrence_recurrence', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('dtstart', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('dtend', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'recurrence', ['Recurrence'])

        # Adding model 'Rule'
        db.create_table(u'recurrence_rule', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('recurrence', self.gf('django.db.models.fields.related.ForeignKey')(related_name='rules', to=orm['recurrence.Recurrence'])),
            ('mode', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('freq', self.gf('django.db.models.fields.PositiveIntegerField')()),
            ('interval', self.gf('django.db.models.fields.PositiveIntegerField')(default=1)),
            ('wkst', self.gf('django.db.models.fields.PositiveIntegerField')(default=0, null=True, blank=True)),
            ('count', self.gf('django.db.models.fields.PositiveIntegerField')(null=True, blank=True)),
            ('until', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'recurrence', ['Rule'])

        # Adding model 'Date'
        db.create_table(u'recurrence_date', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('recurrence', self.gf('django.db.models.fields.related.ForeignKey')(related_name='dates', to=orm['recurrence.Recurrence'])),
            ('mode', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('dt', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'recurrence', ['Date'])

        # Adding model 'Param'
        db.create_table(u'recurrence_param', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('rule', self.gf('django.db.models.fields.related.ForeignKey')(related_name='params', to=orm['recurrence.Rule'])),
            ('param', self.gf('django.db.models.fields.CharField')(max_length=16)),
            ('value', self.gf('django.db.models.fields.IntegerField')()),
            ('index', self.gf('django.db.models.fields.IntegerField')(default=0)),
        ))
        db.send_create_signal(u'recurrence', ['Param'])


    def backwards(self, orm):
        # Deleting model 'Recurrence'
        db.delete_table(u'recurrence_recurrence')

        # Deleting model 'Rule'
        db.delete_table(u'recurrence_rule')

        # Deleting model 'Date'
        db.delete_table(u'recurrence_date')

        # Deleting model 'Param'
        db.delete_table(u'recurrence_param')


    models = {
        u'recurrence.date': {
            'Meta': {'object_name': 'Date'},
            'dt': ('django.db.models.fields.DateTimeField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'mode': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'recurrence': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'dates'", 'to': u"orm['recurrence.Recurrence']"})
        },
        u'recurrence.param': {
            'Meta': {'object_name': 'Param'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'index': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'param': ('django.db.models.fields.CharField', [], {'max_length': '16'}),
            'rule': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'params'", 'to': u"orm['recurrence.Rule']"}),
            'value': ('django.db.models.fields.IntegerField', [], {})
        },
        u'recurrence.recurrence': {
            'Meta': {'object_name': 'Recurrence'},
            'dtend': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'dtstart': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'recurrence.rule': {
            'Meta': {'object_name': 'Rule'},
            'count': ('django.db.models.fields.PositiveIntegerField', [], {'null': 'True', 'blank': 'True'}),
            'freq': ('django.db.models.fields.PositiveIntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'interval': ('django.db.models.fields.PositiveIntegerField', [], {'default': '1'}),
            'mode': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'recurrence': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'rules'", 'to': u"orm['recurrence.Recurrence']"}),
            'until': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'wkst': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0', 'null': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['recurrence']