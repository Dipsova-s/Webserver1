*** Variables ***
${btnSaveUserDefaults}                                   css=.btnSave
${divDefaultSettingForBusinessProcessBar}                jquery=.businessProcesses

${dpdDecimalSeparator}      //span[@aria-owns='GeneralDecimalSeperatorDropdown_listbox']/span/span
${dpdThousandsSeparator}        //span[@aria-owns='GeneralThousandSeperatorDropdown_listbox']/span/span
${dpdDateOrder}     //span[@aria-owns='DateOrderDropdown_listbox']/span/span
${dpdDayFormat}     //span[@aria-owns='DateDayDropdown_listbox']/span/span
${dpdMonthFormat}       //span[@aria-owns='DateMonthDropdown_listbox']/span/span
${dpdYearFormat}        //span[@aria-owns='DateYearDropdown_listbox']/span/span
${dpdDateSeparator}     //span[@aria-owns='DateSeparatorDropdown_listbox']/span/span
${dpdTimeFormat}     //span[@aria-owns='TimeHourFormatDropdown_listbox']/span/span
${dpdTimeSeparator}     //span[@aria-owns='TimeSeparatorDropdown_listbox']/span/span
${dpdDefaultLanguage}       //span[@aria-owns='DefaultLanguages_listbox']/span/span
${dpdDefaultCurrency}       //span[@aria-owns='DefaultCurrency_listbox']/span/span

${dpdNumbersFormat}      //span[@aria-owns='DecimalsNumbers_listbox']/span/span
${dpdNumbersFormatPrefix}       //span[@aria-owns='DecimalsNumbersPrefix_listbox']/span/span
${chbNumbersThousandSeparator}      DecimalsNumbersThousandSeparator
${dpdCurrenciesFormat}      //span[@aria-owns='DecimalsCurrencies_listbox']/span/span
${dpdCurrenciesFormatPrefix}        //span[@aria-owns='DecimalsCurrenciesPrefix_listbox']/span/span
${chbCurrenciesThousandSeparator}       DecimalsCurrenciesThousandSeparator
${dpdPercentageFormat}      //span[@aria-owns='DecimalsPercentages_listbox']/span/span
${dpdPercentageFormatPrefix}        //span[@aria-owns='DecimalsPercentagesPrefix_listbox']/span/span
${chbPercentageThousandSeparator}       DecimalsPercentagesThousandSeparator

${dpdexportLines}       //span[@aria-owns='DefaultExportLines_listbox']/span/span
${chbSAPChooser}        sap_fields_in_chooser
${chbSAPHeader}     sap_fields_in_header
${chbDefaultStarreddField}      default_Starred_Fields
${chbDefaultSuggestedField}      default_Suggested_Fields
${chbCompressedListHeader}      compressed_list_header

${chbBPP2P}     P2P
${chbBPS2D}     S2D
${chbBPO2C}     O2C
${chbBPF2R}     F2R
${chbBPPM}     PM
${chbBPQM}     QM
${chbBPHCM}     HCM
${chbBPGRC}     GRC
${chbBPIT}     IT

${chbAutoExecuteItems}      auto_execute_items_on_login
${dpdDefaultSettingSet}     //span[@aria-owns='DefaultEnum_listbox']/span/span



*** Keywords ***
Click Set Default Setting For Business Process Bar
    [Arguments]    ${businessProcessName}
    Wait Until Page Contains Element    ${divDefaultSettingForBusinessProcessBar}
    Wait Until Element Contains    ${divDefaultSettingForBusinessProcessBar}    ${businessProcessName}
    Click Element    ${divDefaultSettingForBusinessProcessBar} div:contains("${businessProcessName}")

Save User Defaults
    Wait Until Page Contains Element    ${btnSaveUserDefaults}
    Wait MC Progress Bar Closed
    Click Element    ${btnSaveUserDefaults}
    Wait MC Progress Bar Closed

Go to User Defaults page in MC
    Go To MC Page    Users/User%20defaults/
    Wait Until Page Contains    User default settings
    Wait MC Progress Bar Closed
    Sleep   1s

Get the Decimal Separator drop down selected Value
    ${text}     Get Text    ${dpdDecimalSeparator}
    [Return]      ${text}

