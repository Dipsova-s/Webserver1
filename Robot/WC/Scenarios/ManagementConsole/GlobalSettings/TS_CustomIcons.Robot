*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/GlobalSettings/CustomIcons.robot

*** Keywords ***
Go To Custom Icons Page
    Go To MC Page    /Global%20settings/Custom%20icons/
    Wait Until Custom Icons Page Loaded

Add New Custom Icons And Save
    [Arguments]    ${fieldType}
    ${chkIconExist}    Is Element Visible    ${trRowInCustomIconsGrid}:contains(${fieldType})
    Run Keyword If    ${chkIconExist} == True    Delete Adding Custom Icons    ${fieldType}
    Add New Custom Icons    ${fieldType}

Add New Custom Icons
    [Arguments]    ${fieldType}
    Click Add New Icon
    Add Custom Icons Field Type    ${fieldType}
    Add Custom Icons File Size 16
    Add Custom Icons File Size 32
    Click Save Custom Icons

Verify Custom Icons Were Uploaded
    [Arguments]    ${fieldType}
    Wait Custom Icons By Field Type    ${fieldType}
    Sleep    ${TIMEOUT_GENERAL}
    ${image16Exist}    Is Image Exist    css=#row-${fieldType} .preview16
    Should Be True    ${image16Exist}
    ${image32Exist}    Is Image Exist    css=#row-${fieldType} .preview32
    Should Be True    ${image32Exist}

Delete Adding Custom Icons
    [Arguments]    ${fieldType}
    Click Delete Custom Icons Action By Field Name    ${fieldType}
    Click Save Custom Icons With Delete Exist Icons