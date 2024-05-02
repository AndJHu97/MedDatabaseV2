from django.db import models

#accidentally defined primary key as ID rather than using default id
class Symptoms(models.Model):
    ID = models.AutoField(primary_key = True)
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True, blank = True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True, blank = True)

class TriggerChecklistItem(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Group = models.CharField(max_length = 2)
    SymptomTrigger = models.ForeignKey('Symptoms', on_delete=models.CASCADE, null=True, blank = True)
    #Type of selection like all or nothing or need 3/5 of the symptoms or cannot be these
    SelectionType = models.ForeignKey('SelectionType', on_delete=models.CASCADE, null=True, blank = True)
    SelectionAdditionalInfo = models.CharField(max_length=255, null=True)

class SelectionType(models.Model):
    Name = models.CharField(max_length=255, null=True)


class NextStep(models.Model):
    #Name of the next 
    NextStepName = models.TextField(null = True)
    #ID for next step in assessment, workup, or algorithm
    NextStepHistoryWorkup = models.ForeignKey('HistoryWorkup', on_delete=models.CASCADE, null=True, blank = True)
    NextStepHistoryAssessment = models.ForeignKey('HistoryAssessment', on_delete=models.CASCADE, null=True, blank = True)
    NextStepVitalWorkup = models.ForeignKey('VitalsWorkup', on_delete=models.CASCADE, null=True, blank = True)
    NextStepVitalAssessment = models.ForeignKey('VitalsAssessment', on_delete=models.CASCADE, null=True, blank = True)
    NextStepPEWorkup = models.ForeignKey('PEWorkup', on_delete=models.CASCADE, null=True, blank = True)
    NextStepPEAssessment = models.ForeignKey('PEAssessment', on_delete=models.CASCADE, null=True, blank = True)
    NextStepTestWorkup = models.ForeignKey('TestWorkup', on_delete=models.CASCADE, null=True, blank = True)
    NextStepTestAssessment = models.ForeignKey('TestAssessment', on_delete=models.CASCADE, null=True, blank = True)
    NextStepDiseaseAlgorithm = models.ForeignKey('DiseaseAlgorithm', on_delete=models.CASCADE, null=True, blank = True)
    NextStepDiseaseAssessment = models.ForeignKey('DiseaseAssessment', on_delete=models.CASCADE, null=True, blank = True)
    NextStepDiseaseDiagnosis = models.ForeignKey('Disease', on_delete=models.CASCADE, null=True, blank = True)
    #condition for the next step
    ConditionsForNextStep = models.TextField(null = True, blank = True)
    #For the number condition
    NumberConditionsForNextStep = models.CharField(max_length=255, null=True, blank = True)
    OperatorConditionForNumber = models.CharField(max_length=255, null=True, blank = True)
    Symptom = models.ForeignKey('Symptoms', on_delete=models.CASCADE, null=True, blank = True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class DiseaseAlgorithm(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE, null=True)
    DiseaseName = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='disease_algorithm')
    NextSteps = models.ManyToManyField(NextStep, related_name = "disease_algorithm")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class Vitals(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class TestAssessment(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='test_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "test_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class TestWorkup(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='test_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "test_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class HistoryWorkup(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='history_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "history_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class VitalsWorkup(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='vitals_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "vitals_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class Test(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class History(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class VitalsManagement(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='vital_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class HistoryAssessment(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='history_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "history_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class PEManagement(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='pe_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class PE(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamIDType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class DiseaseAssessment(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE, null=True)
    DiseaseName = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='disease_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "disease_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class Management(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)

class Disease(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null = True, blank=True)
    Notes = models.TextField(blank=True, null = True)
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True, blank=True)

class TestManagement(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='test_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class PEWorkup(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='pe_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "pe_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class ExamType(models.Model):
    ID = models.AutoField(primary_key=True)
    ExamType = models.CharField(max_length=255, null=True)

class PEAssessment(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='pe_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "pe_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class HistoryManagement(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='history_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class VitalsAssessment(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='vital_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "vitals_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class DiseaseManagement(models.Model):
    ID = models.AutoField(primary_key=True)
    Name = models.CharField(max_length=255)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE)
    DiseaseName = models.CharField(max_length=255)
    Notes = models.TextField()
    Triggers = models.ManyToManyField(TriggerChecklistItem, related_name='disease_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE)
    ManagementName = models.CharField(max_length=255)
    NextSteps = models.ManyToManyField('NextStep', related_name='disease_managements')
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE)
