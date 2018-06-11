*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Verify Angle Details
    [Arguments]    ${angleName}
    Search By Text And Expect In Search Result    ${angleName}
    Open Angle From First Angle in Search Page    ${angleName}
    Open Angle Detail Popup
    Verify Angle Details General Tab
    Verify Angle Details Definition Tab
    Verify Angle Details Publishing Tab
    Verify Angle Details Statistics Tab

Verify Angle Details General Tab
    Click Angle Detail General Tab
    Wait Until Page Contains Element    ${txtAngleId}
    Wait Until Page Contains Element    ${divAngleBusinessProcess}
    ${modelName}    Get Model Name for Create New Angle
    ${angleId}    Get Angle ID
    ${angleIDValue}     Get Value    ${txtAngleId}
    Should Be Equal    ${angleIDValue}    ${angleId}
    Click Angle Detail Description Tab
    ${languageName}    Get Language in Angle Detail
    ${angleName}    Get Angle Name in Angle Detail
    Wait Until Page Contains Element    ${btnAddLanguageAngle}
    ${languageValue}    Get Text    ${angleLanguageItem}
    Should Be Equal    ${languageValue}    ${languageName}
    ${angleNameValue}    Get Value    ${txtAngleName}
    Should Be Equal    ${angleNameValue}    ${angleName}

Verify Angle Details Definition Tab
    Click Angle Detail Definition Tab
    Wait Until Page Contains Element    ${btnAddjump}
    Wait Until Page Contains Element    ${btnAddFilter}

Verify Angle Details Publishing Tab
    Click Angle Detail Publishing Tab
    Wait Until Page Contains Element    ${btnSetToPublish}
    Wait Until Page Contains Element    ${btnSetToValidate}
    Wait Until Page Contains Element    ${btnSetToTemplate}
    Wait Until Page Contains    Privilege labels
    Click Element    jquery=#${tabSearchLabel}


Verify Angle Details Statistics Tab
    Click Angle Detail Statistics Tab
    Wait Until Ajax Complete
    Page Should Contain    Statistics
    Page Should Contain    Created by
    Page Should Contain    Last changed by
    Page Should Contain    Last executed by
    Page Should Contain    Number of executes
    Page Should Contain    Validation last changed by
    Page Should Contain    Marked for deletion
    Close Angle Detail Popup

Set Angle to Template
    Open Angle Detail Popup
    Click Angle Detail Publishing Tab
    Click Set Angle to Template
    Click Save Angle

Publish Angle Via Angle Publishing Popup
    Open Angle Publishing Popup
    Click Publish Angle

Open Angle Popup And Save ID
    [Arguments]    ${id}
    Open Angle Detail Popup
    Input Angle ID    ${id}
    Click Save Angle

Open Angle Popup And Save Name
    [Arguments]    ${name}
    Open Angle Detail Popup
    Click Angle Detail Description Tab
    Input Angle Name    ${name}
    Click Save Angle

Verify Validate Angle Via Angle Detail Popup
    [Arguments]       ${angleName}
    Login To WC By Power User
    Search By Text And Expect In Search Result    ${angleName}
    Open Angle From First Angle in Search Page    ${angleName}
    Open Angle Detail Popup
    Click Angle Detail Publishing Tab
    Click Angle Set to Validate
    Click Save Angle
    Open Angle Detail Popup
    Click Angle Detail Publishing Tab
    Click Angle Set to Validate
    Click Save Angle

Add Filter From Angle Details Popup
    [Arguments]   ${fieldKeyword}    ${fieldId}
    Click Add Filter In Definition Tab
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}

Add Compare Filter From Angle Details Popup
    [Arguments]   ${fieldKeyword}    ${fieldId}
    Click Select Existing Field In Definition Tab
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}