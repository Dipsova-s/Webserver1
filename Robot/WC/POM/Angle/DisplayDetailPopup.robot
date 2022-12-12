*** Variables ***
#General tab
${tabDisplayGeneral}    css=#DisplayGeneral
${ddlDisplayType}    css=#tempDisplayType_ddlWrapper

#Filters & Jumps
${popupMoveFilterNotification}      css=#popupNotification
${btnCloseFilterNotification}       btn-popupNotification1
${btnSubmitFilterConfirmation}      btn-popupNotification0  

#Statistics
${tabDisplayStatistic}     css=#DisplayStatistic

#Generic
${btnSaveDisplay}    btn-popupDisplayDetail1
${btnCloseDisplayDetailPopup}     //div[@id='popupDisplayDetail']/..//div/a[@class='k-button k-flat k-button-icon k-window-action']/span[@class='k-icon k-i-close icon icon-close']/..
${btnCloseJumpNotification}       btn-popupNotification1
${btnSubmitJumpConfirmation}      btn-popupNotification0

#Excel Templates
${optionExcelTemplates}         //select[@id='DefaultExcelTemplate']/option
${txtExcelTemplate}             xpath=//span[contains(@class, 'default-excel-template')]/descendant::span[@class='k-input']
${ddlExistingExcelTemplates}    css=#DefaultExcelTemplate_ddlWrapper

*** Keywords ***
Wait Display Detail Document Loaded
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${tabDisplayGeneral}
    Wait Until Element Is Visible       ${tabDisplayGeneral}

Close Display Detail Popup
    Wait Until Element Is Visible    ${btnCloseDisplayDetailPopup}
    Click Element    ${btnCloseDisplayDetailPopup}

Choose Display Type From Display Details Popup
    [Arguments]    ${choosevalue}
    Select Dropdown By Selector    ${ddlDisplayType}    jquery=#tempDisplayType_listbox .${choosevalue}

Save Display Detail From Popup
    Click Element    ${btnSaveDisplay}
    Wait Progress Bar Closed
    Wait Until Ajax Complete

Confirm To Add Jump
    Wait Until Page Contains    Confirmation
    Wait Until Element Is Visible    ${btnSubmitJumpConfirmation}
    Click Element    ${btnSubmitJumpConfirmation}
    Wait Display Executed

Click Display Detail General Tab
    Wait Until Element Is Visible    ${tabDisplayGeneral}
    Click Element    ${tabDisplayGeneral}

Confirm To Move Filter To Angle Definition
    Wait Until Page Contains    Confirmation
    Wait Until Element Is Visible    ${btnSubmitFilterConfirmation}
    Click Element    ${btnSubmitFilterConfirmation}
    Sleep    ${TIMEOUT_GENERAL}    
    Wait Until Ajax Complete
    Wait Display Executed
    Wait Progress Bar Closed

Confirm To Move Filter To Angle Definition With Adhoc Jump
    Wait Until Page Contains    Confirmation
    Wait Until Element Is Visible    ${btnSubmitFilterConfirmation}
    Click Element    ${btnSubmitFilterConfirmation}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Confirm To Add Jump

Page Should Display Move Filter Warning Popup
    Sleep    ${TIMEOUT_GENERAL}
    Element Should Be Visible    ${popupMoveFilterNotification}

Close Move Filter Warning Popup
    Wait Until Element Is Visible    ${btnCloseFilterNotification}
    Click Element    ${btnCloseFilterNotification}

Click Display Detail DisplayStatistic Tab
    Wait Until Element Is Visible    ${tabDisplayStatistic}
    Click Element    ${tabDisplayStatistic}

Excel Templates Count
    ${countExcelTemplates}     Get Element Count   ${optionExcelTemplates}
    [Return]    ${countExcelTemplates}

Excel Templates List
    ${count}    Excel Templates Count
    @{excelTemplatesList}   Create List
    :FOR    ${i}    IN RANGE    1   ${count} + 1
    \    ${nameExcelTemplate}    Get Value    (${optionExcelTemplates})[${i}]
    \    Append To List      ${excelTemplatesList}   ${nameExcelTemplate}
    [Return]    ${excelTemplatesList}

Selected Excel Template
    ${getExcelTemplate}     Get Text    ${txtExcelTemplate}
    [Return]    ${getExcelTemplate}

Select Excel Template
    [Arguments]     ${excelTemplateName}
    Select Dropdown By InnerText     ${ddlExistingExcelTemplates}    ${excelTemplateName}