*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/AllModels.robot

*** Keywords ***
Go To All Models Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu All Models
    Wait Until All Models Page Loaded

Go To EA2_800 Models Page
    Wait Side Menu Ready
    Click Side Menu Models
    Click Side Menu Models EA2_800
    Wait Until Models Info Loaded

Verify Status And Report Button
    Page Should Contain Element    ${btnEA2800InFo}
    Page Should Contain Element    ${btnEA2800XtractorInFo}
    Verify Status And Report EA2_800 PopUp
    Click Close Model Report PopUp
    Verify Status And Report EA2_800_Xtractor PopUp
    Click Close Model Report PopUp

Verify Model Server Report Filter
    [Arguments]    ${Keyword}
    Verify Status And Report EA2_800 PopUp
    Click Tree Class Report
    Click Class DeliveryNoteLine Report
    Verify Report Filter    ${Keyword}
    Click Close Model Report PopUp

Verify Popup Stop Server
    Click Stop Server
    Wait Until Page Contains Element    ${popupConfirmationStopServer}
    Click Close Pop Up Stop Server