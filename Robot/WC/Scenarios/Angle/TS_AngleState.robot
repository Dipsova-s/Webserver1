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