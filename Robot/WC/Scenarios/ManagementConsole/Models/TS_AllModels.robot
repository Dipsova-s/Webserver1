*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/AllModels.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/EditAllModels.robot

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

Verify License Type by ID
    [Arguments]    ${ID}    ${Type}
    Page Should Contain Element    ${trRowAllModelGrid}:contains(${ID}) td:contains(${Type})

Add New Models And Save
    [Arguments]    ${MODELS_ID}    ${MODELS_SHORTNAME}    ${MODELS_NAME}    ${MODELS_ENVIRONMENT}    ${MODELS_AGENT_URI}
    ${chkIconExist}    Is Element Visible    ${trRowAllModelGrid}:contains(${MODELS_ID})
    Run Keyword If    ${chkIconExist} == True    Delete Existing Models    ${MODELS_ID}
    Click Create Models by ID    ${MODELS_ID}    ${MODELS_SHORTNAME}    ${MODELS_NAME}    ${MODELS_ENVIRONMENT}    ${MODELS_AGENT_URI}

Click Create Models by ID
    [Arguments]    ${MODELS_ID}    ${MODELS_SHORTNAME}    ${MODELS_NAME}    ${MODELS_ENVIRONMENT}    ${MODELS_AGENT_URI}
    Click Create Models
    Add Model ID    ${MODELS_ID}
    Add Model Short Name    ${MODELS_SHORTNAME}
    Add Model Name    ${MODELS_NAME}
    Add Model Environment    ${MODELS_ENVIRONMENT}
    Add Model Agent URL    ${MODELS_AGENT_URI}
    Sleep    ${TIMEOUT_GENERAL}
    Click Save Models
    Wait MC Progress Bar Closed

Verify Models After Added
    [Arguments]    ${MODELS_ID}
    Wait Until All Models Page Loaded
    Page Should Contain Element    ${trRowAllModelGrid}:contains(${MODELS_ID})

Delete Existing Models
    [Arguments]    ${MODELS_ID}
    Page Should Contain Element    ${trRowAllModelGrid}
    Click Delete Models By ID    ${MODELS_ID}
    Sleep    ${TIMEOUT_GENERAL}
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed
    Go To     ${URL_MC}
    Login To MC By Admin User
    Go To All Models Page

Delele Models by ID
    [Arguments]    ${MODELS_ID}
    Click Delete Models By ID    ${MODELS_ID}

Verify Models After Delele
    [Arguments]    ${MODELS_ID}
    Wait Until All Models Page Loaded
    Page Should Not Contain Element    ${trRowAllModelGrid}:contains(${MODELS_ID})

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