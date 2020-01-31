*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Verify Angle Details
    [Arguments]    ${angleName}
    Search Angle From Search Page And Execute Angle    ${angleName}
    Open Angle Detail Popup
    Verify Angle Details General Tab
    Verify Angle Details Definition Tab
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
    Click Angle Detail General Tab
    Click Set Angle to Template
    Click Save Angle

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

Add Filter From Angle Details Popup
    [Arguments]   ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Click Add Filter In Definition Tab
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}     ${isSelfSource}

Add Filter Before Jump From Angle Details Popup
    [Arguments]   ${panelIndex}    ${fieldKeyword}    ${fieldId}    ${isSelfSource}
    Click Add Filter From Jump    ${panelIndex}
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}     ${isSelfSource}

Add Compare Filter From Angle Details Popup
    [Arguments]   ${fieldKeyword}    ${fieldId}     ${isSelfSource}
    Click Select Existing Field In Definition Tab
    Add Field By Search From Field Chooser    ${fieldKeyword}    ${fieldId}     ${isSelfSource}