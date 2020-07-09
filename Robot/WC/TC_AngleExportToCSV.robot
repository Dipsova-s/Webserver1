*** Settings ***
Resource    		${EXECDIR}/resources/WCSettings.robot
Suite Setup         Initialize Download Path And Login With Admin User
Suite Teardown      Logout WC Then Close Browser
Test Teardown       Run Keywords  Empty Download Directory  AND  Go to Search Page
Force Tags        	acc_wc

*** Test Cases ***
Verify Default CSV Datastores Values in Export Pop Up
    [Documentation]     This Test Verifies Default CSV Datastores Values in Export to CSV Pop Up.
    [Tags]  acc_wc_aci
    ${angleName}  Set Variable  ANGLE_Pivot_fields_contain_special_characters    
    Search Angle From Search Page And Execute Angle    ${angleName}
    Wait Progress Bar Closed
    Check If Angle Or Display Has A Warning Then Close The Popup
    Wait Progress Bar Closed
    ${modelDateTimeStamp}   Get Model Date Time
    ${formattedmodelDateTimeStamp}     Get Formatted Date Time Stamp   ${modelDateTimeStamp}   %Y%m%d%H%M%S
    Click Angle Dropdown To Export CSV
    Wait Progress Bar Closed
    Check Default CSV Datastore values in Export to CSV
    Click Export CSV Button
    Wait Until Keyword Succeeds    1 min    2 sec    Download Should Be Done
    Wait Until Export CSV Popup Close
    Download Should Contain File   ${formattedmodelDateTimeStamp}${angleName}.csv