Get the Thousands Separator drop down selected value
    ${text}     Get Text        ${dpdThousandsSeparator}
    [Return]      ${text}

Get the Date Order drop down selected value
    ${text}     Get Text        ${dpdDateOrder}
    [Return]      ${text}

Get the Day Format drop down selected value
    ${text}     Get Text        ${dpdDayFormat}
    [Return]      ${text}

Get the Month Format drop down selected value
    ${text}     Get Text        ${dpdMonthFormat}
    [Return]      ${text}

Get the Year Format drop down selected value
    ${text}     Get Text        ${dpdYearFormat}
    [Return]      ${text}

Get the Date Separator drop down selected value
    ${text}     Get Text        ${dpdDateSeparator}
    [Return]    ${text}

Get the Time Format drop down selected value
    ${text}     Get Text        ${dpdTimeFormat}
    [Return]      ${text}

Get the Time Separator drop down selected value
    ${text}     Get Text        ${dpdTimeSeparator}
    [Return]  ${text}

Get the Default Setting for language drop down selected value
    ${text}     Get Text        ${dpdDefaultLanguage}
    [Return]      ${text}

Get the Default setting for currency drop down selected value
    ${text}     Get Text        ${dpdDefaultCurrency}
    [Return]      ${text}

Get the Number format options selected value
    ${text}     Get Text        ${dpdNumbersFormat}
    ${text1}    Get Text        ${dpdNumbersFormatPrefix}
    ${chbox}    Is Element Checked  ${chbNumbersThousandSeparator}
    [Return]      ${text}     ${text1}    ${chbox}

Get the Currencies format options selected value
    ${text}     Get Text        ${dpdCurrenciesFormat}
    ${text1}    Get Text        ${dpdCurrenciesFormatPrefix}
    ${chbox}    Is Element Checked  ${chbCurrenciesThousandSeparator}
    [Return]      ${text}     ${text1}    ${chbox}

Get the Percentages format options selected value
    ${text}     Get Text        ${dpdPercentageFormat}
    ${text1}    Get Text        ${dpdPercentageFormatPrefix}
    ${chbox}    Is Element Checked  ${chbPercentageThousandSeparator}
    [Return]      ${text}     ${text1}    ${chbox}

Get the Default settings for export lines drop down selected value
    ${text}     Get Text        ${dpdexportLines}
    [Return]      ${text}

Get the SAP fields chooser option selected value
    ${chbox}    Is Element Checked  ${chbSAPChooser}
    [Return]      ${chbox}

Get the SAP fields in header option selected value
    ${chbox}    Is Element Checked  ${chbSAPHeader}
    [Return]      ${chbox}

Get the By default selected field option selected value
    ${chbox}    Is Element Checked  ${chbDefaultStarreddField}
    ${chbox1}    Is Element Checked  ${chbDefaultSuggestedField}
    [Return]      ${chbox}    ${chbox1}

Get the Compressed list header option selected value
    ${chbox}    Is Element Checked  ${chbCompressedListHeader}
    [Return]      ${chbox}

Get the Default setting for Business Processes selected value
    ${chbox}    Is Element Checked  ${chbBPP2P}
    ${chbox1}    Is Element Checked  ${chbBPS2D}
    ${chbox2}    Is Element Checked  ${chbBPO2C}
    ${chbox3}    Is Element Checked  ${chbBPF2R}
    ${chbox4}    Is Element Checked  ${chbBPPM}
    ${chbox5}    Is Element Checked  ${chbBPQM}
    ${chbox6}    Is Element Checked  ${chbBPHCM}
    ${chbox7}    Is Element Checked  ${chbBPGRC}
    ${chbox8}    Is Element Checked  ${chbBPIT}
    [Return]      ${chbox}    ${chbox1}   ${chbox2}   ${chbox3}   ${chbox4}   ${chbox5}   ${chbox6}   ${chbox7}   ${chbox8}

Get the Auto execute items on login option selected value
    ${chbox}    Is Element Checked  ${chbAutoExecuteItems}
    [Return]      ${chbox}

Get the Default settings for set option selected value
    ${text}     Get Text        ${dpdDefaultSettingSet}
    [Return]      ${text}

