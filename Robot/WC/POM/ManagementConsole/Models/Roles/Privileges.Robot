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