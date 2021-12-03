*** Variables ***
${rdoExportDatalAllow}                  jquery=input[name=AllowExport][value=True]
${rdoExportDataDeny}                    jquery=input[name=AllowExport][value=False]
${rdoExportDataUndefined}               jquery=input[name=AllowExport][value=Undefined]

${rdoManageModelAllow}                   jquery=input[name=ManageModel][value=True]
${rdoManageModelDeny}                    jquery=input[name=ManageModel][value=False]
${rdoManageModelUndefined}               jquery=input[name=ManageModel][value=Undefined]

${rdoManagePrivilegeItemAllow}           jquery=input[name=manage_private_items][value=True]
${rdoManagePrivilegeItemDeny}            jquery=input[name=manage_private_items][value=False]
${rdoManagePrivilegeItemUndefined}       jquery=input[name=manage_private_items][value=Undefined]

${btnConfigure}                         xpath=//label[contains(text(),'Content')]/..//span[text()='Configure']/../input[@value='Configure']
${btnEdit}                              xpath=//label[contains(text(),'Content')]/..//span[text()='Edit']/../input[@value='Edit']
${btnDeny}                              xpath=//label[contains(text(),'Content')]/..//span[text()='Deny']/../input[@value='Deny']
${btnUndefined}                         xpath=//label[contains(text(),'Content')]/..//span[text()='Undefined']/../input[@value='Undefined']

#Show consolidated role pop up 
${flagmodelprivileges}                  xpath=//span[contains(text(),'Model privilege')]/../span
${flagPrivileges}                       xpath=//span[contains(text(),'Privileges')]/../span
${showConsolidatedPopUp}                xpath=//div[@id='ConsoliDatedRolePopup']
${sectionPrivileges}                    xpath=//span[contains(text(),'Privileges')]//parent::div/..
${sectionModelingWorkbench}             xpath=//span[contains(text(),'Modeling Workbench')]
${btnOkShowConsolidateRolePopUp}        xpath=//div[@id='ConsoliDatedRolePopup']/div[2]/a[contains(text(),'OK')]
${btnCloseShowConsolidateRolePopup}     xpath=//span[@id='ConsoliDatedRolePopup_wnd_title']/..//div/a[@class='k-button k-flat k-button-icon k-window-action']/span[@title='Close']

*** Keywords ***
Click Deny Exprot Data
    Wait Until Page Contains Element    ${rdoExportDataDeny}
    Click Element    ${rdoExportDataDeny}

Click Deny Manage Model
    Wait Until Page Contains Element    ${rdoManageModelDeny}
    Click Element    ${rdoManageModelDeny}

Click Deny Manage Privilege Item
    Wait Until Page Contains Element    ${rdoManagePrivilegeItemDeny}
    Click Element    ${rdoManagePrivilegeItemDeny}

Select Radio Button Modeling Workbench Content
    [Arguments]     ${value}
    Select Radio Button  ModelingWorkBenchContent  ${value}

Radio Modeling Workbench Content Button Should Be Set To
    [Arguments]     ${value}
    Radio Button Should Be Set To  ModelingWorkBenchContent  ${value}

Close Show Consolidate Role Popup
    Wait Until Element Is Visible    ${btnOkShowConsolidateRolePopUp}
    Click Element    ${btnOkShowConsolidateRolePopUp}

Expand Model Privileges Flag In Show Consolidated Role Pop Up
    Wait Until Page Contains Element    ${flagmodelprivileges}
    Click Element    ${flagmodelprivileges}

Expand Privileges Flag In Show Consolidated Role Pop Up
    Wait Until Page Contains Element    ${flagPrivileges}
    Click Element    ${flagPrivileges}