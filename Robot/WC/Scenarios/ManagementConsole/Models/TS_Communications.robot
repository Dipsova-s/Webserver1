*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Shared/MC_Comment.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Models/Communications.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Overview.robot

*** Keywords ***
Go To Communications Settings Page
    Go to MC Then Login With Admin User
    Click On EA2_800 Models Page
    Click On Communications Settings Page   

Read The Default Content From Input Fields

    ${value}   Get the value from Contact field
    Set Global Variable    ${contactDefValue}      ${value}

    ${value}   Get the value from Address field
    Set Global Variable    ${addressDefValue}      ${value}

    ${value}   Get the value from City field
    Set Global Variable    ${cityDefValue}      ${value}

    ${value}   Get the value from Country field
    Set Global Variable    ${countryDefValue}      ${value}

    ${value}   Get the value from TelephoneNumber field
    Set Global Variable    ${telephoneNoDefValue}      ${value}

    ${value}   Get the value from emailAddress field
    Set Global Variable    ${emailAddressDefValue}      ${value}

    ${value}    Get the Attach logfiles selected value
    Set Test Variable   ${attachLogfileDefValue}   ${value}

    ${value}   Get the value from sendLogsFrequency field
    Set Global Variable    ${sendLogsFrequencyDefValue}      ${value}

Edit The Content From Input Fields Under Communications

    Input Communications Contact    Magnitude

    Input Communications Address    Sarjapur Road

    Input Communications City       Bangalore

    Input Communications Country    India

    Input Communications Telephone Number   2027790

    Input Communications Email Address      vkulkarni@magnitude.com

    Input Communications Message Recipients

    Select the Attach logfiles check box    True

    Input Communications Send Logs Frequency    2

Verify Edited Content Under Communications

    Verify the edited content in contact field      Magnitude

    Verify the edited content in address field      Sarjapur Road

    Verify the edited content in city field         Bangalore

    Verify the edited content in country field      India

    Verify the edited content in telephone Number field      2027790

    Verify the edited content in email Address field    vkulkarni@magnitude.com

    Verify the edited content in message Recipients field   ${EmailAddress}

    ${returnText}   Get the Attach logfiles selected value
    Should Be True      ${returnText}

    Verify the edited content in send log frequency field   2

Restore content to old values

    Input Communications Contact    ${contactDefValue}

    Input Communications Address    ${addressDefValue}

    Input Communications City       ${cityDefValue}

    Input Communications Country    ${countryDefValue}

    Input Communications Telephone Number   ${telephoneNoDefValue}

    Input Communications Email Address      ${emailAddressDefValue}

    Remove added emailId in Message recipient field

    Select the Attach logfiles check box    ${attachLogfileDefValue}

    Input Communications Send Logs Frequency    ${sendLogsFrequencyDefValue}
 


