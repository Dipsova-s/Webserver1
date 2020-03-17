*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Logout WC Then Close Browser
Force Tags        	acc_wc

*** Test Cases ***
User Uploads Only The Dashboard.json
    Search By Text    [Robot] Upload Dashboard Testing
    @{params}    Create List    upload_dashboard_testing.dashboard.json    EA2_800
    Upload Item    @{params}
    Wait Upload Items Successful
    Upload Item Report Should Show Failure
    Close Upload Item Report Popup

User Uploads Only The Dashboard.Angle.json
    [Tags]  acc_wc_aci
    ${angleName}    Set Variable    [Robot] Upload Dashboard Angle Testing
    Search By Text    ${angleName}
    @{params}    Create List    upload_dashboard_testing.dashboard.upload_dashboard_angle_testing.angle.json    EA2_800
    Upload Item    @{params}
    Wait Upload Items Successful
    Upload Item Report Should Not Show Failure
    Close Upload Item Report Popup
    Back To Search And Delete Angle Are Created    ${angleName}
