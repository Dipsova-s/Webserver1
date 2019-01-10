*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/ModelOverview.robot

*** Keywords ***
Go To ${model} Model Overview Page
    Go To MC Page    /Models/${model}/
    Wait Until Model Overview Page Loaded