*** Settings ***
Resource            ${EXECDIR}/WC/POM/Search/SearchPage.robot

*** Keywords ***
Upload Item
    [Arguments]    ${filename}    ${modelName}
    Click Search Action Upload Angles
    Select Model To Upload    ${modelName}
    Select Upload Item File    ${filename}
    Wait Upload Items Successful

Upload Item And Check From Search Result
    [Arguments]    ${filename}    ${modelName}    ${itemName}  
    Search By Text    ${itemName}
    Upload Item    ${filename}    ${modelName}
    Close Upload Item Report Popup
    Check Existing Angle From Search Result    ${itemName}
    