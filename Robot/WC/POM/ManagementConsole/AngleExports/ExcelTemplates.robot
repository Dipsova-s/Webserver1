*** Variables ***
${btnUploadTemplate}                xpath=//form[@id='UploadExcelTemplateFileForm']/div/div/div/input
${trRowInExcelTemplateGrid}         jquery=#ExcelTemplatesGrid > div > div > table > tbody > tr
${popUpConfirmationTodelete}        xpath=//div[@id='popupConfirmation']
${btnConfirmToDelete}               xpath=//div[@id='popupConfirmation']/div[@class='popupToolbar']/a[contains(text(),'OK')]
${trExcelTemplates}                 //tbody[@role='rowgroup']/tr/td/span[contains(@data-tooltip-title, 'xlsx')]

*** Keywords ***
Wait For ExcelTemplates Page Ready
    Wait Until Page Contains    Excel templates
    Wait Until Page Contains Element     ${btnUploadTemplate}
    Sleep    ${TIMEOUT_GENERAL}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait For ExcelTemplates Grid Ready

Wait For ExcelTemplates Grid Ready
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Page Does Not Contain Element      css=#ExcelTemplatesGrid .k-loading-mask
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}

Click Upload Excel Template
    [Arguments]    ${filePath}
    Wait Until Page Contains Element    ${btnUploadTemplate}
    Choose File     ${btnUploadTemplate}    ${filePath}

Click Download Excel Template
    [Arguments]     ${excelFileName}
    Click Element     //tr[@id='row-${excelFileName}']/td[3]/div/div/a[contains(text(),'Download')]
    
Click Delete Excel Template
    [Arguments]     ${excelFileName}
    Click Element     //tr[@id='row-${excelFileName}']/td[3]/div/div/a[contains(text(),'Delete')]
    Wait Until Element Is Visible      ${popUpConfirmationTodelete}
    Click Element      ${btnConfirmToDelete}
    Wait Progress Bar Closed

Count of Excel Templates
    ${countExcelTemplates}  Get Element Count   ${trExcelTemplates}
    [Return]    ${countExcelTemplates}

List of Excel Templates
    ${count}    Count of Excel Templates
    @{listExcelTemplates}   Create List
    :FOR    ${i}    IN RANGE    1   ${count} + 1
    \    ${nameExcelTemplate}    Get Text    (${trExcelTemplates})[${i}]
    \    Append To List      ${listExcelTemplates}   ${nameExcelTemplate}
    [Return]    ${listExcelTemplates}