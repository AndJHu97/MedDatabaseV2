from django.contrib import admin
from django.db import models
# Register your models here.
from .models import Diagnosis, NextStep, Symptoms, SelectionType, TriggerChecklistItem, DiseaseAlgorithm, Vitals, TestAssessment, TestWorkup, HistoryWorkup, VitalsWorkup, Test, History, VitalsManagement, HistoryAssessment, PEManagement, PE, DiseaseAssessment, Management, Disease, TestManagement, PEWorkup, ExamType, PEAssessment, HistoryManagement, VitalsAssessment

admin.site.register(Diagnosis)
admin.site.register(ExamType)
admin.site.register(Symptoms)
admin.site.register(History)
admin.site.register(HistoryWorkup)
admin.site.register(HistoryAssessment)
admin.site.register(HistoryManagement)

admin.site.register(Vitals)
admin.site.register(VitalsWorkup)
admin.site.register(VitalsAssessment)
admin.site.register(VitalsManagement)

admin.site.register(SelectionType)
admin.site.register(TriggerChecklistItem)
admin.site.register(Test)
admin.site.register(TestWorkup)
admin.site.register(TestAssessment)
admin.site.register(TestManagement)

admin.site.register(PE)
admin.site.register(PEWorkup)
admin.site.register(PEAssessment)
admin.site.register(PEManagement)

admin.site.register(Disease)
admin.site.register(DiseaseAssessment)
admin.site.register(DiseaseAlgorithm)

admin.site.register(Management)

admin.site.register(NextStep)
