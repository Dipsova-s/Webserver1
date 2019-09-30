*** Variables ***
${divManageUser}                    jquery=#UserInRolePopup
${ddlProviderTypes}                 .contentSectionInfoItem .k-widget
${txtFilterAvaliableUser}           css=#FilterGridAvaliableUser
${divAvailableUserGrid}             jquery=#GridAvaliableUser tbody tr
${chkAvailableUser}                 td:eq(0)
${btnAllAvaliableUser}              css=#chkSelectAllAvaliableUser

${btnAddUserInRole}                 css=#btnAddUserInRole
${btnRemoveUserInRole}              css=#btnRemoveUserInRole

${divSelectedUserGrid}              jquery=#GridSelectedUser tbody tr
${txtFilterSelectedUser}            css=#FilterGridSelectedUser
${btnAllSelectedUser}               css=#chkSelectAllSelectedUser
${btnConfirmSelected}               jquery=#UserInRolePopup .btnPrimary

${btnClosePopUpStatus}              jquery=#UserInRoleReportPopup .btnPrimary
${spinnerManageUser}     css=#UserInRolePopup > div.k-loading-mask

*** Keywords ***
Filter Available User By Keyword
    [Arguments]    ${keyword}
    Input Text    ${txtFilterAvaliableUser}    ${keyword}
    Sleep    2s
    Wait Until Ajax Complete
	Wait Until Page Does Not Contain Element    ${spinnerManageUser}

Click Select All Available User
    Wait Until Page Contains Element    ${btnAllAvaliableUser}
    Click Element    ${btnAllAvaliableUser}
    Sleep    ${TIMEOUT_LARGEST}

Click Add User To Right Side
    Click Element    ${btnAddUserInRole}
    Wait Until Ajax Complete
    Sleep    2s

Verify Filter Selected User By Keyword
    [Arguments]    ${keyword}
    Input Text    ${txtFilterSelectedUser}    ${keyword}
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${divSelectedUserGrid}:contains(${keyword})

Clear Filter Selected User
    Clear Element Text    ${txtFilterSelectedUser}
    Press Keys    ${txtFilterSelectedUser}    RETURN
    Wait Until Ajax Complete

Click Confirm Selected User To Role
    Wait Until Element Is Visible    ${btnConfirmSelected}
    Click Element    ${btnConfirmSelected}
    Wait Until Ajax Complete
    Click Close Pop Result
    Wait MC Progress Bar Closed

Click Close Pop Result
    ${checkText}    Execute JavaScript    return $('.pageSystemRoles').length ? 'All system roles' : 'All available roles'
    Wait Until Element Is Visible    ${btnClosePopUpStatus}
    Click Element    ${btnClosePopUpStatus}
    Wait MC Progress Bar Closed
    Wait Until Page Contains   ${checkText}