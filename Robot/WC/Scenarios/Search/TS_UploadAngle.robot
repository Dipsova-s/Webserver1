*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Upload Angle
    [Arguments]    ${angleJsonFilename}    ${angleName}    ${modelName}
    Search By Text    ${angleName}
    Click Search Action Upload Angles
    Select Model To Upload    ${modelName}
    Select Angle Json File    ${angleJsonFilename}
    Wait Upload Items Successful    ${angleName}