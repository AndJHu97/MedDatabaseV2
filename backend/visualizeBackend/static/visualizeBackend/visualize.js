$(document).ready(function () {
    // Add event listener to generate document links
    $(document).on('click', '.generate-text', function (e) {
        e.preventDefault();

       // Get the JSON string from the data attribute
        var algorithmName = $(this).data('name');

        // Create the content of the text document with the algorithm name
        var textContent = 'This is the content of the text document for ' + algorithmName + '.<br>You can add any text here.';

        // Display the document content on the webpage
        $('#document-content').html(textContent);
    });

    $('.add-algorithm').each(function(){
        var nextSteps = $(this).data('name');
        addNextStep(nextSteps, this);
        
    })

    function addNextStep(nextSteps, parentElement){
        
        //make sure there are more next steps
        while(nextSteps && nextSteps.length > 0){
            var ul = document.createElement('ul');
            for (var i = 0; i < nextSteps.length; i++) {
                var currentStep = nextSteps[i];
                var li = document.createElement('li');
                li.setAttribute('class', 'generate-text');
                // Add the data-name attribute to the <li> element
                li.setAttribute('data-name', currentStep.ConditionsForNextStep);
                li.textContent = currentStep.ConditionsForNextStep;
                ul.appendChild(li);
                addNextStep(currentStep, li);
            }
            // Append the created <ul> to the parent element
            parentElement.appendChild(ul);
        }
    }
});