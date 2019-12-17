*** Variables ***
${btnSave}                   css=.btnSave
${btnCancelAddUser}                  css=.btnBack
${btnSelectAllAvailableUser}                   chkSelectAllAvaliableUser
${btnClearAllAvailableUser}                  chkClearAllAvaliableUser
${btnSelectAllSelectedUser}                   chkSelectAllSelectedUser
${btnClearAllSelectedUser}                  chkClearAllSelectedUser
${btnAddUser}                   btnImportNewUser
${btnRemoveUser}                  btnRemovedSelectedUser
${spinnerAvailableGrid}    css=#AvailableUserGrid > div.k-loading-mask
${spinnerSelectedUserGrid}    css=#SelectedUserGrid > div.k-loading-mask
${btnLoadingCloseReport}                jquery=#LoaderContainer .loader-cancel-button:visible




*** Keywords ***
Wait Until Add Users Page Loaded
    Wait MC Progress Bar Closed
    Wait Until Page Contains    Add users
    Wait Until Page Does Not Contain    ${spinnerAvailableGrid}
    Sleep    ${TIMEOUT_GENERAL}


Click Select All Available Users
    Wait Until Page Contains Element    ${btnSelectAllAvailableUser}
    Click Element    ${btnSelectAllAvailableUser}

Click DeSelect All Available User
    Wait Until Page Contains Element    ${btnClearAllAvailableUser}
    Click Element    ${btnClearAllAvailableUser}

Click Select All Selected Users
    Wait Until Page Contains Element    ${btnSelectAllSelectedUser}
    Click Element    ${btnSelectAllSelectedUser}

Click DeSelect All Selected User
    Wait Until Page Contains Element    ${btnClearAllSelectedUser}
    Click Element    ${btnClearAllSelectedUser}

Click Add Selected Users
    Click Element    ${btnAddUser}

Click Remove Selected Users
    Click Element    ${btnRemoveUser}

Click Select First Available User
    Execute JavaScript    $("#AvailableUserGrid tbody input:checkbox:enabled:lt(1)").click();

Get First Available Username
    ${username}    Execute JavaScript    return $("#AvailableUserGrid tbody input:checkbox:enabled:lt(1)").closest('tr').find('td:lt(2)').text().trim();
    [Return]    ${username}

Click Save Add User
    Wait Until Element Is Visible    ${btnSave}
    Click Element    ${btnSave}
    Wait Until Page Contains    Add users report
    Click Element    ${btnLoadingCloseReport}


Click Cancel Button on Add User Page
    Click Element    ${btnCancelAddUser}



