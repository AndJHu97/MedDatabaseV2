# Generated by Django 5.0.1 on 2024-02-06 22:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0011_rename_managementid_disease_management_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='nextstep',
            name='SymptomHistory',
        ),
        migrations.RemoveField(
            model_name='nextstep',
            name='SymptomPE',
        ),
        migrations.RemoveField(
            model_name='nextstep',
            name='SymptomTest',
        ),
        migrations.RemoveField(
            model_name='nextstep',
            name='SymptomVitals',
        ),
        migrations.CreateModel(
            name='Symptoms',
            fields=[
                ('ID', models.AutoField(primary_key=True, serialize=False)),
                ('Name', models.CharField(max_length=255, null=True)),
                ('Number', models.CharField(blank=True, max_length=255, null=True)),
                ('Notes', models.TextField(blank=True, null=True)),
                ('ExamType', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='main.examtype')),
            ],
        ),
        migrations.AddField(
            model_name='nextstep',
            name='Symptom',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='main.symptoms'),
        ),
    ]
