# Generated by Django 5.0.1 on 2024-02-06 22:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0012_remove_nextstep_symptomhistory_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='nextstep',
            name='NumberConditionsForNextStep',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='nextstep',
            name='OperatorConditionForNumber',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
