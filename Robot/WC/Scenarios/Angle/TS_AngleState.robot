*** Settings ***
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePublishingPopup.robot
Resource    		${EXECDIR}/WC/POM/Angle/AngleValidatingPopup.robot

*** Keywords ***
Set Angle To Not Allow User To Obtain More Details
    Open Angle Publishing Popup
    Click Do Not Allow User To Obtain More Details
    Click Save Angle Publish Settings

Set Angle To Allow User To Obtain More Details
    Open Angle Publishing Popup
    Click Allow User To Obtain More Details
    Click Save Angle Publish Settings

Publish Angle
    Open Angle Publishing Popup
   
    Click Publish Angle

Unpublish Angle
    Open Angle Publishing Popup
    Click Unpublish Angle

Validate Angle
    Open Angle Validating Popup
    Click Validate Angle

Unvalidate Angle
    Open Angle Validating Popup
    Click Unvalidate Angle

Verify All Display Are Published
    Open Angle Publishing Popup
    Check All Display Are Checked
    Close Publish Angle Popup

Add Label To The Angle
    [Arguments]     ${labelCatName}   ${labelNameValue}
    Click Plus Icon To Add Label     ${labelCatName}
    Select Label To Add      ${labelNameValue}
