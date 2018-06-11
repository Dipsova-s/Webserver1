*** Variables ***
#Generic
${divAngleDetailPopup}    css=#popupAngleDetail
${pgbAngleDetailsPopup}     css=#popupAngleDetail > div.k-loading-mask
${btnCloseAngleDetailPopup}    css=.popupAngleDetail .k-i-close
${btnSaveAngle}    btn-popupAngleDetail2

#Create Template from Angle
${lnkAngleName}    css=#AngleName span
${popupNotification}    css=#popupNotification

#Angle Detail Tab
${tabAngleGeneral}    AngleGeneral
${tabAngleDescription}    AngleDescription
${tabAngleDefinition}    AngleDefinition
${tabAnglePublishing}    AnglePublishing
${tabAngleStatistic}    AngleStatistic

#General Tab
${txtAngleId}           AngleId
${divAngleBusinessProcess}          css=.businessProcesses
${modelValueLabel}                  css=.inputModelValue
${businessProcessesS2D}             css=.businessProcesses .businessProcessesItem.S2D
${businessProcessesTestBP}          css=.businessProcesses .businessProcessesItem.TestBP
${businessProcessesTestDeleteBP}    css=.businessProcesses .businessProcessesItem.TestDelBP

#Description tab
${btnAddLanguageAngle}    css=.btnAddLanguage
${angleLanguageAvailableList}    jquery=#AngleDescriptionArea .languageAvailableList .Item
${angleLanguageItem}    jquery=.LanguageItem
${txtAngleName}    css=#AngleDescriptionArea .languageName
${txtAngleDescription}    css=#AngleDescriptionArea .languageDescription

#Definition tab
${btnAddjump}    AddFollowUp
${btnAddFilter}    AddFilter
${btnSelectField}    CompareButton-0
${btnSelectExistingField}    UncompareButton-0

#Publishing tab
${btnSetToPublish}    css=.btnPublish
${btnSetToValidate}    css=.btnValidate
${btnSetToTemplate}    css=.btnTemplate
${btnAddPrivilegeLabel}    jquery=#PublishTabWrapper .tabPanel:eq(0) .btnAddLabel
${tabSearchLabel}    PublishTabWrapper .tabMenu li:eq(1)
${btnAddSearchLabel}    jquery=#PublishTabWrapper .tabPanel:eq(1) .btnAddLabel
${chkAllowUserToObtainMoreDetails}    AllowMoreDetails

#Angle statistic tab
${lblLastExecutedDate}    jquery=#AngleStatisticArea .input:eq(2) > span:eq(1)

*** Keywords ***
Wait Angle Detail Document Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${divAngleDetailPopup}
    Wait Until Page Does Not Contain Element    ${pgbAngleDetailsPopup}
    Wait Until Element Is Visible    ${tabAngleGeneral}
    Wait Until Element Is Visible    ${tabAngleDescription}
    Wait Until Element Is Visible    ${tabAngleDefinition}
    Wait Until Element Is Visible    ${tabAnglePublishing}
    Wait Until Element Is Visible    ${btnCloseAngleDetailPopup}

Input Angle Name
    [Arguments]    ${angleName}
    Wait Until Element Is Visible    ${txtAngleName}
    Input Text    ${txtAngleName}    ${angleName}

Input Angle Description
    [Arguments]    ${angleDescription}
    Input kendo Text Editor    ${txtAngleDescription}     ${angleDescription}

Click Add Language Button
    Wait Until Element Is Visible    ${btnAddLanguageAngle}
    Click Element    css=.btnAddLanguage

Click Delete French Language Button
    Wait Until Element Is Visible    ${btnAddLanguageAngle}
    Mouse Over     ${angleLanguageItem}:contains(French)
    Click Element    ${angleLanguageItem}:contains(French) .LanguageDelete

Selct Dutch Language From Language List
    Wait Until Element Is Visible    ${angleLanguageAvailableList}:contains(Dutch)
    Click Element    ${angleLanguageAvailableList}:contains(Dutch)

Selct French Language From Language List
    Wait Until Element Is Visible    ${angleLanguageAvailableList}:contains(French)
    Click Element    ${angleLanguageAvailableList}:contains(French)

Select English Language On Angle
    Click Element    ${angleLanguageItem}:contains(English)

Select Dutch Language On Angle
    Click Element    ${angleLanguageItem}:contains(Dutch)

Select French Language On Angle
    Click Element    ${angleLanguageItem}:contains(French)

Angle Name Should Be Equal
    [Arguments]    ${angleName}
    ${compareAngleName}    Get Value    ${txtAngleName}
    Should Be Equal    ${compareAngleName}    ${angleName}

Angle Description Should Be Equal
    [Arguments]    ${angleDescription}
    ${compareAngleDescription}    Get Value    ${txtAngleDescription}
    Should Be Equal    ${compareAngleDescription}    ${angleDescription}

