*** Variables ***
${rdoExportDatalAllow}                   jquery=input[name=AllowExport][value=True]
${rdoExportDataDeny}                    jquery=input[name=AllowExport][value=False]
${rdoExportDataUndefined}               jquery=input[name=AllowExport][value=Undefined]

${rdoManageModelAllow}                   jquery=input[name=ManageModel][value=True]
${rdoManageModelDeny}                    jquery=input[name=ManageModel][value=False]
${rdoManageModelUndefined}               jquery=input[name=ManageModel][value=Undefined]

${rdoManagePrivilegeItemAllow}                   jquery=input[name=manage_private_items][value=True]
${rdoManagePrivilegeItemDeny}                    jquery=input[name=manage_private_items][value=False]
${rdoManagePrivilegeItemUndefined}               jquery=input[name=manage_private_items][value=Undefined]

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

