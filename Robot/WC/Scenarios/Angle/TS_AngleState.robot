*** Settings ***
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePublishingPopup.robot
Resource    		${EXECDIR}/WC/POM/Angle/AngleValidatingPopup.robot

*** Keywords ***
Set Angle To Not Allow User To Obtain More Details
    Open Angle Publishing Popup
    Click Do Not Allow User To Obtain More Details
    Click Save Angle Publish Settings
    Do Not Allow Users to Obtain More Details Is Checked

Set Angle To Allow User To Obtain More Details
    Open Angle Publishing Popup
    Click Allow User To Obtain More Details
    Click Save Angle Publish Settings
    Do Not Allow Users to Obtain More Details Is Unchecked

Set Angle To Not Allow User To Go To Related Objects Via The Jumps
    Open Angle Publishing Popup
    Click Do Not Allow Users To Go To Related Objects Via The Jumps
    Click Save Angle Publish Settings
    Do Not Allow Users To Go To Related Objects Via The Jumps Is Checked

Set Angle To Allow User To Go To Related Objects Via The Jumps
    Open Angle Publishing Popup
    Click Allow Users To Go To Related Objects Via The Jumps
    Click Save Angle Publish Settings
    Do Not Allow Users To Go To Related Objects Via The Jumps Is Checked

Publish Angle
    Open Angle Publishing Popup
    Click Publish Angle    
    Check Angle Is Published
    Wait Display Executed

Unpublish Angle
    Open Angle Publishing Popup
    Click Unpublish Angle
    Check Angle Is Unpublished
    Wait Display Executed

Validate Angle
    Open Angle Validating Popup
    Click Validate Angle    
    Check Angle Is Validated
    Wait Display Executed

Unvalidate Angle
    Open Angle Validating Popup
    Click Unvalidate Angle
    Check Angle Is Unvalidated
    Wait Display Executed

Verify Angle Publishing Confirmation
    Click Display Tab
    Select Checkbox Execute On Login
    Angle Publishing Should Get A Confirmation Popup
    Unselect Checkbox Execute On Login

Verify All Display Are Published
    Open Angle Publishing Popup
    Check All Display Are Checked
    Close Publish Angle Popup

Verify Set Angle To Template
    [Arguments]    ${angleName}
    Click Set Angle To Template
    Check Template Icon Is Visible
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Search Filter Template
    Unselect Search Filter Template
    Check Existing Angle From Search Result    ${angleName}

Verify Set Template To Angle
    [Arguments]    ${angleName}
    Execute First Search Item In Edit Mode
    Click Set Template To Angle
    Back To Search
    Search By Text And Expect In Search Result    ${angleName}
    Click Search Filter Angle
    Check Existing Angle From Search Result    ${angleName}
    
Set Angle To Template
    Click Set To Template

Set Template To Angle    
    Click Set To Template