Angle English Language Should Be Available
    Page Should Contain Element    ${angleLanguageItem}:contains(English)

Angle French Language Should Not Available
    Page Should Not Contain Element    ${angleLanguageItem}:contains(French)

Click Save Angle
    Click Element    ${btnSaveAngle}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Click Set Angle to Template
    Wait Until Element Is Visible    ${btnSetToTemplate}
    Click Element    ${btnSetToTemplate}

Open Angle From First Angle in Search Page
    [Arguments]    ${angleName}
    Click Link First Item From Search Result
    Sleep    2s
    Wait Angle Page Document Loaded
    Wait Until Page Contains    ${angleName}
    Wait Until Element Is Visible    ${lnkAngleName}

Click Angle Detail General Tab
    Wait Until Element Is Visible    ${tabAngleGeneral}
    Click Element    ${tabAngleGeneral}

Click Angle Detail Description Tab
    Wait Until Element Is Visible    ${tabAngleDescription}
    Click Element    ${tabAngleDescription}

Click Angle Detail Definition Tab
    Wait Until Element Is Visible    ${tabAngleDefinition}
    Click Element    ${tabAngleDefinition}

Click Angle Detail Publishing Tab
    Wait Until Element Is Visible    ${tabAnglePublishing}
    Click Element    ${tabAnglePublishing}
    Wait Until Ajax Complete

Click Angle Detail Statistics Tab
    Wait Until Element Is Visible    ${tabAngleStatistic}
    Click Element    ${tabAngleStatistic}

Close Angle Detail Popup
    Wait Until Element Is Visible    ${btnCloseAngleDetailPopup}
    Click Element    ${btnCloseAngleDetailPopup}

Open Angle Detail Popup
    Wait Progress Bar Closed
    Wait Until Element Is Visible    ${lnkAngleName}
    Click Element    ${lnkAngleName}
    Wait Angle Detail Document Loaded

Get Last Execute Angle Date
    Click Element    ${tabAngleStatistic}
    ${lastExecuteText}    Get Text    ${lblLastExecutedDate}
    ${lastExecuteDateString}    Get Substring    ${lastExecuteText}    3    14
    ${lastExecuteTimeString}    Get Substring    ${lastExecuteText}    18    23
    ${lastExecuteDateTimeString}    Catenate    ${lastExecuteDateString}    ${lastExecuteTimeString}
    [Return]    ${lastExecuteDateTimeString}

Get Angle ID
    Wait Until Element Is Visible    ${tabAngleGeneral}
    Click Element    ${tabAngleGeneral}
    Wait Until Element Is Visible    ${txtAngleId}
    ${angleIDValue}    Get Value    ${txtAngleId}
    [return]    ${angleIDValue}

Input Angle ID
    [Arguments]    ${id}
    Wait Until Element Is Visible    ${tabAngleGeneral}
    Click Element    ${tabAngleGeneral}
    Wait Until Element Is Visible    ${txtAngleId}
    Input Text    ${txtAngleId}   ${id}

Get Language in Angle Detail
    Wait Until Element Is Visible    ${tabAngleDescription}
    Click Element    ${tabAngleDescription}
    Wait Until Element Is Visible    ${angleLanguageItem}
    ${languageValue}    Get Text    ${angleLanguageItem}
    [return]    ${languageValue}

Get Angle Name in Angle Detail
    Wait Until Element Is Visible    ${tabAngleDescription}
    Click Element    ${tabAngleDescription}
    Wait Until Element Is Visible    ${txtAngleName}
    ${angleNameValue}    Get Value    ${txtAngleName}
    [return]    ${angleNameValue}

Click Angle Set to Publish
    Wait Until Element Is Visible    ${btnSetToPublish}
    Click Element    ${btnSetToPublish}

Click Angle Set to Validate
    Wait Until Element Is Visible    ${btnSetToValidate}
    Click Element    ${btnSetToValidate}

Click Add Filter In Definition Tab
    Wait Until Element Is Visible    ${btnAddFilter}
    Click Element    ${btnAddFilter}

Click Select Field Button In Definition Tab
    Wait Until Element Is Visible    ${btnSelectField}
    Click Element    ${btnSelectField}

Click Select Existing Field In Definition Tab
    Wait Until Element Is Visible    ${btnSelectExistingField}
    Click Element    ${btnSelectExistingField}

Choose Dropdown Filter Operator In Definition Tab
    [Arguments]   ${selectText}
    Choose Dropdown Filter Operator    0    ${selectText}


Click Do Not Allow User To Obtain More Details
    Select Checkbox    ${chkAllowUserToObtainMoreDetails}

Click Allow User To Obtain More Details
    Unselect Checkbox    ${chkAllowUserToObtainMoreDetails}

