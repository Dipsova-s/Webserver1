*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/ModelsLanguages.robot

*** Keywords ***
Go To ${model} Model Language Page
    Go To MC Page    /Models/${model}/Languages/
    Wait Until Model Language Page Ready