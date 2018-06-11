*** Variables ***
${btnSaveEditRole}      css=.btnSave
${btnCancelEditRole}    css=.btnBack

${roleId}               Id
${roleDescription}      Description

${tabPrivileges}        WebClient
${tabLabels}            Labels
${tabObjects}           Objects
${tabFields}            Fields
${tabFilters}           Filter
${tabSubroles}          SubRoles

${mainContent}          mainContent

*** Keywords ***
Wait Edit Role Page Loaded
    Wait Until Page Contains    Access to client functionality    ${TIMEOUT_MC_LOAD}
    Wait MC Progress Bar Closed
    Sleep    ${TIMEOUT_GENERAL}
    Wait Until Ajax Complete

Click Save Edit Role
    Wait Until Element Is Visible    ${btnSaveEditRole}
    Click Element    ${btnSaveEditRole}
    Wait MC Progress Bar Closed
    Wait Until Ajax Complete

Click Cancel Edit Role
    Wait Until Element Is Visible    ${btnCancelEditRole}
    Click Element    ${btnCancelEditRole}
    Wait MC Progress Bar Closed


Click Privileges Tab
    Wait Until Element Is Visible    ${tabPrivileges}
    Click Element    ${tabPrivileges}

Click Lebels Tab
    Wait Until Element Is Visible    ${tabLabels}
    Click Element    ${tabLabels}

Click Objects Tab
    Wait Until Element Is Visible    ${tabObjects}
    Click Element    ${tabObjects}

Click Fields Tab
    Wait Until Element Is Visible    ${tabFields}
    Click Element    ${tabFields}

Click Filters Tab
    Wait Until Element Is Visible    ${tabFilters}
    Click Element    ${tabFilters}

Click Subroles Tab
    Wait Until Element Is Visible    ${tabSubroles}
    Click Element    ${tabSubroles}

