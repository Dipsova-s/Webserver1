*** Variables ***
${btnSubmitFilter}              css=#btn-popupListFilter1
${btnCancelFilter}              css=#btn-popupListFilter0
${ddOperatorDropdownList}       css=#Operator-0-DropdownList_ddlWrapper

*** Keywords ***
Open Operator Dropdown List
    Wait Until Page Contains Element    ${ddOperatorDropdownList}
    Click Element    ${ddOperatorDropdownList}
    Sleep    ${TIMEOUT_DROPDOWN}

Close Operator Dropdown List
    Click Element    ${ddOperatorDropdownList}
    Sleep    ${TIMEOUT_DROPDOWN}

Choose Dropdown Filter Operator Via Add Filter Popup
    [Arguments]   ${selectText}
    Choose Dropdown Filter Operator    0    ${selectText}

#Percentage
Input Filter Input Percentage Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Percentage    0    ${expect}

Input Filter Input Percentage Between Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Percentage Between    0    ${expect}

Input Filter Input Period Not Between Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Period Not Between    0    ${expect}

Verify All Operators Of Percentage
    Open Operator Dropdown List
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is smaller than
    Wait Until Page Contains    is greater than
    Wait Until Page Contains    is smaller than or equal to
    Wait Until Page Contains    is greater than or equal to
    Wait Until Page Contains    is between
    Wait Until Page Contains    is not between
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Close Operator Dropdown List

#Currency
Verify All Operators Of Currency
    Open Operator Dropdown List
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is smaller than
    Wait Until Page Contains    is greater than
    Wait Until Page Contains    is smaller than or equal to
    Wait Until Page Contains    is greater than or equal to
    Wait Until Page Contains    is between
    Wait Until Page Contains    is not between
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Close Operator Dropdown List

Input Filter Input Currency Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Currency    0    ${expect}

Input Filter Input Currency Between Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Currency Between    0    ${expect}

Input Filter Input Is In List Currency Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Currency Is In List    0    ${expect}


#Number
Input First Input Number Via Add Filter Popup
    [Arguments]   ${expect}
    Input First Input Number    0    ${expect}

Input Second Input Number Via Add Filter Popup
    [Arguments]   ${expect}
    Input Second Input Number    0    ${expect}

Input Filter Input Number Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Number    0    ${expect}

Verify All Operators Of Number
    Open Operator Dropdown List
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is smaller than
    Wait Until Page Contains    is greater than
    Wait Until Page Contains    is smaller than or equal to
    Wait Until Page Contains    is greater than or equal to
    Wait Until Page Contains    is between
    Wait Until Page Contains    is not between
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Close Operator Dropdown List

#Date
Input First Input Date Picker Via Add Filter Popup
    [Arguments]   ${expect}
    Input First Input Date Picker    0    ${expect}

Input Selected Value Date Picker Via Add Filter Popup
    [Arguments]   ${expect}
    Input Selected Value Date Picker    0    ${expect}

Remove And Add Filter Angle Type Date Via Add Filter Popup
    [Arguments]  ${expect}
    Remove And Add Filter Angle Type Date    0    ${expect}

Verify All Operators Of Date
    Open Operator Dropdown List
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is before
    Wait Until Page Contains    is after
    Wait Until Page Contains    is between
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is before or on
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Wait Until Page Contains    is not between
    Close Operator Dropdown List

#Datetime
Input First Input Datetime Picker Via Add Filter Popup
    [Arguments]   ${expect}
    Input First Input Datetime Picker    0    ${expect}

Input First Input Time Picker Via Add Filter Popup
    [Arguments]   ${expect}
    Input First Input Time Picker    0    ${expect}

Verify All Operators Of DateTime
    Open Operator Dropdown List
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is before
    Wait Until Page Contains    is after
    Wait Until Page Contains    is between
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is before or on
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Wait Until Page Contains    is not between
    Close Operator Dropdown List

#Text
Input Filter Input Text In List Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Text In List    0    ${expect}

Input Filter Input Short Name In List Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Short Name In List    0    ${expect}

Input Filter Input Text Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Input Text    0    ${expect}

Verify All Operators Of Text
    Open Operator Dropdown List
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is smaller than
    Wait Until Page Contains    is greater than
    Wait Until Page Contains    is smaller than or equal to
    Wait Until Page Contains    is greater than or equal to
    Wait Until Page Contains    is between
    Wait Until Page Contains    is not between
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Wait Until Page Contains    contains substring(s)
    Wait Until Page Contains    does not contain substring(s)
    Wait Until Page Contains    starts with substring(s)
    Wait Until Page Contains    does not start with substring(s)
    Wait Until Page Contains    ends on substring(s)
    Wait Until Page Contains    does not end on substring(s)
    Wait Until Page Contains    matches pattern(s)
    Close Operator Dropdown List

#Boolean
Click Filter Choice Yes Via Add Filter Popup
    Click Filter Choice Yes    0

Click Filter Choice No Via Add Filter Popup
    Click Filter Choice No    0

Verify All Operators Of Boolean
    Open Operator Dropdown List
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is not equal to
    Close Operator Dropdown List

#Enum
Input Filter Set Is In List Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Set Is In List    0    ${expect}

Input Filter Set Select Value Via Add Filter Popup
    [Arguments]   ${expect}
    Input Filter Set Select Value    0    ${expect}

Verify All Operators Of Enumerated
    Open Operator Dropdown List
    Wait Until Page Contains    is not empty
    Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
    Wait Until Page Contains    is not equal to
    Wait Until Page Contains    short name contains substring(s)
    Wait Until Page Contains    short name starts with substring(s)
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Wait Until Page Contains    matches pattern(s)
    Close Operator Dropdown List

Click OK Add Filter to List
    Click Element    ${btnSubmitFilter}
    Wait Progress Bar Closed
    Wait Until List Display Loaded
    Sleep    ${TIMEOUT_GENERAL}

Click Cancel Add Filter to list
    Click Element     ${btnCancelFilter}

#Time
Verify All Operators Of Time
    Open Operator Dropdown List
	Wait Until Page Contains    is not empty
	Wait Until Page Contains    is empty
    Wait Until Page Contains    is equal to
	Wait Until Page Contains    is not equal to
    Wait Until Page Contains    is before
    Wait Until Page Contains    is after
	Wait Until Page Contains    is before or on
	Wait Until Page Contains    is after or on
    Wait Until Page Contains    is between
    Wait Until Page Contains    is not between
    Wait Until Page Contains    is in list
    Wait Until Page Contains    is not in list
    Close Operator Dropdown List