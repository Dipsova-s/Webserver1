*** Settings ***
Resource    		${EXECDIR}/WC/POM/Shared/UserPassword.robot

*** Keywords ***
Open User Change Password Popup
    Wait Progress Bar Closed
    Wait Until Page Contains Element    ${btnUserMenu}
    Wait Until Element Is Visible       ${btnUserMenu}
    Click User Menu
    Click Change Password on User Menu
    Wait Until Page Contains Element    ${inputOldPassword}
    Wait Until Page Contains Element    ${inputNewPassword}
    Wait Until Page Contains Element    ${inputComparedPassword}
