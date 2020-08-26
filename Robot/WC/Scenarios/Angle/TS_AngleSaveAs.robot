*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot

*** Keywords ***
Verify EAPower: Save Buttons Privilege
    Main Save Button Should Be Enable
    Main Save Button Is Save Angle
    Save All Button Should Not Be Available
    Save Angle Button Should Not Be Available
    Save Display Button Should Not Be Available
    Save Angle As Button Should Not Be Available
    Save Display As Button Should Be Enable

Verify EAViewer: Save Buttons Privilege
    [Arguments]  ${angleName}
    Go to WC Then Login With EAViewer User
	Search Angle From Search Page And Execute Angle    ${angleName}
    Main Save Button Should Be Enable
    Main Save Button Is Save Display As
    Save All Button Should Not Be Available
    Save Angle Button Should Not Be Available
    Save Display Button Should Not Be Available
    Save Angle As Button Should Not Be Available
    Save Display As Button Should Not Be Available
    Logout WC Then Close Browser
    Switch Browser  1

Verify EABasic: Save Buttons Privilege
    [Arguments]  ${angleName}
    Go to WC Then Login With EABasic User
    Search Angle From Search Page And Execute Angle    ${angleName}
    Main Save Button Should Not Be Available
    Logout WC Then Close Browser
    Switch Browser  1

Verify Save Angle As
    [Arguments]  ${angleName}
    Click Save Angle As
    Name Should Append Copy Text In Save Angle As Popup
    Input Name In Save Angle As Popup  ${angleName}
    Save Angle As

Prepare Template For Save Display As
    [Arguments]  ${angleName}
    Click Set Angle to Template
    Go to Search Page
    Search Angle From Search Page And Execute Angle    ${angleName}

Verify Angle: Save Display As Without Add To New Angle Option
    [Arguments]  ${displayName}
    Click Save Display As
    Select Add To New Angle Checkbox
    Name Should Not Append Copy Text In Save Display As Popup
    Angle Name Should Append Copy Text In Save Display As Popup
    Unselect Add To New Angle Checkbox
    Input Name In Save Display As Popup  ${displayName}
    Save Display As

Verify Template: Save Display As With Add To New Angle Option
    [Arguments]  ${angleName}
    Click Save Display As
    Add To New Angle Checkbox Should Be Selected
    Add To New Angle Checkbox Should Be Disabled
    Save Display As Popup Should Contain A Warning
    Name Should Not Append Copy Text In Save Display As Popup
    Angle Name Should Not Append Copy Text In Save Display As Popup
    Input Angle Name In Save Display As Popup  ${angleName}
    Save Display As

Verify EAPower: Set To Template Buttons Privilege
    Check Template Icon Is Not Visible
    Set To Template Buttom Should Be Enable 

Verify EAViewer: Set To Template Buttons Privilege
    [Arguments]    ${angleName}
    Go to WC Then Login With EAViewer User
	Search Angle From Search Page And Execute Angle    ${angleName}
    Set To Template Button Should Not Available
    Logout WC Then Close Browser
    Switch Browser  1

