*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Shared/About.robot
*** Keywords ***
Verify Copyright
    Open About Popup
    Open Copyright Page
    Select Window    NEW
    Wait Until License and Copyright Loaded
    ${licenseCount}    Get Number of License    
    Should Be True    ${licenseCount}>2
    SELECT WINDOW    MAIN
   