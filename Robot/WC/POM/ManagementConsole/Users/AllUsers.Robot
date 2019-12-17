*** Variables ***
${trRowInAllUserGrid}                   jquery=#AllUsersGridContainer tbody tr
${btnEditUser}                        .btnGroupContainer>.btn
${btnActionEditUser}                  .btnGroupInner .btnEdit
${btnActionShowConsolidateRoleForUser}       .btnGroupInner .btnOpenWindow
${btnActionDeleteUser}                .btnGroupInner .btnDelete
${btnOk}                css=#popupConfirmation > div > a.btn.btnPrimary.btnSubmit

#Add new user variables
${btnAddUsers}                btnAddUsers
${btnSelectedAuthenticationProvider}                     css=#popupSystemProvider .btnSubmit
${btnCancelAuthenticationProvider}                   css=#popupSystemProvider .btnClose
${ddlAuthenticationProvider}    css=.k-dropdown[aria-owns=systemProvider_listbox]
${spinnerAuthenticationProvider}     css=#popupSystemProvider > div.k-loading-mask


${txtUserFilter}                  css=.gridToolbarFilter input

${pgbFilterLoading}                 .iconLoading

*** Keywords ***
Wait Until All Users Page Ready
    Wait Until Page Contains    Add users
    Wait Until Page Contains Element     ${btnAddUsers}
    Wait MC Progress Bar Closed

Click Action On User By Index
    [Arguments]    ${index}
    Click Show Action Dropdown In Grid By Index    ${index}    ${trRowInAllUserGrid}
    Wait Until Page Contains   Edit
    Wait Until Page Contains   Show consolidated role
    Wait Until Page Contains   Delete

Click Edit User Action By User Name
    [Arguments]    ${userName}
    Wait Until Page Contains Element    ${trRowInAllUserGrid}
    Wait MC Progress Bar Closed
    Filter User List By Username    ${userName}
    Click Action In Grid By Name     ${userName}    ${trRowInAllUserGrid}    ${btnEditUser}
    Wait MC Progress Bar Closed
    Wait Until Page Contains   Add role
    Wait Until Page Contains   Authentication
    Wait Until Page Contains   Default Business Processes

Click Edit User Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInAllUserGrid}    ${btnActionEditUser}
    Wait Until Page Contains   Add role
    Wait Until Page Contains   Authentication
    Wait Until Page Contains   Default Business Processes

Click Show Consolidate Role Action For User By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInAllUserGrid}    ${btnActionShowConsolidateRoleForUser}

Click Delete User Action By Index
    [Arguments]    ${index}
    Click Action In Grid By Index     ${index}    ${trRowInAllUserGrid}    ${btnActionDeleteUser}
    Click Element    ${btnOk}

Filter User List By Username
    [Arguments]    ${userName}
    Wait Until Page Contains Element    ${txtUserFilter}
    Input Text    ${txtUserFilter}    ${userName}
    Wait Until Page Does Not Contain    ${pgbFilterLoading}
    Wait Until Ajax Complete
    Wait MC Progress Bar Closed

#Add new user section
Click Add User Popup
    Wait Until Page Contains Element    ${btnAddUsers}
    Click Element    ${btnAddUsers}
    Wait Until Page Contains Element    ${ddlAuthenticationProvider}


Choose Provider Dropdown List
    [Arguments]    ${provider}
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete
    Wait Until Page Contains Element    ${ddlAuthenticationProvider}
    Wait Until Page Does Not Contain    ${spinnerAuthenticationProvider}
    Select Dropdown By InnerText    ${ddlAuthenticationProvider}    ${provider}
    Click Element    ${btnSelectedAuthenticationProvider}


