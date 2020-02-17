*** Settings ***
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Shared/MC_Comment.robot
Resource            ${EXECDIR}/WC/POM/ManagementConsole/Shared/MC_Utility.robot

*** Variables ***
${communicationsSettings}       css=#sideMenu-Models-EA2_800-Communications
${btnSaveCommunications}             css=.btnSave
${btnReloadCommunications}           css=.btnReload

${txtContact}            CompanyInformation_contact
${txtAddress}            CompanyInformation_address
${txtCity}               CompanyInformation_city
${txtCountry}            CompanyInformation_country
${txtTelephoneNumber}    CompanyInformation_telephone
${txtEmailAddress}       CompanyInformation_email

${txtMessageRecipientsAddEmail}    //div[@id='EmailSettings_ReOrderrecipients_addTag']/input
${txtMessageRecipients}     EmailSettings_ReOrderrecipients_tagsinput
${chkAttachLogfiles}       EmailSettings_attach_logfiles
${txtSendLogsFrequency}    EmailSettings_send_system_logs_frequency_hours
${txtSendLogsFrequencyInput}    //input[contains(@class,'k-formatted-value integer autosyncinput k-input' )]
${txtSendLogsFrequencyInputTxt}     //input[contains(@class,'k-formatted-value integer autosyncinput k-input' )]/../input[2]

${RemoveMessageRecipients}      xpath=//a[@title='Remove']
${btnAddCommentComm}        xpath=//a[@title='Add comment']
${contentSectionComment}    contentSectionComment
${txtCommentTextArea}      CommentText
${btnSaveComment}          SaveCommentBtn
${btnEditComment}          xpath=//a[@class='btn btnEdit']
${Email}
${EmailAddress}


*** Keywords ***
Wait Until Model Communications Settings Page Ready
    Wait Until Page Contains Element     ${txtSendLogsFrequencyInput}
    Wait MC Progress Bar Closed
    Wait Until Page Contains Element     ${btnReloadCommunications}

Click Save Communications
    Wait Until Element Is Visible    ${btnSaveCommunications}
    Click Element    ${btnSaveCommunications}
    Wait Until Model Communications Settings Page Ready

Click Reload Communications
    Wait Until Model Communications Settings Page Ready
    Sleep   2s
    Click Element    ${btnReloadCommunications}
    Wait Until Model Communications Settings Page Ready

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

Generate random string for email recepients
    ${EmailPrefix}=      Generate Random String      length=6
    ${RandomEmailValue}=    Catenate    ${EmailPrefix}@magnitude.com
    Set Global Variable     ${Email}    ${RandomEmailValue}
    [Return]     ${Email}

Input Communications Message Recipients
    ${EmailID}      Generate random string for email recepients
    Set Global Variable      ${EmailAddress}     ${EmailID}
    Input Text    ${txtMessageRecipientsAddEmail}    ${EmailAddress}
    Press Keys    ${txtMessageRecipientsAddEmail}    RETURN
   
Click Communications Attach Logfiles
    Wait Until Page Contains Element    ${chkAttachLogfiles}
    Click Element    ${chkAttachLogfiles}

Input Communications Send Logs Frequency
    [Arguments]    ${sendLogsFrequency}  
    Input kendo Numeric TextBox    ${txtSendLogsFrequency}    ${sendLogsFrequency}

Generate Random SLF non-default Value
    ${SLFRandomValue}       Generate Random String      1    [NUMBERS]
    [Return]     ${SLFRandomValue}

Input Communications Non default Send Logs frequency 
    [Arguments]     ${SLFRandomValue}
    Wait Until Page Contains Element    ${txtSendLogsFrequency}
    ${SLFdefault}       Get Value     ${txtSendLogsFrequency}
    Set Global Variable     ${SLFdefault}   ${SLFdefault}
    Input Communications Send Logs Frequency     ${SLFRandomValue}

Verify Communications Send Logs frequency
    [Arguments]     ${SLFRandomValue}
    ${SLFNew}       Get Kendo Value     ${txtSendLogsFrequency}
    Run Keyword If    ${SLFNew}!=${SLFRandomValue}
    ...     Log    Verified Successfully

Input Communications no value Send Logs frequency
    Wait Until Page Contains Element    ${txtSendLogsFrequency}
    Input Communications Send Logs Frequency     null

Verify Communications no value Send Logs frequency
    ${SLFNew}       Get Value     ${txtSendLogsFrequency}
    Run Keyword If    ${SLFNew}==0
    ...     Log    Saved without any error

#Read Values
Get the value from Contact field
    ${text}     Get Value   ${txtContact}
    [Return]      ${text}

Get the value from Address field
    ${text}     Get Value   ${txtAddress}
    [Return]      ${text}

Get the value from City field
    ${text}     Get Value   ${txtCity}
    [Return]      ${text}

Get the value from Country field
    ${text}     Get Value   ${txtCountry}
    [Return]      ${text}

Get the value from TelephoneNumber field
    ${text}     Get Value   ${txtTelephoneNumber}
    [Return]      ${text}

Get the value from emailAddress field
    ${text}     Get Value   ${txtEmailAddress}
    [Return]      ${text}

Get the Attach logfiles selected value
    ${chbox}    Is Element Checked  ${chkAttachLogfiles}
    [Return]      ${chbox}

Get the value from sendLogsFrequency field
    ${text}     Get Value   ${txtSendLogsFrequency}
    [Return]      ${text}

#Select 
Select the Attach logfiles check box
    [Arguments]     ${chbOption}
    Run Keyword If    ${chbOption} == True     Select Checkbox    ${chkAttachLogfiles}
    Run Keyword If    ${chbOption} == False     Unselect Checkbox    ${chkAttachLogfiles}

#Verify
Verify the edited content in contact field
    [Arguments]     ${text}
    Textfield value should be    ${txtContact}     ${text}

Verify the edited content in address field
    [Arguments]     ${text}
    Textfield value should be    ${txtAddress}     ${text}

Verify the edited content in city field
    [Arguments]     ${text}
    Textfield value should be    ${txtCity}     ${text}

Verify the edited content in country field
    [Arguments]     ${text}
    Textfield value should be    ${txtCountry}     ${text}

Verify the edited content in telephone Number field
    [Arguments]     ${text}
    Textfield value should be    ${txtTelephoneNumber}     ${text}

Verify the edited content in email Address field
    [Arguments]     ${text}
    Textfield value should be    ${txtEmailAddress}     ${text}

Verify the edited content in message Recipients field
    [Arguments]     ${text}
    sleep   2s
    Element Should Contain    ${txtMessageRecipients}     ${text}

Verify the edited content in send log frequency field
    [Arguments]     ${text}
    Textfield value should be    ${txtSendLogsFrequency}     ${text}

Remove added emailId in Message recipient field 
    Click Element       xpath=//div[@id='EmailSettings_ReOrderrecipients_tagsinput']//span[contains(text(), '${EmailAddress}')]//following-sibling::a