*** Settings ***
Resource            ${EXECDIR}/resources/WCSettings.robot
Suite Setup         Go to WC Then Login With EAPower User
Suite Teardown      Close Browser
Test Teardown       Go to Search Page
Test Template    	Search Business Process
Force Tags        	acc_wc  acc_wc_aci


*** Test Cases ***                                  Name
Search Angle By Filter Business Process P2P         P2P
    [Tags]      TC_C143823
Search Angle By Filter Business Process S2D         S2D
    [Tags]      TC_C143823      TC_C231150
Search Angle By Filter Business Process O2C         O2C
    [Tags]      TC_C143823
Search Angle By Filter Business Process F2R         F2R
    [Tags]      TC_C143823
Search Angle By Filter Business Process PM          PM
    [Tags]      TC_C143823
Search Angle By Filter Business Process QM          QM
    [Tags]      TC_C143823
Search Angle By Filter Business Process HCM         HCM
    [Tags]      TC_C143823
Search Angle By Filter Business Process GRC         GRC
    [Tags]      TC_C143823
Search Angle By Filter Business Process IT          IT
    [Tags]      TC_C143823