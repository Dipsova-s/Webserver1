*** Settings ***
Resource            ${EXECDIR}/WC/POM/Shared/EditDescriptionPopup.robot

*** Keywords ***
Add Or Edit Description
    [Arguments]  ${language}  ${name}  ${description}
    ${isSelected}  Is Language Selected  ${language}
    Run Keyword If  ${isSelected}==${False}  Click Add Language  ${language}
    ...    ELSE    Select Edit Language  ${language}
    Input Edit Name  ${name}
    Input Edit Description  ${description}

Check Edit Description ReadOnly Mode
    Check Languages Is ReadOnly Mode
    Check Name Is ReadOnly Mode
    Check Description Is ReadOnly Mode
    Check Id Is ReadOnly Mode

Add Or Edit ID
    [Arguments]  ${id} 
    Input ID    ${id} 