Select the Decimal Separator drop down Value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDecimalSeparator}  ${dpdValue}

Select the Thousands Separator drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdThousandsSeparator}   ${dpdValue}   

Select the Date Order drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDateOrder}   ${dpdValue}

Select the Day Format drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDayFormat}   ${dpdValue}

Select the Month Format drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdMonthFormat}   ${dpdValue}

Select the Year Format drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdYearFormat}   ${dpdValue}

Select the Date Separator drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDateSeparator}   ${dpdValue}

Select the Time Format drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdTimeFormat}   ${dpdValue}

Select the Time Separator drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdTimeSeparator}   ${dpdValue}

Select the Default Setting for language drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDefaultLanguage}   ${dpdValue}

Select the Default setting for currency drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDefaultCurrency}   ${dpdValue}

Select the Number format options value
    [Arguments]     ${dpdValue}     ${dpdValue1}    ${chbOption}
    Select Dropdown By InnerText  ${dpdNumbersFormat}   ${dpdValue}
    Select Dropdown By InnerText  ${dpdNumbersFormatPrefix}   ${dpdValue1}
    Log     ${chbOption}
    Set Checkbox  ${chbNumbersThousandSeparator}    ${chbOption}

Select the Currencies format options value
    [Arguments]     ${dpdValue}     ${dpdValue1}    ${chbOption}
    Select Dropdown By InnerText  ${dpdCurrenciesFormat}   ${dpdValue}
    Select Dropdown By InnerText  ${dpdCurrenciesFormatPrefix}   ${dpdValue1}
    Set Checkbox  ${chbCurrenciesThousandSeparator}    ${chbOption}

Select the Percentages format options value
    [Arguments]     ${dpdValue}     ${dpdValue1}    ${chbOption}
    Select Dropdown By InnerText  ${dpdPercentageFormat}   ${dpdValue}
    Select Dropdown By InnerText  ${dpdPercentageFormatPrefix}   ${dpdValue1}
    Set Checkbox  ${chbPercentageThousandSeparator}    ${chbOption}

Select the Default settings for export lines drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdexportLines}   ${dpdValue}

Select the SAP fields chooser option check box
    [Arguments]     ${chbOption}
    Set Checkbox  ${chbSAPChooser}    ${chbOption}
    log     ${chbOption}

Select the SAP fields in header option check box
    [Arguments]     ${chbOption}
    Set Checkbox  ${chbSAPHeader}    ${chbOption}

Select the By default selected field option check box
    [Arguments]     ${chbOption}    ${chbOption1}
    Set Checkbox  ${chbDefaultStarreddField}    ${chbOption}
    Set Checkbox  ${chbDefaultSuggestedField}    ${chbOption1}

Select the Compressed list header option check box
    [Arguments]     ${chbOption}
    Set Checkbox  ${chbCompressedListHeader}    ${chbOption}

Select the Default setting for Business Processes check box
    [Arguments]     ${chbOption}    ${chbOption1}   ${chbOption2}   ${chbOption3}   ${chbOption4}   ${chbOption5}   ${chbOption6}   ${chbOption7}   ${chbOption8}
    Set Checkbox  ${chbBPP2P}    ${chbOption}
    Set Checkbox  ${chbBPS2D}    ${chbOption1}
    Set Checkbox  ${chbBPO2C}    ${chbOption2}
    Set Checkbox  ${chbBPF2R}    ${chbOption3}
    Set Checkbox  ${chbBPPM}    ${chbOption4}
    Set Checkbox  ${chbBPQM}    ${chbOption5}
    Set Checkbox  ${chbBPHCM}    ${chbOption6}
    Set Checkbox  ${chbBPGRC}    ${chbOption7}
    Set Checkbox  ${chbBPIT}    ${chbOption8}
    
Select the Auto execute items on login check box
    [Arguments]     ${chbOption}
    Set Checkbox  ${chbAutoExecuteItems}    ${chbOption}

Select the Default settings for set option drop down value
    [Arguments]     ${dpdValue}
    Select Dropdown By InnerText  ${dpdDefaultSettingSet}   ${dpdValue}