*** Variables ***
${btnSaveBusinessProcess}                      css=.btnSave

${txtBusinessProcessSettingId}                 css=#BusinessProcessesCategoryGrid input[name="id"]
${txtBusinessProcessSettingEnglish}            css=#BusinessProcessesCategoryGrid input[name="lang_en"]
${txtBusinessProcessSettingGerman}             css=#BusinessProcessesCategoryGrid input[name="lang_de"]
${txtBusinessProcessSettingSpanish}            css=#BusinessProcessesCategoryGrid input[name="lang_es"]
${txtBusinessProcessSettingFrench}             css=#BusinessProcessesCategoryGrid input[name="lang_fr"]
${txtBusinessProcessSettingDutch}              css=#BusinessProcessesCategoryGrid input[name="lang_nl"]

${trRowInBusinessProcessGrid}               jquery=#BusinessProcessesGrid tbody tr
${txtBusinessProcessAbbreviation}           input[name="abbreviation"]
${txtBusinessProcessEnglish}                input[name="lang_en"]
${txtBusinessProcessGerman}                 input[name="lang_de"]
${txtBusinessProcesspanish}                 input[name="lang_es"]
${txtBusinessProcessFrench}                 input[name="lang_fr"]
${txtBusinessProcessDutch}                  input[name="lang_nl"]

${btnMCAddBusinessProcess}                  css=#BusinessProcessLabelForm .btnAdd
${btnDeleteBusinessProcess}                 .btnDelete
${chkEnableBusinessProcess}                 input[name="enabled"]

#Privew Business Process Popup
${btnPreviewBusinessProcess}                jquery=#BusinessProcessLabelForm a[title="Preview Business Process Bar"]
${divPopupPreviewBusinessProcess}           popupPreview
${divClosePopupPreviewBusinessProcess}      css=#popupPreview .btnClose
${divPreviewBusinessProcess}                css=.businessProcesses

#Preview Business
${btnConfirmDeleteBusinessProcess}          css=#popupConfirmAction .btnSubmit

${divNewBusinessProcessRow}                 .newRow


*** Keywords ***
Click Add Business Process
    [Arguments]    ${businessProcssName}
    ${chkLableExist}    Is Element Visible    ${trRowInBusinessProcessGrid}:contains(${businessProcssName})
    Run Keyword If    ${chkLableExist} == True    Delete Business Process    ${businessProcssName}
    Click Add New Business Process

Click Add New Business Process
    Wait Until Element Is Visible    ${btnMCAddBusinessProcess}
    Click Element    ${btnMCAddBusinessProcess}

Fill English In Business Process By Abbreviation
    [Arguments]    ${abbreviation}    ${englishText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}:contains(${abbreviation}) ${txtBusinessProcessEnglish}
    Input Text    ${trRowInBusinessProcessGrid}:contains(${abbreviation}) ${txtBusinessProcessEnglish}    ${englishText}

Click Enable Business Process By Abbreviation
    [Arguments]    ${abbreviation}
    ${chkEnable}    Get Element Count    ${trRowInBusinessProcessGrid}:contains(${abbreviation}) ${chkEnableBusinessProcess}:checked
    Run Keyword If    "${chkEnable}" == "0"    Click Action In Grid By Name    ${abbreviation}    ${trRowInBusinessProcessGrid}    ${chkEnableBusinessProcess}

Click Delete Business Process By Abbreviation
    [Arguments]    ${abbreviation}
    Click Action In Grid By Name     ${abbreviation}    ${trRowInBusinessProcessGrid}    ${btnDeleteBusinessProcess}

Click Preview Business Process bar
    Scroll Vertical     ${mainContent}     200
    Wait Until Element Is Visible    ${btnPreviewBusinessProcess}    ${TIMEOUT_MC_LOAD}
    Click Element    ${btnPreviewBusinessProcess}
    Wait Until Element Is Visible     ${divPopupPreviewBusinessProcess}

Close Preview Business Process Bar Popup
    Wait Until Page Contains Element    ${divClosePopupPreviewBusinessProcess}
    Click Element    ${divClosePopupPreviewBusinessProcess}

Click Save Business Process Without Delete
    Wait Until Page Contains Element    ${btnSaveBusinessProcess}
    Click Element    ${btnSaveBusinessProcess}
    Wait Until Ajax Complete
    Wait MC Progress Bar Closed

Click Save And Delete Business Process
    Wait Until Page Contains Element    ${btnSaveBusinessProcess}
    Click Element    ${btnSaveBusinessProcess}
    Wait Until Page Contains    Deleted labels
    Wait Until Page Contains Element    ${btnConfirmDeleteBusinessProcess}
    Click Element    ${btnConfirmDeleteBusinessProcess}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}

Fill Abbreviation In New Business Process
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessAbbreviation}
    Input Text    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessAbbreviation}    ${valueText}

Fill English In New Business Process
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessEnglish}
    Input Text    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessEnglish}    ${valueText}

Fill German In New Business Process
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessGerman}
    Input Text    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessGerman}    ${valueText}

Fill Spanish In New Business Process
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcesspanish}
    Input Text    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcesspanish}    ${valueText}

Fill French In New Business Process
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessFrench}
    Input Text    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessFrench}    ${valueText}

Fill Dutch In New Business Process
    [Arguments]    ${valueText}
    Wait Until Page Contains Element    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessDutch}
    Input Text    ${trRowInBusinessProcessGrid}${divNewBusinessProcessRow} ${txtBusinessProcessDutch}    ${valueText}