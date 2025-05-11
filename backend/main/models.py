from django.db import models

class Symptoms(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True, blank = True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True, blank = True)

#Which symptoms needed to trigger workup, etc.
class TriggerChecklist(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Group = models.CharField(max_length = 2)
    #Need to split to positive and negative symptoms
    # Separate Many-to-Many fields for positive and negative symptoms
    PositiveSymptoms = models.ManyToManyField(
        'Symptoms', related_name='positive_trigger_checklist', blank=True
    )
    NegativeSymptoms = models.ManyToManyField(
        'Symptoms', related_name='negative_trigger_checklist', blank=True
    )
    MandatoryPositiveSymptoms = models.ManyToManyField(
        'Symptoms', related_name='mandatory_positive_trigger_checklist', blank=True
    )
    MandatoryNegativeSymptoms = models.ManyToManyField(
        'Symptoms', related_name='mandatory_negative_trigger_checklist', blank=True
    )
    ChecklistLogic = models.CharField(max_length=255, null=True)
    #Type of selection like all or nothing or need 3/5 of the symptoms or cannot be these
    SelectionType = models.ForeignKey('SelectionType', on_delete=models.CASCADE, null=True, blank = True)
    SelectionAdditionalInfo = models.CharField(max_length=255, null=True, blank = True)
    GeneralAdditionalInfo = models.CharField(max_length=255, null=True, blank = True)
    Source = models.CharField(max_length=255, null=True, blank = True)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE, null=True, blank = True)
    
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
    #Will not use for now
    OperatorConditionForNumber = models.CharField(max_length=255, null=True, blank = True)
    Symptom = models.ForeignKey('Symptoms', on_delete=models.CASCADE, null=True, blank = True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class Diagnosis(models.Model):
    Name = models.CharField(max_length=255, null=True, blank = True)


class DiseaseAlgorithm(models.Model):
    Name = models.CharField(max_length=255, null=True, blank = True)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE, null=True, blank = True)
    DiseaseName = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True, blank = True)
    Source = models.TextField(null=True, blank = True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='disease_algorithm', null = True, blank = True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "disease_algorithm", null = True, blank = True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True, blank = True)
    Diagnosis = models.ForeignKey(Diagnosis, on_delete=models.SET_NULL, null=True, blank=True)


class Vitals(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class TestAssessment(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='test_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "test_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class TestWorkup(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='test_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "test_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class HistoryWorkup(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='history_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "history_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class VitalsWorkup(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='vitals_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "vitals_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class Test(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class History(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class VitalsManagement(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='vital_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class HistoryAssessment(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='history_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "history_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class PEManagement(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='pe_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class PE(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Number = models.CharField(max_length=255, null=True, blank = True)
    Notes = models.TextField(null=True)
    ExamIDType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class DiseaseAssessment(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE, null=True)
    DiseaseName = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='disease_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "disease_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class Management(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)

class Disease(models.Model):
    Name = models.CharField(max_length=255, null = True, blank=True)
    Notes = models.TextField(blank=True, null = True)
    AlgorithmTrigger = models.ManyToManyField(TriggerChecklist, related_name = "disease_alg_trigger", blank=True)
    RootAlgorithmNodes = models.ManyToManyField(DiseaseAlgorithm, related_name='root_diseases_algorithms', blank=True)
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True, blank=True)
    

class TestManagement(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='test_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class PEWorkup(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='pe_workup')
    Workup = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "pe_workup")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class ExamType(models.Model):
    Name = models.CharField(max_length=255, null=True)

class PEAssessment(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='pe_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "pe_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class HistoryManagement(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='history_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE, null=True)
    ManagementName = models.TextField(null=True)
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class VitalsAssessment(models.Model):
    Name = models.CharField(max_length=255, null=True)
    Notes = models.TextField(null=True)
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='vital_assessment')
    Assessment = models.CharField(max_length=255, null=True)
    NextSteps = models.ManyToManyField(NextStep, related_name = "vitals_assessment")
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE, null=True)

class DiseaseManagement(models.Model):
    Name = models.CharField(max_length=255)
    Disease = models.ForeignKey('Disease', on_delete=models.CASCADE)
    DiseaseName = models.CharField(max_length=255)
    Notes = models.TextField()
    Triggers = models.ManyToManyField(TriggerChecklist, related_name='disease_management')
    Management = models.ForeignKey('Management', on_delete=models.CASCADE)
    ManagementName = models.CharField(max_length=255)
    NextSteps = models.ManyToManyField('NextStep', related_name='disease_managements')
    ExamType = models.ForeignKey('ExamType', on_delete=models.CASCADE)
