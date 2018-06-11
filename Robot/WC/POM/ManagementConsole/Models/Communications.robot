*** Variables ***
${btnSaveCommunications}             css=.btnSave

${txtContact}            CompanyInformation_contact
${txtAddress}            CompanyInformation_address
${txtCity}               CompanyInformation_city
${txtCountry}            CompanyInformation_country
${txtTelephoneNumber}    CompanyInformation_telephone
${txtEmailAddress}       CompanyInformation_email

${txtMessageRecipients}    EmailSettings_ReOrderrecipients_tagsinput
${chkAttachLogfiles}       EmailSettings_attach_logfiles

*** Keywords ***
Click Save Communications
    Wait Until Element Is Visible    ${btnSaveCommunications}
    Click Element    ${btnSaveCommunications}
    Wait MC Progress Bar Closed

Input Communications Contact
    [Arguments]    ${contact}
    Input Text    ${txtContact}    ${contact}

Input Communications Address
    [Arguments]    ${address}
    Input Text    ${txtAddress}    ${address}

Input Communications City
    [Arguments]    ${city}
    Input Text    ${txtCity}    ${city}

Input Communications Country
    [Arguments]    ${country}
    Input Text    ${txtCountry}    ${country}

Input Communications Telephone Number
    [Arguments]    ${telephoneNumber}
    Input Text    ${txtTelephoneNumber}    ${telephoneNumber}

Input Communications Email Address
    [Arguments]    ${emailAddress}
    Input Text    ${txtEmailAddress}    ${emailAddress}

Input Communications Message Recipients
    [Arguments]    ${messageRecipient}
    Input Text    ${txtMessageRecipients}    ${messageRecipient}

Click Communications Attach Logfiles
    Wait Until Page Contains Element    ${attachLogfile}
    Click Element    ${attachLogfile}
